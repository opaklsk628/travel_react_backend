import { Router } from 'express';
import { fetchHotels } from '../services/hotelbeds';

const router = Router();

// get api
router.get('/hotels', async (req, res) => {
  try {
    const from = Number(req.query.from) || 1;
    const to   = Number(req.query.to)   || 10;
    const lang = (req.query.lang as string) || 'ENG';

    const data = await fetchHotels(from, to, lang);
    res.json(data);
  } catch (err: any) {
    console.error('Hotelbeds error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Hotelbeds fetch failed' });
  }
});

export default router;