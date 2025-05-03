import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import LoginRecord from '../models/LoginRecord';

const generateToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role = 'customer', operatorCode } = req.body;
    const allowedRoles = ['customer', 'operator'];

    if (!allowedRoles.includes(role)) {
      res.status(400).json({ message: 'Role not allowed' });
      return;
    }
    if (role === 'operator' && operatorCode !== process.env.OPERATOR_CODE) {
      res.status(400).json({ message: 'Invalid operator code' });
      return;
    }

    const existed = await User.findOne({ $or: [{ email }, { username }] });
    if (existed) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = (await User.create({
      username,
      email,
      password,
      role,
    })) as IUser;

    res
      .status(201)
      .json({ token: generateToken(user.id, user.role) });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = (await User.findOne({ email })) as IUser | null;

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    await LoginRecord.create({
      userId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'] ?? 'unknown',
    });

    res.json({
      token: generateToken(user.id, user.role),
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById((req as any).userId).select('-password');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(user);
};
