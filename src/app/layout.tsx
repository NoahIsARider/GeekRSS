import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GeekRSS',
  description: 'Minimal hacker-style RSS reader with curated tech feeds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
