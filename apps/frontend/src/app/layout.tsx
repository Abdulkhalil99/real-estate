import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ToastProvider from '@/components/providers/ToastProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Real Estate Platform',
  description: 'Find your perfect property in Tunisia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
