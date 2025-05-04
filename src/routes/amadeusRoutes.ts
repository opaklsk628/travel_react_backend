import { Router } from 'express';
import { fetchHotels, fetchHotelDetails } from '../services/amadeus';

const router = Router();

router.get('/amadeus/hotels', async (req, res) => {
  try {
    const city = (req.query.city as string) || 'PAR';
    const list = await fetchHotels(city);

    if (!list.length) {
      res.json([]);
      return;
    }

    const ids = list.map((h: any) => h.hotelId);
    const { photoMap, ratingMap } = await fetchHotelDetails(ids);

    const result = list.map((h: any) => ({
      id:       h.hotelId,
      name:     h.name,
      latitude: h.latitude,
      longitude:h.longitude,
      image:    photoMap[h.hotelId] || null,
      stars:    ratingMap[h.hotelId] || '—',
      cityCode: city,
    }));

    res.json(result);
  } catch (err: any) {
    const msg = err.response?.data?.errors?.[0]?.detail ||
                err.message;
    console.error('Amadeus error:', msg);
    res.status(500).json({ message: msg });
  }
});

export default router;