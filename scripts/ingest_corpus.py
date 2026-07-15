#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_SOURCE_API = "https://es.wikipedia.org/w/api.php"
DEFAULT_MW_PATH = "/var/www/Busca-YA/mediawiki"
USER_AGENT = "BuscaYA-Research/0.1 (https://cms.net.pe; ingesta de corpus de investigacion)"


def _request(url, timeout):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8")


def api_json(api, params, timeout=60):
    query = urllib.parse.urlencode({**params, "format": "json", "formatversion": "2"})
    return json.loads(_request(f"{api}?{query}", timeout))


def category_pages(api, category, depth, delay, seen_cats):
    if category in seen_cats:
        return []
    seen_cats.add(category)
    titles, subcats, cont = [], [], {}
    while True:
        data = api_json(api, {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": category,
            "cmlimit": "500",
            **cont,
        })
        for member in data["query"]["categorymembers"]:
            if member["ns"] == 14:
                subcats.append(member["title"])
            elif member["ns"] == 0:
                titles.append(member["title"])
        if "continue" in data:
            cont = data["continue"]
            time.sleep(delay)
        else:
            break
    if depth > 0:
        for subcat in subcats:
            time.sleep(delay)
            titles.extend(category_pages(api, subcat, depth - 1, delay, seen_cats))
    return titles


def export_batch(api, titles, timeout=180):
    query = urllib.parse.urlencode({
        "action": "query",
        "export": "1",
        "exportnowrap": "1",
        "titles": "|".join(titles),
    })
    return _request(f"{api}?{query}", timeout)


def import_xml(mw_path, xml_file):
    run = Path(mw_path) / "maintenance" / "run.php"
    subprocess.run(
        ["sudo", "-u", "www-data", "php", str(run), "importDump", str(xml_file)],
        check=True,
    )


def local_page_count(mw_path):
    run = Path(mw_path) / "maintenance" / "run.php"
    result = subprocess.run(
        ["sudo", "-u", "www-data", "php", str(run), "showSiteStats"],
        capture_output=True, text=True,
    )
    return result.stdout.strip()


def main():
    parser = argparse.ArgumentParser(description="Ingesta de un corpus de Wikipedia a la wiki local Busca-YA")
    parser.add_argument("--category", default="Categoría:Inteligencia artificial", help="Categoría origen en la Wikipedia de --source-api")
    parser.add_argument("--source-api", default=DEFAULT_SOURCE_API, help="Endpoint api.php de la Wikipedia origen")
    parser.add_argument("--mw-path", default=DEFAULT_MW_PATH, help="Ruta de la instalación local de MediaWiki")
    parser.add_argument("--depth", type=int, default=0, help="Niveles de subcategorías a recorrer (0 = solo miembros directos)")
    parser.add_argument("--limit", type=int, default=0, help="Máximo de páginas a ingestar (0 = sin límite)")
    parser.add_argument("--batch-size", type=int, default=40, help="Páginas por lote de export/import")
    parser.add_argument("--delay", type=float, default=0.7, help="Pausa en segundos entre peticiones a Wikipedia")
    parser.add_argument("--work-dir", default="/tmp/buscaya-ingest", help="Directorio para los XML temporales")
    parser.add_argument("--dry-run", action="store_true", help="Solo listar las páginas, sin importar")
    args = parser.parse_args()

    print(f"Recuperando páginas de «{args.category}» (profundidad {args.depth})...", flush=True)
    titles = list(dict.fromkeys(category_pages(args.source_api, args.category, args.depth, args.delay, set())))
    if args.limit > 0:
        titles = titles[:args.limit]
    print(f"{len(titles)} páginas a ingestar.", flush=True)

    if args.dry_run:
        for title in titles:
            print(" -", title)
        return

    if not titles:
        print("Nada que ingestar.", file=sys.stderr)
        sys.exit(1)

    work = Path(args.work_dir)
    work.mkdir(parents=True, exist_ok=True)
    batches = [titles[i:i + args.batch_size] for i in range(0, len(titles), args.batch_size)]

    failed = []
    for index, batch in enumerate(batches, start=1):
        try:
            print(f"[{index}/{len(batches)}] exportando {len(batch)} páginas...", flush=True)
            xml_file = work / f"batch-{index:03d}.xml"
            xml_file.write_text(export_batch(args.source_api, batch), encoding="utf-8")
            print(f"[{index}/{len(batches)}] importando...", flush=True)
            import_xml(args.mw_path, xml_file)
            print(f"[{index}/{len(batches)}] ok", flush=True)
        except Exception as exc:
            print(f"[{index}/{len(batches)}] ERROR: {exc}", file=sys.stderr, flush=True)
            failed.append(index)
        time.sleep(args.delay)

    print("---", flush=True)
    print(local_page_count(args.mw_path), flush=True)
    if failed:
        print(f"Lotes con error: {failed}", file=sys.stderr, flush=True)
        sys.exit(1)
    print("Ingesta completada.", flush=True)


if __name__ == "__main__":
    main()
