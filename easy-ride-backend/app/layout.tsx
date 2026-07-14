import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Easy Ride Chakwal — API',
  description: 'Easy Ride Chakwal Backend API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
