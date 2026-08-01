import { useState, type FormEvent } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/features/auth/useAuth';

export function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [secret, setSecret] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!secret) return;
    login(secret);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground shadow-glow">
            E
          </div>
          <div>
            <h1 className="text-lg font-extrabold">EasyRide Admin</h1>
            <p className="text-xs text-muted-foreground">Chakwal Operations Console</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="secret">Admin password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="secret"
                    type="password"
                    required
                    autoFocus
                    placeholder="Enter admin password"
                    className="pl-9"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" size="lg" loading={isLoggingIn} className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            This calls <span className="font-mono">POST /api/admin/auth/login</span>, which needs to be added to
            easy-ride-backend first — see <span className="font-mono">BACKEND_REQUIREMENTS.md</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
