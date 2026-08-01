import { createBrowserRouter } from 'react-router-dom';
import { Map, Wallet, TrendingUp, Megaphone, BarChart3, FileDown, LifeBuoy, UserCog } from 'lucide-react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ComingSoonPage } from '@/components/common/ComingSoonPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { DriversPage } from '@/features/drivers/DriversPage';
import { DriverDetailPage } from '@/features/drivers/DriverDetailPage';
import { RidersPage } from '@/features/riders/RidersPage';
import { RiderDetailPage } from '@/features/riders/RiderDetailPage';
import { RidesPage } from '@/features/rides/RidesPage';
import { RideDetailPage } from '@/features/rides/RideDetailPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { SystemPage } from '@/features/settings/SystemPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <DashboardPage /> },

      { path: '/drivers', element: <DriversPage /> },
      { path: '/drivers/:id', element: <DriverDetailPage /> },

      { path: '/riders', element: <RidersPage /> },
      { path: '/riders/:id', element: <RiderDetailPage /> },

      { path: '/rides', element: <RidesPage /> },
      { path: '/rides/:id', element: <RideDetailPage /> },

      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/system', element: <SystemPage /> },

      {
        path: '/live-map',
        element: (
          <ComingSoonPage
            title="Live Map"
            icon={Map}
            requiredEndpoints={[
              'Firebase RTDB read access from the browser (drivers/*/location), OR',
              'GET /api/admin/live/drivers — snapshot of all driver positions',
            ]}
            note="Driver locations already stream into Firebase RTDB in real time. The fastest path is reading that directly from the browser with the Firebase Web SDK — no new backend route needed, just RTDB security rules that allow admin reads."
          />
        ),
      },
      {
        path: '/payments',
        element: <ComingSoonPage title="Payments" icon={Wallet} requiredEndpoints={['GET /api/admin/payments', 'JazzCash / EasyPaisa merchant integration (not yet built per README)']} />,
      },
      {
        path: '/revenue',
        element: <ComingSoonPage title="Revenue" icon={TrendingUp} requiredEndpoints={['GET /api/admin/stats/revenue?range=today|week|month']} note="This data already exists — app/admin/revenue/page.tsx computes it server-side today. It just needs to be exposed as JSON." />,
      },
      { path: '/promotions', element: <ComingSoonPage title="Promotions" icon={Megaphone} requiredEndpoints={['Promo/coupon model + GET/POST /api/admin/promotions']} /> },
      { path: '/analytics', element: <ComingSoonPage title="Analytics" icon={BarChart3} requiredEndpoints={['GET /api/admin/stats/trips?groupBy=day|month', 'GET /api/admin/stats/heatmap']} /> },
      { path: '/reports', element: <ComingSoonPage title="Reports" icon={FileDown} requiredEndpoints={['GET /api/admin/reports/export?format=csv|pdf|xlsx']} /> },
      { path: '/support', element: <ComingSoonPage title="Support" icon={LifeBuoy} requiredEndpoints={['Support ticket model + GET/POST /api/admin/support-tickets']} /> },
      { path: '/admins', element: <ComingSoonPage title="Admins" icon={UserCog} requiredEndpoints={['Admin user model (roles) + GET/POST /api/admin/team', 'Replaces the single shared ADMIN_SECRET with per-person accounts']} /> },
    ],
  },
]);
