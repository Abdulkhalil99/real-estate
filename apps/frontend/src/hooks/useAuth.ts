'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authHelper } from '@/lib/auth';
import { authApi, getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setUser(authHelper.getUser()); setLoading(false); }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await authApi.login(email, password);
      authHelper.saveSession(data); setUser(data.user);
      toast.success('Welcome back, ' + data.user.firstName + '!');
      router.push('/');
    } catch (err) { toast.error(getErrorMessage(err)); throw err; }
    finally { setLoading(false); }
  }, [router]);

  const register = useCallback(async (formData: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    try {
      setLoading(true);
      const data = await authApi.register(formData);
      authHelper.saveSession(data); setUser(data.user);
      toast.success('Account created!'); router.push('/');
    } catch (err) { toast.error(getErrorMessage(err)); throw err; }
    finally { setLoading(false); }
  }, [router]);

  const logout = useCallback(async () => {
    try { const rt = authHelper.getRefreshToken(); if (rt) await authApi.logout(rt); } catch {}
    authHelper.clearSession(); setUser(null);
    toast.success('Logged out'); router.push('/');
  }, [router]);

  return {
    user, loading,
    isLoggedIn: !!user,
    isAdmin:    user?.role === 'ADMIN',
    isAgent:    user?.role === 'AGENT' || user?.role === 'ADMIN',
    login, register, logout,
  };
}
