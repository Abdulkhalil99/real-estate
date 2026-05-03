import Cookies from 'js-cookie';
import { User, AuthResponse } from '@/types';

export const authHelper = {
  saveSession(data: AuthResponse): void {
    Cookies.set('accessToken',  data.accessToken,  { expires: 1  });
    Cookies.set('refreshToken', data.refreshToken, { expires: 30 });
    localStorage.setItem('user', JSON.stringify(data.user));
  },
  clearSession(): void {
    Cookies.remove('accessToken'); Cookies.remove('refreshToken'); localStorage.removeItem('user');
  },
  getAccessToken():  string | undefined { return Cookies.get('accessToken');  },
  getRefreshToken(): string | undefined { return Cookies.get('refreshToken'); },
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  },
  isLoggedIn(): boolean { return !!Cookies.get('accessToken'); },
  isAgent(): boolean { const r = authHelper.getUser()?.role; return r === 'AGENT' || r === 'ADMIN'; },
  isAdmin(): boolean { return authHelper.getUser()?.role === 'ADMIN'; },
};
