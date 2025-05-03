import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import LoginRecord from '../models/LoginRecord';
import User from '../models/User';

const router = Router();

// all login records
router.get('/login-records', protect, adminOnly, async (_req, res) => {
  const records = await LoginRecord
    .find()
    .populate('userId', 'username email role')
    .sort({ loggedAt: -1 });
  res.json(records);
});

// list all users
router.get('/users', protect, adminOnly, async (_req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

export default router;
