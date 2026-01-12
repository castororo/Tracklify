import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'primary' | 'success' | 'warning' | 'info';
  delay?: number;
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

export const KPICard = ({ title, value, icon: Icon, trend, color, delay = 0 }: KPICardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!cardRef.current || !valueRef.current) return;

    const ctx = gsap.context(() => {
      // Card entrance animation
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay, ease: 'power3.out' }
      );

      // Number count-up animation
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 1.5,
        delay: delay + 0.3,
        ease: 'power1.out',
        onUpdate: () => {
          if (valueRef.current) {
            valueRef.current.textContent = Math.round(obj.val).toString();
          }
        },
      });
    });

    return () => ctx.revert();
  }, [value, delay]);

  return (
    <Card ref={cardRef} className="glass-card hover-lift cursor-default opacity-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span ref={valueRef} className="text-3xl font-bold text-foreground">
                0
              </span>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className={cn('p-3 rounded-xl', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
