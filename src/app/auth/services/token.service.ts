import { Injectable } from '@angular/core';
import type { Usuario } from '../models';

const ACCESS_TOKEN_KEY = 'marbella_access_token';
const USER_DATA_KEY = 'marbella_user_data';
const PERMISSIONS_KEY = 'marbella_permissions';

@Injectable({ providedIn: 'root' })
export class TokenService {
  // ─── Token ─────────────────────────────────────────────────────────────────

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }

  // ─── User Data ─────────────────────────────────────────────────────────────

  getUserData(): Usuario | null {
    const raw = localStorage.getItem(USER_DATA_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }

  setUserData(usuario: Usuario): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(usuario));
  }

  // ─── Permisos ──────────────────────────────────────────────────────────────

  getPermissions(): string[] {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  setPermissions(permisos: string[]): void {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permisos));
  }

  // ─── Clear All ─────────────────────────────────────────────────────────────

  clearAll(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
  }
}
