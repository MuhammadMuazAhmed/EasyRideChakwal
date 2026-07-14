import { connectDB } from '@/lib/mongodb';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';
import { User } from '@/models/User';

async function getStats() {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalRides,
    todayRides,
    activeRides,
    totalDrivers,
    onlineDrivers,
    pendingDrivers,
    totalRiders,
    todayRevenue,
  ] = await Promise.all([
    Ride.countDocuments(),
    Ride.countDocuments({ createdAt: { $gte: today } }),
    Ride.countDocuments({ status: { $in: ['searching', 'driver_assigned', 'driver_en_route', 'driver_arrived', 'in_progress'] } }),
    Driver.countDocuments({ isActive: true }),
    Driver.countDocuments({ isOnline: true }),
    Driver.countDocuments({ isVerified: false, isActive: true }),
    User.countDocuments({ isActive: true }),
    Ride.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$fare' } } },
    ]),
  ]);

  const revenue = (todayRevenue[0]?.total ?? 0) as number;
  const platformFee = Math.round(revenue * 0.15);

  return {
    totalRides,
    todayRides,
    activeRides,
    totalDrivers,
    onlineDrivers,
    pendingDrivers,
    totalRiders,
    todayRevenue: revenue,
    platformFee,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ background: '#F5C400', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, color: '#111' }}>E</div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Easy Ride Chakwal</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>Admin Dashboard</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Today Rides', value: stats.todayRides, color: '#F5C400', sub: `${stats.totalRides} total` },
          { label: 'Active Rides', value: stats.activeRides, color: '#16a34a', sub: 'Right now' },
          { label: 'Online Drivers', value: stats.onlineDrivers, color: '#2563eb', sub: `${stats.totalDrivers} total` },
          { label: 'Pending Verify', value: stats.pendingDrivers, color: stats.pendingDrivers > 0 ? '#dc2626' : '#16a34a', sub: 'Need review' },
          { label: 'Total Riders', value: stats.totalRiders, color: '#7c3aed', sub: 'Registered' },
          { label: "Today Revenue", value: `PKR ${stats.todayRevenue.toLocaleString()}`, color: '#111', sub: `PKR ${stats.platformFee.toLocaleString()} platform fee` },
        ].map((card) => (
          <div key={card.label} style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: '🚗 Driver Management', href: '/admin/drivers', desc: 'View, verify, suspend drivers' },
          { label: '📋 Ride Logs', href: '/admin/rides', desc: 'All trips with details' },
          { label: '✅ Verify Drivers', href: '/admin/verify', desc: `${stats.pendingDrivers} pending` },
          { label: '💰 Revenue', href: '/admin/revenue', desc: 'Earnings and payouts' },
        ].map((link) => (
          <a key={link.href} href={link.href} style={{ background: '#111', borderRadius: 12, padding: '1.25rem', color: '#fff', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{link.label}</div>
            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{link.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
