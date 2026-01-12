import { useEffect, useState, lazy, Suspense } from 'react';
import { FolderKanban, CheckCircle2, Clock, Users } from 'lucide-react';
import { KPICard } from '@/components/common/KPICard';
import { ActivityFeed } from '@/components/common/ActivityFeed';
import { analyticsApi, activitiesApi } from '@/services/api';
import { DashboardStats, Activity, AnalyticsData } from '@/types';
import { LoadingPage } from '@/components/common/LoadingSpinner';

// Lazy load heavy chart components
const ProductivityChart = lazy(() => import('@/components/charts/ProductivityChart').then(module => ({ default: module.ProductivityChart })));
const ProjectCompletionChart = lazy(() => import('@/components/charts/ProjectCompletionChart').then(module => ({ default: module.ProjectCompletionChart })));
const TeamWorkloadChart = lazy(() => import('@/components/charts/TeamWorkloadChart').then(module => ({ default: module.TeamWorkloadChart })));
const MonthlyTrendsChart = lazy(() => import('@/components/charts/MonthlyTrendsChart').then(module => ({ default: module.MonthlyTrendsChart })));

// Loading skeleton for charts
const ChartSkeleton = () => (
  <div className="w-full h-[300px] glass-card animate-pulse rounded-xl bg-muted/20" />
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData, analyticsData] = await Promise.all([
          analyticsApi.getDashboardStats(),
          activitiesApi.getRecent(6),
          analyticsApi.getAnalytics(),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your project overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Projects" value={stats?.activeProjects || 0} icon={FolderKanban} color="primary" delay={0} trend={{ value: 12, isPositive: true }} />
        <KPICard title="Completed" value={stats?.completedProjects || 0} icon={CheckCircle2} color="success" delay={0.1} trend={{ value: 8, isPositive: true }} />
        <KPICard title="Pending Tasks" value={stats?.pendingTasks || 0} icon={Clock} color="warning" delay={0.2} />
        <KPICard title="Team Members" value={stats?.teamMembers || 0} icon={Users} color="info" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="xl:col-span-2 space-y-6">
          {analytics && (
            <Suspense fallback={<ChartSkeleton />}>
              <ProductivityChart data={analytics.weeklyProductivity} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProjectCompletionChart data={analytics.projectCompletion} />
                <MonthlyTrendsChart data={analytics.monthlyTrends} />
              </div>
            </Suspense>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <ActivityFeed activities={activities} />
          {analytics && (
            <Suspense fallback={<ChartSkeleton />}>
              <TeamWorkloadChart data={analytics.teamWorkload} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
