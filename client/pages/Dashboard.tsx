import { useQuery } from '@tanstack/react-query';
import { MetricsGrid } from '../components/ui/MetricsGrid';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { TopPostsTable } from '../components/ui/TopPostsTable';
import { PlatformOverview } from '../components/ui/PlatformOverview';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => fetch('/api/metrics/overview').then(res => res.json()),
  });

  const { data: topPosts } = useQuery({
    queryKey: ['top-posts'],
    queryFn: () => fetch('/api/posts/top?limit=5').then(res => res.json()),
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Content performance overview</p>
        </div>
        <div className={styles.controls}>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            All platforms
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid metrics={metrics} />

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.performanceChart}>
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Your content performance over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </div>
        <div className={styles.platformOverview}>
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>A breakdown of your top platforms.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformOverview />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Posts</CardTitle>
          <CardDescription>Your best performing posts from the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <TopPostsTable posts={topPosts} />
        </CardContent>
      </Card>
    </div>
  );
}
