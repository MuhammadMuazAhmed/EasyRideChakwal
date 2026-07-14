import { connectDB } from '@/lib/mongodb';
import { Driver } from '@/models/Driver';

async function getDrivers(status?: string, search?: string) {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (status === 'verified') query.isVerified = true;
  if (status === 'pending') { query.isVerified = false; query.isActive = true; }
  if (status === 'suspended') query.isSuspended = true;
  if (status === 'online') query.isOnline = true;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { vehiclePlate: { $regex: search, $options: 'i' } },
    ];
  }

  const drivers = await Driver.find(query)
    .select('firstName lastName phone vehicleType vehicleModel vehiclePlate rating totalTrips isVerified isOnline isSuspended createdAt')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return drivers;
}

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;
  const drivers = await getDrivers(status, search);

  const statusColors: Record<string, string> = {
    verified: '#dcfce7',
    pending: '#fff5cc',
    suspended: '#fee2e2',
    online: '#dbeafe',
  };

  const statusTextColors: Record<string, string> = {
    verified: '#15803d',
    pending: '#7a5800',
    suspended: '#dc2626',
    online: '#1d4ed8',
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Driver Management</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>{drivers.length} drivers found</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <form method="GET" style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          {['all', 'verified', 'pending', 'suspended', 'online'].map((s) => (
            <a
              key={s}
              href={s === 'all' ? '/admin/drivers' : `/admin/drivers?status=${s}`}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: status === s || (!status && s === 'all') ? '#111' : '#fff',
                color: status === s || (!status && s === 'all') ? '#F5C400' : '#555',
                border: '1px solid #e5e5e5',
                textDecoration: 'none',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </a>
          ))}
          <input
            name="search"
            defaultValue={search}
            placeholder="Search name, phone, plate..."
            style={{ flex: 1, minWidth: 200, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e5e5e5', fontSize: 13, outline: 'none' }}
          />
          <button type="submit" style={{ padding: '6px 16px', background: '#111', color: '#F5C400', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#111', color: '#fff' }}>
              {['Driver', 'Phone', 'Vehicle', 'Plate', 'Rating', 'Trips', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver, i) => {
              const driverStatus = driver.isSuspended ? 'suspended' : driver.isVerified ? (driver.isOnline ? 'online' : 'verified') : 'pending';
              const statusLabel = driver.isSuspended ? 'Suspended' : driver.isVerified ? (driver.isOnline ? 'Online' : 'Active') : 'Pending';

              return (
                <tr key={String(driver._id)} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{driver.firstName} {driver.lastName}</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#555' }}>{driver.phone}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#555', textTransform: 'capitalize' }}>{driver.vehicleType} — {driver.vehicleModel}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: '#111', color: '#F5C400', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: 1 }}>{driver.vehiclePlate}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#F5C400' }}>★ {driver.rating?.toFixed(1)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{driver.totalTrips}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: statusColors[driverStatus] ?? '#f5f5f5', color: statusTextColors[driverStatus] ?? '#555', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10 }}>
                      {statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`/admin/verify?id=${driver._id}`} style={{ background: '#111', color: '#F5C400', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, textDecoration: 'none' }}>
                        Review
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {drivers.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600 }}>Koi driver nahi mila</div>
          </div>
        )}
      </div>
    </div>
  );
}
