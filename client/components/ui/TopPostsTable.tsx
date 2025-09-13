import { ExternalLink } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './table';
import { Badge } from './badge';
import styles from './TopPostsTable.module.css';

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>AI Score</TableHead>
          <TableHead>Engagement</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className={styles.postTitle}>{post.title}</TableCell>
            <TableCell>
              <Badge variant="outline" className={getPlatformColor(post.platform)}>
                {post.platform}
              </Badge>
            </TableCell>
            <TableCell>
              <div className={styles.scoreDisplay}>
                <div>{post.score}</div>
                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${post.score}%` }}
                  ></div>
                </div>
              </div>
            </TableCell>
            <TableCell className={styles.engagementDisplay}>{post.engagement}%</TableCell>
            <TableCell className={styles.dateDisplay}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <button className={styles.postTitle}>
                <ExternalLink size={16} className={styles.externalLinkIcon} />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getPlatformColor(platform: string) {
  switch (platform.toLowerCase()) {
    case 'linkedin': return styles.platformBadge;
    case 'youtube': return styles.platformBadge;
    case 'instagram': return styles.platformBadge;
    default: return styles.platformBadge;
  }
}
