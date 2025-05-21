import { Router, Request, Response, NextFunction } from 'express';
import {
  fetchHotels,
  fetchHotelDetails,
  searchCities,
  testHotelDetailsApi,
  getSingleHotelDetail
} from '../services/amadeus';

const router = Router();


// GET /api/amadeus/hotels?city=PAR
// 根據 cityCode 取得 10 間酒店

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
// 關鍵字搜尋城市 (Autocomplete)

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


// 增加兩個新路由 - 一個用於測試，一個用於實際使用

//GET /api/amadeus/test-hotel-detail/:hotelId
//測試Amadeus API獲取酒店詳情

router.get(
  '/amadeus/test-hotel-detail/:hotelId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotelId = req.params.hotelId;
      
      if (!hotelId) {
        res.status(400).json({ message: 'Hotel ID is required' });
        return;
      }
      
      const result = await testHotelDetailsApi(hotelId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

//GET /api/amadeus/hotels/:hotelId
//獲取酒店詳情

router.get(
  '/amadeus/hotels/:hotelId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotelId = req.params.hotelId;
      
      if (!hotelId) {
        res.status(400).json({ message: 'Hotel ID is required' });
        return;
      }
      
      const hotelDetails = await getSingleHotelDetail(hotelId);
      res.json(hotelDetails);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
