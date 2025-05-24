import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import adminRoutes from './routes/adminRoutes';
import amadeusRoutes from './routes/amadeusRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import hotelRoutes from './routes/hotelRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/auth/password-reset', passwordResetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', amadeusRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', hotelRoutes);

// check api health
app.get('/', (_req: Request, res: Response, _next: NextFunction) => {
  res.send('API is running');
});

// 全局錯誤處理中間件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ 
      message: '資料驗證失敗', 
      errors 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: '無效的ID格式' 
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({ 
      message: '資料重複，請檢查輸入' 
    });
  }
  
  res.status(err.status || 500).json({ 
    message: err.message || '伺服器錯誤' 
  });
});

// 404處理
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    message: `找不到路由: ${req.method} ${req.originalUrl}` 
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
})();