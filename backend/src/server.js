import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze.js';
import feedbackRouter from './routes/feedback.js';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is missing. The analyzer will fall back to mock suggestions.');
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'DesignFix API',
    status: 'running',
    aiProvider: 'Google Gemini',
    health: '/health',
    analyze: 'POST /api/analyze',
    feedback: 'POST /api/feedback',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/analyze', analyzeRouter);
app.use('/api/feedback', feedbackRouter);

app.use((err, _req, res, _next) => {
  console.error('❌ Unexpected error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎨  DesignFix Backend ready');
  console.log('🚀  Listening on http://localhost:' + PORT);
  console.log('🤖  Google Gemini ' + (process.env.GEMINI_API_KEY ? 'configured ✅' : 'missing ❌'));
  console.log('='.repeat(60) + '\n');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});
