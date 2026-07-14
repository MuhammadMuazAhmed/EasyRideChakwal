export default function AdminLogin() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', sans-serif", background: '#111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: '#F5C400', width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, color: '#111', margin: '0 auto 12px' }}>E</div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Easy Ride Admin</div>
            <div style={{ color: '#555', fontSize: 12, marginTop: 4 }}>Chakwal Operations Panel</div>
          </div>

          <form action="/api/admin/login" method="POST">
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', color: '#555', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                Admin Password
              </label>
              <input
                type="password"
                name="secret"
                placeholder="Enter admin password"
                required
                style={{ width: '100%', background: '#111', border: '1.5px solid #333', borderRadius: 9, padding: '10px 12px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', background: '#F5C400', color: '#111', border: 'none', borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}
            >
              Login
            </button>
          </form>

          <div style={{ marginTop: 16, background: '#111', border: '1px solid #2a2a2a', borderRadius: 9, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <div style={{ fontSize: 10, color: '#444' }}>Access is logged. Unauthorized access is prohibited.</div>
          </div>
        </div>
      </body>
    </html>
  );
}
