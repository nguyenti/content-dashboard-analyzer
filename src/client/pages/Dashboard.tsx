import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricsGrid } from '../../components/ui/MetricsGrid';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { TopPostsTable } from '../../components/ui/TopPostsTable';
import { PlatformOverview } from '../../components/ui/PlatformOverview';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-normal text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Content performance overview</p>
        </div>
        <div className="flex items-center gap-3">
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
      <div className="grid grid-cols-3 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PerformanceChart />
        </div>
        <div className="xl:col-span-1">
          <PlatformOverview />
        </div>
      </div>

      {/* Top Posts Table */}
      <TopPostsTable posts={topPosts} />
    </div>
  );
}