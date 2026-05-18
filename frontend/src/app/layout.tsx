import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NebulaGate Protocol',
  description: 'Programmable on-chain access control for the multi-chain internet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {children}
      </body>
    </html>
  );
}
