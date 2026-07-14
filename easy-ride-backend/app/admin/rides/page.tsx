import { connectDB } from '@/lib/mongodb';
import { Ride } from '@/models/Ride';

async function getRides(status?: string, page = 1) {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (status && status !== 'all') query.status = status;

  const limit = 25;

  const [rides, total] = await Promise.all([
    Ride.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('riderId', 'firstName lastName phone')
      .populate('driverId', 'firstName lastName phone vehiclePlate')
      .lean(),
    Ride.countDocuments(query),
  ]);

  return { rides, total, pages: Math.ceil(total / limit) };
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  searching: { bg: '#dbeafe', text: '#1d4ed8' },
  driver_assigned: { bg: '#ede9fe', text: '#6d28d9' },
  driver_en_route: { bg: '#fff5cc', text: '#7a5800' },
  driver_arrived: { bg: '#ffedd5', text: '#9a3412' },
  in_progress: { bg: '#dcfce7', text: '#15803d' },
  completed: { bg: '#f0fdf4', text: '#166534' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
  no_driver: { bg: '#f1f5f9', text: '#64748b' },
};

export default async function AdminRidesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? '1');
  const { rides, total, pages } = await getRides(status, page);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Ride Logs</h1>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>{total} total rides</p>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['all', 'searching', 'in_progress', 'completed', 'cancelled'].map((s) => (
          <a
            key={s}
            href={s === 'all' ? '/admin/rides' : `/admin/rides?status=${s}`}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: (status === s) || (!status && s === 'all') ? '#111' : '#fff',
              color: (status === s) || (!status && s === 'all') ? '#F5C400' : '#555',
              border: '1px solid #e5e5e5',
              textDecoration: 'none',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
            }}
          >
            {s.replace('_', ' ')}
          </a>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#111' }}>
              {['Ride ID', 'Rider', 'Driver', 'Route', 'Fare', 'Status', 'Date'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rides.map((ride, i) => {
              const rider = ride.riderId as { firstName: string; lastName: string; phone: string } | null;
              const driver = ride.driverId as { firstName: string; lastName: string; vehiclePlate: string } | null;
              const statusStyle = STATUS_COLORS[ride.status] ?? { bg: '#f5f5f5', text: '#555' };

              return (
                <tr key={String(ride._id)} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
                    #{String(ride._id).slice(-6).toUpperCase()}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>
                    <div style={{ fontWeight: 600 }}>{rider ? `${rider.firstName} ${rider.lastName}` : 'N/A'}</div>
                    <div style={{ color: '#aaa', fontSize: 11 }}>{rider?.phone}</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>
                    {driver ? (
                      <>
                        <div style={{ fontWeight: 600 }}>{driver.firstName} {driver.lastName}</div>
                        <span style={{ background: '#111', color: '#F5C400', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, letterSpacing: 1 }}>{driver.vehiclePlate}</span>
                      </>
                    ) : <span style={{ color: '#aaa' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, maxWidth: 180 }}>
                    <div style={{ color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ride.pickup.name} → {ride.destination.name}
                    </div>
                    <div style={{ color: '#aaa', marginTop: 2 }}>{ride.distance} km</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700 }}>
                    PKR {ride.fare || ride.estimatedFare}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: statusStyle.bg, color: statusStyle.text, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                      {ride.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>
                    {new Date(ride.createdAt as string).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rides.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600 }}>Koi ride nahi mili</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: '1rem', justifyContent: 'center' }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/rides?${status ? `status=${status}&` : ''}page=${p}`}
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: p === page ? '#111' : '#fff', color: p === page ? '#F5C400' : '#555', border: '1px solid #e5e5e5', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
