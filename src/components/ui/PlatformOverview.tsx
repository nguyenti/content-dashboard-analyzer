import React from 'react';
import { Linkedin, Youtube, Instagram, TrendingUp } from 'lucide-react';

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
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
      <div className="space-y-4">
        {platforms.map((platform) => (
          <PlatformCard key={platform.name} platform={platform} />
        ))}
      </div>
    </div>
  );
}

function PlatformCard({ platform }: { platform: any }) {
  const Icon = platform.icon;
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${platform.color}`}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{platform.name}</h4>
          <p className="text-sm text-gray-600">{platform.posts} posts</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1">
          <TrendingUp size={16} className="text-green-600" />
          <span className="font-semibold text-gray-900">{platform.avgScore}</span>
        </div>
        <p className="text-sm text-gray-600">Avg Score</p>
      </div>
    </div>
  );
}