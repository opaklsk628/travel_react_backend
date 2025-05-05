import { Router, Request, Response, NextFunction } from 'express';
import {
  fetchHotels,
  fetchHotelDetails,
  searchCities,
} from '../services/amadeus';

const router = Router();

// GET /api/amadeus/hotels?city=PAR
// get 10 hotels by city code

router.get(
  '/amadeus/hotels',
  async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/amadeus/cities?keyword=par
// search cities by keyword

router.get(
  '/amadeus/cities',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keyword = req.query.keyword as string;
      if (!keyword) {
        res.status(400).json({ message: 'keyword required' });
        return;
      }

      const list = await searchCities(keyword);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
