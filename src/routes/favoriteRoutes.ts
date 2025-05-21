// src/routes/favoriteRoutes.ts
import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController';

const router = Router();

// 獲取當前用戶的所有收藏
router.get('/favorites', protect, getFavorites);

// 添加酒店到收藏
router.post('/favorites', protect, addFavorite);

// 從收藏中移除酒店
router.delete('/favorites/:hotelId', protect, removeFavorite);

export default router;