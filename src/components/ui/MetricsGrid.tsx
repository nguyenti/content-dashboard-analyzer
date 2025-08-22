import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';

interface Metric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface MetricsGridProps {
  metrics?: Metric[];
}

const availableMetrics = [
  { label: 'Total Views', value: 45200, change: 8.2, trend: 'up' as const },
  { label: 'Avg Comments', value: 12.4, change: -2.1, trend: 'down' as const },
  { label: 'Share Rate', value: 2.8, change: 1.5, trend: 'up' as const },
  { label: 'Click Rate', value: 4.6, change: 0.3, trend: 'up' as const },
  { label: 'Reach', value: 8900, change: 15.2, trend: 'up' as const },
  { label: 'Saves', value: 234, change: -5.7, trend: 'down' as const },
];

export function MetricsGrid({ metrics = [] }: MetricsGridProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([
    { label: 'Total Posts', value: 142, change: 12, trend: 'up' },
    { label: 'Avg Engagement', value: 3.2, change: -0.3, trend: 'down' },
    { label: 'Top Score', value: 89, change: 5, trend: 'up' },
    { label: 'Active Platforms', value: 3, change: 0, trend: 'stable' },
  ]);

  const [showMetricSelector, setShowMetricSelector] = useState(false);

  const handleAddMetric = (metric: Metric) => {
    if (!selectedMetrics.find(m => m.label === metric.label)) {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
    setShowMetricSelector(false);
  };

  const handleRemoveMetric = (label: string) => {
    setSelectedMetrics(selectedMetrics.filter(m => m.label !== label));
  };

  const displayMetrics = metrics.length > 0 ? metrics : selectedMetrics;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric, index) => (
          <MetricCard 
            key={index} 
            metric={metric} 
            onRemove={metrics.length === 0 ? () => handleRemoveMetric(metric.label) : undefined}
          />
        ))}
        
        {metrics.length === 0 && (
          <div className="relative">
            <Card className="min-h-[120px] border-dashed hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-center h-full p-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowMetricSelector(!showMetricSelector)}
                  className="h-full w-full flex-col gap-2"
                >
                  <Plus size={24} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Add Metric</p>
                </Button>
              </CardContent>
            </Card>

            {showMetricSelector && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-10 max-h-64 overflow-y-auto shadow-lg">
                <CardContent className="p-0">
                  {availableMetrics
                    .filter(metric => !selectedMetrics.find(m => m.label === metric.label))
                    .map((metric) => (
                    <Button
                      key={metric.label}
                      variant="ghost"
                      onClick={() => handleAddMetric(metric)}
                      className="w-full p-3 h-auto justify-start border-b last:border-b-0 rounded-none"
                    >
                      <div className="text-left">
                        <p className="font-medium">{metric.label}</p>
                        <p className="text-sm text-muted-foreground">{metric.value}</p>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ metric, onRemove }: { metric: Metric; onRemove?: () => void }) {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadgeVariant = () => {
    switch (metric.trend) {
      case 'up': return 'default';
      case 'down': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="group relative hover:shadow-md transition-all duration-200">
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="sr-only">Remove metric</span>
          ×
        </Button>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <Badge variant={getTrendBadgeVariant() as any} className="mt-2 text-xs">
          {metric.change > 0 ? '+' : ''}{metric.change}% from last month
        </Badge>
      </CardContent>
    </Card>
  );
}