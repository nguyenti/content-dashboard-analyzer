import { Linkedin, Youtube, Instagram, TrendingUp } from 'lucide-react';
import { Badge } from './badge';
import styles from './PlatformOverview.module.css';

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

function getIconColorClass(platformName: string) {
  switch (platformName) {
    case 'LinkedIn':
      return styles.linkedinIcon;
    case 'YouTube':
      return styles.youtubeIcon;
    case 'Instagram':
      return styles.instagramIcon;
    default:
      return '';
  }
}

export function PlatformOverview() {
  return (
    <div className={styles.container}>
      {platforms.map((platform) => (
        <PlatformCard key={platform.name} platform={platform} />
      ))}
    </div>
  );
}

function PlatformCard({ platform }: { platform: any }) {
  const Icon = platform.icon;
  
  return (
    <div className={styles.platformCard}>
      <div className={styles.platformInfo}>
        <div className={`${styles.iconContainer} ${getIconColorClass(platform.name)}`}>
          <Icon className={styles.icon} />
        </div>
        <div>
          <h4 className={styles.platformName}>{platform.name}</h4>
          <p className={styles.postCount}>{platform.posts} posts</p>
        </div>
      </div>
      <div className={styles.scoreSection}>
        <div className={styles.scoreContainer}>
          <TrendingUp className={styles.trendIcon} />
          <span className={styles.score}>{platform.avgScore}</span>
        </div>
        <Badge variant="secondary" className={styles.badge}>
          Avg Score
        </Badge>
      </div>
    </div>
  );
}