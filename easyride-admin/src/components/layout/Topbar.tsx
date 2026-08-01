import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/store/themeStore';
import { useAuth } from '@/features/auth/useAuth';
import { titleCase } from '@/lib/utils';

function currentPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  const [, first] = pathname.split('/');
  return titleCase((first ?? 'dashboard').replace(/-/g, '_'));
}

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { theme, toggle } = useThemeStore();
  const { admin, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onOpenMobileNav} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-bold text-foreground sm:text-base">{currentPageTitle(location.pathname)}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors hover:bg-secondary">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{admin?.name?.slice(0, 2).toUpperCase() ?? 'AD'}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-semibold sm:inline">{admin?.name ?? 'Admin'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-semibold">{admin?.name ?? 'Admin'}</p>
              <p className="font-normal text-muted-foreground">{titleCase(admin?.role ?? 'admin')}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={logout}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
