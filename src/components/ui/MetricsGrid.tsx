import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import styles from './MetricsGrid.module.css';

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
    <div className={styles.container}>
      <div className={styles.grid}>
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
              <div className={styles.metricSelector}>
                <div className={styles.selectorTitle}>Available Metrics</div>
                <div className={styles.selectorList}>
                  {availableMetrics
                    .filter(metric => !selectedMetrics.find(m => m.label === metric.label))
                    .map((metric) => (
                    <button
                      key={metric.label}
                      onClick={() => handleAddMetric(metric)}
                      className={styles.selectorItem}
                    >
                      <div>
                        <p className={styles.selectorItemLabel}>{metric.label}</p>
                        <p className={styles.selectorItemValue}>{metric.value}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
      case 'up': return <TrendingUp className={`${styles.trendIcon} ${styles.trendUp}`} />;
      case 'down': return <TrendingDown className={`${styles.trendIcon} ${styles.trendDown}`} />;
      default: return <Minus className={`${styles.trendIcon} ${styles.trendStable}`} />;
    }
  };

  const getTrendBadgeVariant = () => {
    switch (metric.trend) {
      case 'up': return 'default';
      case 'down': return 'destructive';
      default: return 'secondary';
    }
  };

  const getChangeTextClass = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return `${styles.changeText} ${styles.changeTextUp}`;
      case 'down': return `${styles.changeText} ${styles.changeTextDown}`;
      default: return `${styles.changeText} ${styles.changeTextStable}`;
    }
  };

  return (
    <Card className={styles.metricCard}>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className={styles.removeButton}
        >
          <span className="sr-only">Remove metric</span>
          ×
        </Button>
      )}
      <CardHeader className={styles.metricHeader}>
        <CardTitle className={styles.metricTitle}>
          {metric.label}
        </CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className={styles.metricValue}>{metric.value}</div>
        <div className={styles.metricChange}>
          <span className={getChangeTextClass(metric.trend)}>
            {metric.change > 0 ? '+' : ''}{metric.change}% from last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
}