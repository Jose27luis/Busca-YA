import os
import re

import psycopg2
from flask import Flask, jsonify, request
from sentence_transformers import SentenceTransformer

MODELO = os.environ.get("VECTOR_MODELO", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
DSN = os.environ["VECTOR_DSN"]
OBJETIVO = int(os.environ.get("VECTOR_CHUNK", "800"))
SOLAPAMIENTO = int(os.environ.get("VECTOR_OVERLAP", "120"))

modelo = SentenceTransformer(MODELO)
DIM = modelo.get_sentence_embedding_dimension()
app = Flask(__name__)


def conectar():
    return psycopg2.connect(DSN)


def preparar_esquema() -> None:
    with conectar() as conn, conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
        cur.execute(
            f"""
            CREATE TABLE IF NOT EXISTS fragmento_embedding (
                id BIGSERIAL PRIMARY KEY,
                articulo_titulo TEXT NOT NULL,
                pageid INTEGER,
                fragmento_idx INTEGER NOT NULL,
                texto TEXT NOT NULL,
                embedding vector({DIM}) NOT NULL,
                creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
                UNIQUE (articulo_titulo, fragmento_idx)
            )
            """
        )
        cur.execute(
            "CREATE INDEX IF NOT EXISTS fragmento_embedding_hnsw "
            "ON fragmento_embedding USING hnsw (embedding vector_cosine_ops)"
        )


def fragmentar(texto: str) -> list[str]:
    parrafos = [p.strip() for p in re.split(r"\n\s*\n", texto) if p.strip()]
    fragmentos: list[str] = []
    actual = ""
    for parrafo in parrafos:
        if len(actual) + len(parrafo) + 1 <= OBJETIVO:
            actual = (actual + "\n" + parrafo).strip()
            continue
        if actual:
            fragmentos.append(actual)
            actual = ""
        if len(parrafo) <= OBJETIVO:
            actual = parrafo
        else:
            paso = max(1, OBJETIVO - SOLAPAMIENTO)
            for i in range(0, len(parrafo), paso):
                fragmentos.append(parrafo[i:i + OBJETIVO])
    if actual:
        fragmentos.append(actual)
    return fragmentos


def literal_vector(vector) -> str:
    return "[" + ",".join(f"{x:.7f}" for x in vector) + "]"


@app.get("/salud")
def salud():
    with conectar() as conn, conn.cursor() as cur:
        cur.execute("SELECT count(*), count(DISTINCT articulo_titulo) FROM fragmento_embedding")
        fragmentos, articulos = cur.fetchone()
    return jsonify({"modelo": MODELO, "dim": DIM, "fragmentos": fragmentos, "articulos": articulos, "estado": "ok"})


@app.post("/indexar")
def indexar():
    datos = request.get_json(force=True)
    titulo = datos["titulo"]
    pageid = datos.get("pageid")
    fragmentos = fragmentar(datos.get("texto", ""))
    if not fragmentos:
        return jsonify({"titulo": titulo, "fragmentos": 0})
    vectores = modelo.encode(fragmentos, normalize_embeddings=True)
    with conectar() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM fragmento_embedding WHERE articulo_titulo = %s", (titulo,))
        for idx, (texto, vector) in enumerate(zip(fragmentos, vectores)):
            cur.execute(
                "INSERT INTO fragmento_embedding (articulo_titulo, pageid, fragmento_idx, texto, embedding) "
                "VALUES (%s, %s, %s, %s, %s::vector)",
                (titulo, pageid, idx, texto, literal_vector(vector)),
            )
    return jsonify({"titulo": titulo, "fragmentos": len(fragmentos)})


@app.post("/buscar")
def buscar():
    datos = request.get_json(force=True)
    consulta = datos["consulta"]
    k = int(datos.get("k", 5))
    vector = literal_vector(modelo.encode(consulta, normalize_embeddings=True))
    with conectar() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT articulo_titulo, pageid, texto, 1 - (embedding <=> %s::vector) AS score "
            "FROM fragmento_embedding ORDER BY embedding <=> %s::vector LIMIT %s",
            (vector, vector, k),
        )
        filas = cur.fetchall()
    resultados = [
        {"titulo": t, "pageid": p, "fragmento": texto, "score": round(float(score), 4)}
        for t, p, texto, score in filas
    ]
    return jsonify({"resultados": resultados})


preparar_esquema()
