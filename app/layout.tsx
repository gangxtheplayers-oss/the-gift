import type {Metadata} from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Forever & Always | A Gift For You',
  description: 'An enchanting, interactive digital love sanctuary and romantic anniversary gift with interactive journey milestones, love letters, captured memories, and music box.',
  openGraph: {
    title: 'Forever & Always | A Gift For You',
    description: 'An enchanting, interactive digital love sanctuary and romantic anniversary gift with interactive journey milestones, love letters, captured memories, and music box.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forever & Always | A Gift For You',
    description: 'An enchanting, interactive digital love sanctuary and romantic anniversary gift with interactive journey milestones, love letters, captured memories, and music box.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#0B0C10] text-[#E0E2EC] min-h-screen selection:bg-rose-500/30 selection:text-rose-200" suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
