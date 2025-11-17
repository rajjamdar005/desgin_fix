import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const FEEDBACK_FILE = path.resolve(process.cwd(), 'feedback.json');

router.post('/', async (req, res) => {
  try {
    const feedback = {
      ...req.body,
      receivedAt: new Date().toISOString()
    };

    await fs.appendFile(FEEDBACK_FILE, JSON.stringify(feedback) + '\n', 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Failed to save feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback.' });
  }
});

export default router;
