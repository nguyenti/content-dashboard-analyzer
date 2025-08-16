import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';

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
            <button
              onClick={() => setShowMetricSelector(!showMetricSelector)}
              className="w-full h-full min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <Plus size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Add Metric</p>
              </div>
            </button>

            {showMetricSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {availableMetrics
                  .filter(metric => !selectedMetrics.find(m => m.label === metric.label))
                  .map((metric) => (
                  <button
                    key={metric.label}
                    onClick={() => handleAddMetric(metric)}
                    className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <p className="font-medium text-gray-900">{metric.label}</p>
                    <p className="text-sm text-gray-600">{metric.value}</p>
                  </button>
                ))}
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
      case 'up': return <TrendingUp size={16} className="text-green-600" />;
      case 'down': return <TrendingDown size={16} className="text-red-600" />;
      default: return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border group relative">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
        >
          ×
        </button>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
        {getTrendIcon()}
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
        <p className={`text-sm ${getTrendColor()}`}>
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </p>
      </div>
    </div>
  );
}