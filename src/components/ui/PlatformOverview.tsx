import React from 'react';
import { Linkedin, Youtube, Instagram, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

const platforms = [
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-50 text-blue-600',
    posts: 45,
    avgScore: 78,
    status: 'active'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-50 text-red-600',
    posts: 23,
    avgScore: 85,
    status: 'active'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-pink-50 text-pink-600',
    posts: 67,
    avgScore: 62,
    status: 'active'
  }
];

export function PlatformOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformCard({ platform }: { platform: any }) {
  const Icon = platform.icon;
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${platform.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-medium">{platform.name}</h4>
          <p className="text-sm text-muted-foreground">{platform.posts} posts</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="font-semibold">{platform.avgScore}</span>
        </div>
        <Badge variant="secondary" className="mt-1 text-xs">
          Avg Score
        </Badge>
      </div>
    </div>
  );
}