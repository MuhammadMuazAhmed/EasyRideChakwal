import { connectDB } from '@/lib/mongodb';
import { Ride } from '@/models/Ride';
import { Driver } from '@/models/Driver';

async function getRevenueData() {
  await connectDB();

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [todayAgg, weekAgg, monthAgg, totalAgg, dailyBreakdown, topDrivers] = await Promise.all([
    Ride.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, revenue: { $sum: '$fare' }, count: { $sum: 1 } } },
    ]),
    Ride.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: weekStart } } },
      { $group: { _id: null, revenue: { $sum: '$fare' }, count: { $sum: 1 } } },
    ]),
    Ride.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, revenue: { $sum: '$fare' }, count: { $sum: 1 } } },
    ]),
    Ride.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, revenue: { $sum: '$fare' }, count: { $sum: 1 } } },
    ]),
    Ride.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$fare' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Driver.find({ isActive: true })
      .sort({ totalEarnings: -1 })
      .limit(5)
      .select('firstName lastName vehiclePlate totalTrips totalEarnings rating')
      .lean(),
  ]);

  return {
    today: { revenue: todayAgg[0]?.revenue ?? 0, count: todayAgg[0]?.count ?? 0 },
    week: { revenue: weekAgg[0]?.revenue ?? 0, count: weekAgg[0]?.count ?? 0 },
    month: { revenue: monthAgg[0]?.revenue ?? 0, count: monthAgg[0]?.count ?? 0 },
    total: { revenue: totalAgg[0]?.revenue ?? 0, count: totalAgg[0]?.count ?? 0 },
    dailyBreakdown: dailyBreakdown as { _id: string; revenue: number; count: number }[],
    topDrivers,
  };
}

const COMMISSION = 0.15;

export default async function AdminRevenuePage() {
  const data = await getRevenueData();
  const maxDaily = Math.max(...data.dailyBreakdown.map((d) => d.revenue), 1);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Revenue Dashboard</h1>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>Platform commission: 15%</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Today Revenue', value: data.today.revenue, rides: data.today.count },
          { label: 'This Week', value: data.week.revenue, rides: data.week.count },
          { label: 'This Month', value: data.month.revenue, rides: data.month.count },
          { label: 'All Time', value: data.total.revenue, rides: data.total.count },
        ].map((item) => (
          <div key={item.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '1.25rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111' }}>PKR {item.value.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{item.rides} rides</div>
            <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
              Platform: PKR {Math.round(item.value * COMMISSION).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Daily chart */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: '1rem' }}>Last 7 Days</div>
        {data.dailyBreakdown.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>No data yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.dailyBreakdown.map((day) => (
              <div key={day._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: '#888', width: 80, flexShrink: 0 }}>
                  {new Date(day._id).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                  <div style={{ background: '#F5C400', height: '100%', width: `${(day.revenue / maxDaily) * 100}%`, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                    {(day.revenue / maxDaily) > 0.3 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#7a5800' }}>PKR {day.revenue.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, width: 80, textAlign: 'right', color: '#111' }}>
                  PKR {day.revenue.toLocaleString()}
                </span>
                <span style={{ fontSize: 10, color: '#aaa', width: 50, textAlign: 'right' }}>
                  {day.count} rides
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top earners */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', padding: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: '1rem' }}>Top Earning Drivers</div>
        {data.topDrivers.length === 0 ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '1rem' }}>No completed rides yet</div>
        ) : (
          <div>
            {data.topDrivers.map((driver, i) => (
              <div key={String(driver._id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < data.topDrivers.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <div style={{ width: 28, height: 28, background: i === 0 ? '#F5C400' : '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0, color: i === 0 ? '#111' : '#888' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{driver.firstName} {driver.lastName}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{driver.totalTrips} trips • ★ {(driver.rating as number).toFixed(1)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>PKR {(driver.totalEarnings as number).toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>total earned</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
