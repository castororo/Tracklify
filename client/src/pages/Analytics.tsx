import { useEffect, useState } from 'react';
import { ProductivityChart } from '@/components/charts/ProductivityChart';
import { ProjectCompletionChart } from '@/components/charts/ProjectCompletionChart';
import { TeamWorkloadChart } from '@/components/charts/TeamWorkloadChart';
import { MonthlyTrendsChart } from '@/components/charts/MonthlyTrendsChart';
import { analyticsApi } from '@/services/api';
import { AnalyticsData } from '@/types';
import { LoadingPage } from '@/components/common/LoadingSpinner';

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsApi.getAnalytics();
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingPage />;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Track your team's performance and project metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityChart data={analytics.weeklyProductivity} />
        <ProjectCompletionChart data={analytics.projectCompletion} />
        <TeamWorkloadChart data={analytics.teamWorkload} />
        <MonthlyTrendsChart data={analytics.monthlyTrends} />
      </div>
    </div>
  );
};

export default Analytics;
