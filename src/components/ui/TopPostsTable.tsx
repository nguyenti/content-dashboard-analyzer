import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  platform: string;
  score: number;
  engagement: number;
  publishedAt: string;
}

interface TopPostsTableProps {
  posts?: Post[];
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'How to Build Better Content Strategy',
    platform: 'LinkedIn',
    score: 92,
    engagement: 8.5,
    publishedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'AI Tools for Content Creation',
    platform: 'YouTube',
    score: 88,
    engagement: 12.3,
    publishedAt: '2024-01-12'
  },
  {
    id: '3',
    title: 'Behind the Scenes: Content Planning',
    platform: 'Instagram',
    score: 85,
    engagement: 6.7,
    publishedAt: '2024-01-10'
  }
];

export function TopPostsTable({ posts = mockPosts }: TopPostsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Top Performing Posts</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{post.title}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlatformColor(post.platform)}`}>
                    {post.platform}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{post.score}</div>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${post.score}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{post.engagement}%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getPlatformColor(platform: string) {
  switch (platform.toLowerCase()) {
    case 'linkedin': return 'bg-blue-100 text-blue-800';
    case 'youtube': return 'bg-red-100 text-red-800';
    case 'instagram': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}