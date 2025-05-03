import { Request, Response } from 'express';
import crypto from 'crypto';
import PasswordResetToken from '../models/PasswordResetToken';
import User from '../models/User';

// request reset password
export const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'If email exists, you will receive link' });

  const token = crypto.randomBytes(32).toString('hex');
  await PasswordResetToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hr
  });

  res.json({ resetToken: token });
};

// send email with resetToken
export const confirmReset = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const record = await PasswordResetToken.findOne({
    token,
    expiresAt: { $gt: new Date() },
  });
  if (!record) return res.status(400).json({ message: 'Invalid or expired token' });

  const user = await User.findById(record.userId);
  if (!user) return res.status(400).json({ message: 'User not found' });

  user.password = newPassword;
  await user.save();
  await PasswordResetToken.deleteOne({ _id: record._id });

  res.json({ message: 'Password updated' });
};
