import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'База номеров',
  description: 'Ищи, комментируй и проверяй, да да',
  icons: {
    icon: [
      {
        url: '/icon.png',
        href: '/icon.png',
      }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}