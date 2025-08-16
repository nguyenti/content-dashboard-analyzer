import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricsGrid } from '../../components/ui/MetricsGrid';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { TopPostsTable } from '../../components/ui/TopPostsTable';
import { PlatformOverview } from '../../components/ui/PlatformOverview';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your content performance</p>
      </div>

      <MetricsGrid metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <PlatformOverview />
      </div>

      <TopPostsTable posts={topPosts} />
    </div>
  );
}