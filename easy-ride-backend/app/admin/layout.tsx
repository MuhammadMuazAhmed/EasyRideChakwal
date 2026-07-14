import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Easy Ride Chakwal — Admin',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminSecret = cookieStore.get('admin_secret')?.value;

  if (adminSecret !== process.env.ADMIN_SECRET) {
    redirect('/admin/login');
  }

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <aside
            style={{
              width: 220,
              background: '#111',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem 0',
              flexShrink: 0,
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              zIndex: 10,
            }}
          >
            {/* Logo */}
            <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  background: '#F5C400',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 18, color: '#111' }}>E</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#111' }}>Easy Ride</div>
                  <div style={{ fontSize: 10, color: '#7a5800', fontWeight: 600 }}>
                    Admin Panel
                  </div>
                </div>
              </div>
            </div>

            {/* Nav links */}
            {[
              { href: '/admin', icon: '⊞', label: 'Dashboard' },
              { href: '/admin/drivers', icon: '🚗', label: 'Drivers' },
              { href: '/admin/verify', icon: '✅', label: 'Verify Drivers' },
              { href: '/admin/rides', icon: '📋', label: 'Ride Logs' },
              { href: '/admin/revenue', icon: '💰', label: 'Revenue' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 20px',
                  color: '#ccc',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    'rgba(245,196,0,0.12)';
                  (e.currentTarget as HTMLElement).style.color = '#F5C400';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#ccc';
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </a>
            ))}

            {/* Logout at bottom */}
            <div style={{ marginTop: 'auto', padding: '0 1.25rem' }}>
              <form action="/admin/logout" method="POST">
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'rgba(220,38,38,0.15)',
                    border: '1px solid rgba(220,38,38,0.3)',
                    borderRadius: 8,
                    color: '#fca5a5',
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  🚪 Logout
                </button>
              </form>
            </div>
          </aside>

          {/* Main content */}
          <main style={{ marginLeft: 220, flex: 1, background: '#f5f5f5', minHeight: '100vh' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
