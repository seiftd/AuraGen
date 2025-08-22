import { Router } from 'express';

const router = Router();

// Upload routes will be implemented here
router.post('/image', (req, res) => {
  res.json({ message: 'Upload image endpoint - to be implemented' });
});

router.post('/audio', (req, res) => {
  res.json({ message: 'Upload audio endpoint - to be implemented' });
});

router.post('/video', (req, res) => {
  res.json({ message: 'Upload video endpoint - to be implemented' });
});

router.delete('/:fileId', (req, res) => {
  res.json({ message: 'Delete file endpoint - to be implemented' });
});

export default router;