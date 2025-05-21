// src/controllers/favoriteController.ts
import { Request, Response } from 'express';
import Favorite from '../models/Favorite';

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const favorites = await Favorite.find({ userId }).sort({ addedAt: -1 });
    res.json(favorites);
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ message: '獲取收藏失敗' });
  }
};

export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { hotelId, hotelName, cityCode, image } = req.body;
    
    // 基本驗證
    if (!hotelId || !hotelName || !cityCode) {
      res.status(400).json({ message: '缺少必要的酒店信息' });
      return;
    }
    
    const newFavorite = await Favorite.create({
      userId,
      hotelId,
      hotelName,
      cityCode,
      image: image || null
    });
    
    res.status(201).json(newFavorite);
  } catch (err: any) {
    // 處理重複收藏錯誤
    if (err.code === 11000) {
      res.status(400).json({ message: '該酒店已在收藏中' });
      return;
    }
    console.error('Add favorite error:', err);
    res.status(500).json({ message: '添加收藏失敗' });
  }
};

export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const hotelId = req.params.hotelId;
    
    const result = await Favorite.deleteOne({ userId, hotelId });
    
    if (result.deletedCount === 0) {
      res.status(404).json({ message: '收藏不存在' });
      return;
    }
    
    res.json({ message: '已從收藏中移除' });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ message: '移除收藏失敗' });
  }
};