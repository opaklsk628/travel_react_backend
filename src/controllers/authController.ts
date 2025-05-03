import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import LoginRecord from '../models/LoginRecord';

const generateToken = (user: IUser) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '30d' }
  );

// register
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role = 'customer', operatorCode } = req.body;

    // just for admin add operator register
    const allowedRoles = ['customer', 'operator'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Role not allowed' });
    }

    if (role === 'operator' && operatorCode !== process.env.OPERATOR_CODE) {
      return res.status(400).json({ message: 'Invalid operator code' });
    }

    const existed = await User.findOne({ $or: [{ email }, { username }] });
    if (existed) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ username, email, password, role });
    res.status(201).json({ token: generateToken(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await LoginRecord.create({
      userId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'] ?? 'unknown',
    });

    res.json({
      token: generateToken(user),
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findById((req as any).userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};
