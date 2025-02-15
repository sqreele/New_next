import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/app/providers';
import { Toaster } from '@/app/components/ui/toaster';
import { UserProvider } from '@/app/lib/user-context';
import { PropertyProvider } from '@/app/lib/PropertyContext'; // Import the correct provider
import './globals.css';

// Initialize Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Metadata configuration
export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin Dashboard',
  },
  description: 'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.',
  keywords: ['admin', 'dashboard', 'nextjs', 'react', 'typescript'],
  authors: [
    {
      name: 'Your Name',
      url: 'https://your-website.com',
    },
  ],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-website.com',
    title: 'Admin Dashboard',
    description: 'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.',
    siteName: 'Admin Dashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin Dashboard',
    description: 'A user admin dashboard configured with Next.js, Postgres, NextAuth, Tailwind CSS, TypeScript, and Prettier.',
    creator: '@yourtwitter',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background`}>
        <AuthProvider>
          <UserProvider>
            <PropertyProvider>
              <main className="flex min-h-screen w-full flex-col">
                {children}
              </main>
              <Toaster />
            </PropertyProvider>
          </UserProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
