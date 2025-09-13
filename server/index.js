const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Content Dashboard API is running' });
});

// Mock API endpoints for now
app.get('/api/metrics/overview', (req, res) => {
  res.json([
    { label: 'Total Posts', value: 142, change: 12, trend: 'up' },
    { label: 'Avg Engagement', value: 3.2, change: -0.3, trend: 'down' },
    { label: 'Top Score', value: 89, change: 5, trend: 'up' },
    { label: 'Active Platforms', value: 3, change: 0, trend: 'stable' },
  ]);
});

app.get('/api/posts/top', (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const mockPosts = [
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
  
  res.json(mockPosts.slice(0, limit));
});

app.get('/api/analytics/performance', (req, res) => {
  res.json([
    { date: '2024-01-01', linkedin: 65, youtube: 80, instagram: 45 },
    { date: '2024-01-08', linkedin: 72, youtube: 85, instagram: 52 },
    { date: '2024-01-15', linkedin: 68, youtube: 78, instagram: 48 },
    { date: '2024-01-22', linkedin: 75, youtube: 90, instagram: 58 },
    { date: '2024-01-29', linkedin: 82, youtube: 88, instagram: 65 },
  ]);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API ready`);
});

module.exports = app;