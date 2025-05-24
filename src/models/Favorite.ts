import mongoose from 'mongoose';

export interface IFavorite extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  hotelId: string;  // Amadeus酒店ID
  hotelName: string;
  cityCode: string;
  image: string | null;
  addedAt: Date;
}

const favoriteSchema = new mongoose.Schema<IFavorite>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelId: { type: String, required: true },
  hotelName: { type: String, required: true },
  cityCode: { type: String, required: true },
  image: { type: String, default: null },
  addedAt: { type: Date, default: Date.now }
});

// 整合索引確保用戶不會重複收藏同一家酒店
favoriteSchema.index({ userId: 1, hotelId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);