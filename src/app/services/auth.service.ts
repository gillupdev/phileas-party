import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  picture: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal(true);
  private readonly _checked = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly checked = this._checked.asReadonly();

  constructor(private http: HttpClient) {}

  checkAuth() {
    this._loading.set(true);
    return this.http.get<User>('/api/auth/user', { withCredentials: true }).pipe(
      tap(user => {
        this._user.set(user);
        this._loading.set(false);
        this._checked.set(true);
      }),
      catchError(() => {
        this._user.set(null);
        this._loading.set(false);
        this._checked.set(true);
        return of(null);
      })
    );
  }

  login() {
    window.location.href = '/api/auth/google';
  }

  logout() {
    return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this._user.set(null);
      }),
      catchError(() => {
        this._user.set(null);
        return of(null);
      })
    );
  }

  getUser() {
    return this._user();
  }
}
