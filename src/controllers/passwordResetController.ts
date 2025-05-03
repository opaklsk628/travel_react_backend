import { Request, Response } from 'express';
import crypto from 'crypto';
import PasswordResetToken from '../models/PasswordResetToken';
import User from '../models/User';

export const requestReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.json({ message: 'If email exists, you will receive link' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  await PasswordResetToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
  });

  res.json({ resetToken: token });
};

export const confirmReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword } = req.body;

  const record = await PasswordResetToken.findOne({
    token,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    res.status(400).json({ message: 'Invalid or expired token' });
    return;
  }

  const user = await User.findById(record.userId);
  if (!user) {
    res.status(400).json({ message: 'User not found' });
    return;
  }

  user.password = newPassword;
  await user.save();
  await PasswordResetToken.deleteOne({ _id: record._id });

  res.json({ message: 'Password updated' });
};
