import { Moon, Sun, Info } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useThemeStore } from '@/store/themeStore';

export function SettingsPage() {
  const { theme, toggle } = useThemeStore();

  return (
    <div>
      <PageHeader title="Settings" description="Console preferences and platform configuration." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Theme applies instantly and is remembered on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm font-medium">Dark mode</span>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggle} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fare Configuration</CardTitle>
            <CardDescription>Currently hardcoded in easy-ride-backend/lib/fare.ts (Chakwal city rates).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { label: 'Car', base: 50, perKm: 35, min: 80 },
              { label: 'Bike', base: 30, perKm: 20, min: 50 },
              { label: 'Qingqi', base: 40, perKm: 25, min: 60 },
            ].map((v) => (
              <div key={v.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-medium">{v.label}</span>
                <span className="text-muted-foreground">
                  Base PKR {v.base} · PKR {v.perKm}/km · Min PKR {v.min}
                </span>
              </div>
            ))}
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Editing fares from here needs a new endpoint (e.g. <span className="font-mono">PUT /api/admin/fare-config</span>) plus moving these
                constants from code into a DB-backed config. See BACKEND_REQUIREMENTS.md.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Commission</CardTitle>
            <CardDescription>Currently hardcoded at 15% in two places in easy-ride-backend.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-extrabold">15%</p>
              <p className="text-sm text-muted-foreground">
                Applied in <span className="font-mono">app/api/rides/[id]/complete/route.ts</span> and{' '}
                <span className="font-mono">app/admin/revenue/page.tsx</span>. Making this editable also needs a config endpoint.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
