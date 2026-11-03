import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'دَفْتَر | إدارة ديون وسداد الزبائن',
  description: 'نظام إدارة وتوثيق ديون وسداد الزبائن لنقاط البيع مع التوثيق المباشر برمز QR.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'دَفْتَر',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen antialiased font-sans">
        <div className="w-full min-h-screen flex flex-col">
          {children}
        </div>

        {/* Cache Busting & Service Worker Cleanup to prevent ChunkLoadError */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var r of registrations) { r.unregister(); }
                });
              }
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (var name of names) { caches.delete(name); }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
