import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from '@/types';
import { getUserById } from '@/data/mockData';
import {
  CheckCircle2,
  FolderPlus,
  UserPlus,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import gsap from 'gsap';

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  task_completed: CheckCircle2,
  project_created: FolderPlus,
  member_added: UserPlus,
  status_changed: RefreshCw,
  comment_added: MessageSquare,
};

const activityColors = {
  task_completed: 'text-success bg-success/10',
  project_created: 'text-primary bg-primary/10',
  member_added: 'text-info bg-info/10',
  status_changed: 'text-warning bg-warning/10',
  comment_added: 'text-accent bg-accent/10',
};

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll('.activity-item');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          delay: 0.5,
          ease: 'power2.out'
        }
      );
    });

    return () => ctx.revert();
  }, [activities]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent ref={containerRef} className="space-y-4">
        {activities.map((activity) => {
          // Use populated user from API, or fallback to mock lookup if missing
          const user = activity.user || getUserById(activity.userId);
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div
              key={activity.id || (activity as any)._id}
              className="activity-item flex items-start gap-3 opacity-0"
            >
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{user?.name}</span>{' '}
                  <span className="text-muted-foreground">{activity.message}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
};
