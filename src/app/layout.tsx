import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Landing Effects Studio | Premium ASCII & Pixel Workbench',
  description: 'Pro-grade workbench for generating animated ASCII and Pixel Reveal backgrounds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-accent selection:text-black">
        {children}
      </body>
    </html>
  );
}
