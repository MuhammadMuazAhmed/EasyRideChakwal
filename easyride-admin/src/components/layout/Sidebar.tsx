import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  MapPin,
  ClipboardList,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Megaphone,
  Bell,
  LifeBuoy,
  BarChart3,
  FileDown,
  Settings,
  ScrollText,
  UserCog,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  soon?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Drivers', to: '/drivers', icon: Car },
      { label: 'Driver Verification', to: '/drivers?status=pending', icon: ShieldCheck },
      { label: 'Riders', to: '/riders', icon: Users },
      { label: 'Trips', to: '/rides', icon: Route },
      { label: 'Ride Requests', to: '/rides?status=searching', icon: ClipboardList },
      { label: 'Live Map', to: '/live-map', icon: MapPin, soon: true },
    ],
  },
  {
    label: 'Growth',
    items: [
      { label: 'Payments', to: '/payments', icon: Wallet, soon: true },
      { label: 'Revenue', to: '/revenue', icon: TrendingUp, soon: true },
      { label: 'Promotions', to: '/promotions', icon: Megaphone, soon: true },
      { label: 'Notifications', to: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', to: '/analytics', icon: BarChart3, soon: true },
      { label: 'Reports', to: '/reports', icon: FileDown, soon: true },
      { label: 'Support', to: '/support', icon: LifeBuoy, soon: true },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'System Logs', to: '/system', icon: ScrollText },
      { label: 'Admins', to: '/admins', icon: UserCog, soon: true },
    ],
  },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">E</div>
            <div>
              <p className="text-sm font-extrabold leading-tight">EasyRide</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ops Console</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="rounded-md p-1 text-muted-foreground hover:bg-secondary lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
          {NAV.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-primary/12 [color:hsl(var(--primary))]' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.soon && (
                      <span className="ml-auto rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
