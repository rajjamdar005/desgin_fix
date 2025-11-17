import express from 'express';
import { analyzeWebsite } from '../services/analyzer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A valid URL is required.' });
    }

    console.log(`🔍 Analyzing URL: ${url}`);
    const analysis = await analyzeWebsite(url);
    res.json(analysis);
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze website.' });
  }
});

export default router;
