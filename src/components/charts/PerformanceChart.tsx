import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const mockData = [
  { date: '2024-01-01', linkedin: 65, youtube: 80, instagram: 45 },
  { date: '2024-01-08', linkedin: 72, youtube: 85, instagram: 52 },
  { date: '2024-01-15', linkedin: 68, youtube: 78, instagram: 48 },
  { date: '2024-01-22', linkedin: 75, youtube: 90, instagram: 58 },
  { date: '2024-01-29', linkedin: 82, youtube: 88, instagram: 65 },
];

export function PerformanceChart() {
  const { data = mockData } = useQuery({
    queryKey: ['performance-chart'],
    queryFn: () => fetch('/api/analytics/performance').then(res => res.json()),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line type="monotone" dataKey="linkedin" stroke="#0077B5" strokeWidth={2} />
            <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2} />
            <Line type="monotone" dataKey="instagram" stroke="#E4405F" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}