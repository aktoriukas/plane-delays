import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '✈️ Plane Delay Bets',
  description: 'EU261 compensation arbitrage tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: '#0a0a0f', color: '#e8e8f0', minHeight: '100vh' }}>
        <nav style={{ borderBottom: '1px solid #1e1e2e', padding: '0 24px', display: 'flex', alignItems: 'center', height: '56px', gap: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#e8e8f0', fontWeight: 700, fontSize: '18px' }}>
            ✈️ Plane Delay Bets
          </Link>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#9999aa', fontSize: '14px' }}>Dashboard</Link>
            <Link href="/history" style={{ textDecoration: 'none', color: '#9999aa', fontSize: '14px' }}>History</Link>
            <Link href="/stats" style={{ textDecoration: 'none', color: '#9999aa', fontSize: '14px' }}>Stats</Link>
          </div>
        </nav>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
