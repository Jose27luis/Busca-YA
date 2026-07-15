import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth',
  imports: [RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly modo = signal<'login' | 'registro'>('login');
  readonly nombre = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal('');
  readonly enviando = signal(false);

  enviar(): void {
    if (this.enviando()) {
      return;
    }
    this.error.set('');
    this.enviando.set(true);
    const obs =
      this.modo() === 'login'
        ? this.auth.login(this.email(), this.password())
        : this.auth.registro(this.nombre(), this.email(), this.password());

    obs.subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => {
        this.error.set(this.mensajeError(e));
        this.enviando.set(false);
      },
    });
  }

  private mensajeError(e: unknown): string {
    const err = e as { error?: { message?: string; errors?: Record<string, string[]> } };
    const primero = err?.error?.errors ? Object.values(err.error.errors)[0]?.[0] : undefined;
    return primero ?? err?.error?.message ?? 'No se pudo completar la operación.';
  }
}
