import { connectDB } from '@/lib/mongodb';
import { Driver } from '@/models/Driver';
import { notFound } from 'next/navigation';

async function getPendingDrivers(id?: string) {
  await connectDB();

  if (id) {
    const driver = await Driver.findById(id).lean();
    return { single: driver, pending: [] };
  }

  const pending = await Driver.find({ isVerified: false, isActive: true })
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  return { single: null, pending };
}

export default async function AdminVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const { single: driver, pending } = await getPendingDrivers(id);

  // Single driver review view
  if (id) {
    if (!driver) return notFound();

    const d = driver as typeof driver & { _id: unknown };

    return (
      <div style={{ padding: '2rem', maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <a href="/admin/verify" style={{ color: '#888', textDecoration: 'none', fontSize: 13 }}>← Back</a>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Driver Verify Karein</h1>
        </div>

        {/* Driver info card */}
        <div style={{ background: '#111', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, background: '#F5C400', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#111', flexShrink: 0 }}>
            {d.avatarInitials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{d.firstName} {d.lastName}</div>
            <div style={{ color: '#aaa', fontSize: 12 }}>{d.phone}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ background: d.isVerified ? '#dcfce7' : '#fff5cc', color: d.isVerified ? '#15803d' : '#7a5800', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                {d.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle info */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Vehicle Info</div>
          {[
            ['Type', (d.vehicleType as string)?.toUpperCase()],
            ['Model', d.vehicleModel],
            ['Plate', d.vehiclePlate],
            ['Color', d.vehicleColor],
            ['Year', String(d.vehicleYear)],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>
              <span style={{ color: '#888' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Documents</div>
          {[
            ['CNIC Number', d.cnicNumber],
            ['License Number', d.licenseNumber],
            ['License Expiry', d.licenseExpiry ? new Date(d.licenseExpiry as string).toLocaleDateString('en-PK') : 'N/A'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>
              <span style={{ color: '#888' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value as string}</span>
            </div>
          ))}

          <div style={{ marginTop: 10, fontSize: 12, color: '#aaa' }}>
            Verify CNIC: <a href="https://id.nadra.gov.pk/e-verisys" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>NADRA e-Verisys →</a>
            <br />
            Verify License: <a href="https://dlims.punjab.gov.pk" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>DLIMS Punjab →</a>
            <br />
            Verify Vehicle: <a href="https://mtmis.excise.punjab.gov.pk" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>MTMIS Punjab →</a>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <form action={`/api/admin/drivers/${String(d._id)}/action`} method="POST">
            <input type="hidden" name="action" value="approve" />
            <button type="submit" style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              ✓ Approve Driver
            </button>
          </form>
          <form action={`/api/admin/drivers/${String(d._id)}/action`} method="POST">
            <input type="hidden" name="action" value="reject" />
            <button type="submit" style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: '2px solid #fca5a5', borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              ✕ Reject
            </button>
          </form>
        </div>

        <form action={`/api/admin/drivers/${String(d._id)}/action`} method="POST">
          <input type="hidden" name="action" value="suspend" />
          <input name="reason" placeholder="Suspension reason (required for suspend)..." style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid #e5e5e5', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
          <button type="submit" style={{ width: '100%', background: '#fff', color: '#dc2626', border: '2px solid #fca5a5', borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            🔒 Suspend Driver
          </button>
        </form>
      </div>
    );
  }

  // Pending list view
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Pending Verifications</h1>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>{pending.length} drivers waiting</p>
      </div>

      {pending.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Sab drivers verify ho gaye!</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Koi pending verification nahi</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pending.map((d) => (
            <div key={String(d._id)} style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #fff5cc', padding: '1rem', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, background: '#F5C400', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#111', flexShrink: 0 }}>
                {d.avatarInitials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{d.firstName} {d.lastName}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{d.phone} • {d.vehicleModel} • {d.vehiclePlate}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                  Applied: {new Date(d.createdAt as string).toLocaleDateString('en-PK')}
                </div>
              </div>
              <a
                href={`/admin/verify?id=${String(d._id)}`}
                style={{ background: '#111', color: '#F5C400', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                Review →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
