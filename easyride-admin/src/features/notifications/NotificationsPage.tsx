import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterChips } from '@/components/common/FilterChips';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { sendNotification, type NotificationTarget } from '@/features/notifications/api';
import { ApiError } from '@/lib/api-client';

const TARGETS: { value: NotificationTarget; label: string }[] = [
  { value: 'all_riders', label: 'All Riders' },
  { value: 'all_drivers', label: 'All Drivers' },
  { value: 'everyone', label: 'Everyone' },
  { value: 'specific', label: 'Specific User' },
];

export function NotificationsPage() {
  const [target, setTarget] = useState<NotificationTarget>('all_riders');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const mutation = useMutation({
    mutationFn: () => sendNotification({ target, userId: target === 'specific' ? userId : undefined, title, body }),
    onSuccess: (res) => {
      toast.success(`Sent to ${res.sentCount} device${res.sentCount === 1 ? '' : 's'}`);
      setTitle('');
      setBody('');
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to send'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title || !body) return;
    if (target === 'specific' && !userId) {
      toast.error('Enter a user ID for a specific target');
      return;
    }
    mutation.mutate();
  }

  return (
    <div>
      <PageHeader title="Notifications" description="Broadcast a push notification via Firebase Cloud Messaging." />

      <Card className="max-w-xl">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Audience</Label>
              <FilterChips options={TARGETS} value={target} onChange={setTarget} />
            </div>

            {target === 'specific' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="userId">User ID (rider or driver Mongo _id)</Label>
                <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="65f1a2..." />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Weekend Offer! 🎉" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="body">Message</Label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={300}
                rows={4}
                required
                placeholder="Get 20% off your next ride this weekend..."
                className="flex w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-primary"
              />
              <p className="self-end text-[11px] text-muted-foreground">{body.length}/300</p>
            </div>

            <Button type="submit" loading={mutation.isPending} className="self-start">
              <Send /> Send Notification
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
