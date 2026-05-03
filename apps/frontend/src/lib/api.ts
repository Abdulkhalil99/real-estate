import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { Property, AuthResponse, PropertyFilters, PaginatedResponse, PropertyStats, Inquiry } from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const rt = Cookies.get('refreshToken');
        if (!rt) throw new Error('no refresh token');
        const { data } = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/refresh', { refreshToken: rt });
        Cookies.set('accessToken', data.data.accessToken, { expires: 1 });
        if (original.headers) original.headers.Authorization = 'Bearer ' + data.data.accessToken;
        return api(original);
      } catch {
        Cookies.remove('accessToken'); Cookies.remove('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) return error.response?.data?.error || error.message || 'Something went wrong';
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export const authApi = {
  register: async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', data); return res.data.data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { email, password }); return res.data.data;
  },
  logout: async (refreshToken: string): Promise<void> => { await api.post('/auth/logout', { refreshToken }); },
  getMe: async () => { const res = await api.get('/auth/me'); return res.data.data; },
  updateProfile: async (data: object) => { const res = await api.put('/auth/me', data); return res.data.data; },
};

export const propertyApi = {
  getAll: async (filters: PropertyFilters = {}): Promise<PaginatedResponse<Property>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.append(k, String(v)); });
    const res = await api.get('/properties?' + params); return res.data.data;
  },
  getFeatured: async (): Promise<Property[]> => { const res = await api.get('/properties/featured'); return res.data.data; },
  getStats:    async (): Promise<PropertyStats> => { const res = await api.get('/properties/stats');   return res.data.data; },
  getById:     async (id: string): Promise<Property> => { const res = await api.get('/properties/' + id); return res.data.data; },
  getMyListings: async (filters: PropertyFilters = {}): Promise<PaginatedResponse<Property>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.append(k, String(v)); });
    const res = await api.get('/properties/my/listings?' + params); return res.data.data;
  },
  create: async (data: object): Promise<Property> => { const res = await api.post('/properties', data); return res.data.data; },
  update: async (id: string, data: object): Promise<Property> => { const res = await api.put('/properties/' + id, data); return res.data.data; },
  updateStatus: async (id: string, status: string): Promise<Property> => { const res = await api.put('/properties/' + id + '/status', { status }); return res.data.data; },
  delete: async (id: string): Promise<void> => { await api.delete('/properties/' + id); },
};

export const inquiryApi = {
  create: async (data: { name: string; email: string; message: string; propertyId: string; phone?: string }): Promise<Inquiry> => {
    const res = await api.post('/inquiries', data); return res.data.data;
  },
  getAll: async (page = 1): Promise<PaginatedResponse<Inquiry>> => {
    const res = await api.get('/inquiries?page=' + page); return res.data.data;
  },
  updateStatus: async (id: string, status: string): Promise<Inquiry> => {
    const res = await api.put('/inquiries/' + id + '/status', { status }); return res.data.data;
  },
};

export default api;
