'use client';
import { Toaster } from 'react-hot-toast';
export default function ToastProvider() {
  return (
    <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#fff', color: '#111', border: '1px solid #e5e7eb', fontSize: '14px' } }} />
  );
}
