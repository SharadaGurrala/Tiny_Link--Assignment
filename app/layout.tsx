import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'TinyLink',
  description: 'URL Shortener App',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
