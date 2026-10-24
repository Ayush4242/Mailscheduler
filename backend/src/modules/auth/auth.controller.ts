import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { prisma } from '../../config/db.js';
import { config } from '../../config/index.js';

export class AuthController {
  /**
   * User Signup with Email & Password
   */
  async signup(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const displayName = name?.trim() || email.split('@')[0];

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: displayName,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({ success: true, user, token });
    } catch (err: any) {
      console.error('[Signup Error]', err);
      return res.status(500).json({ error: err.message || 'Signup failed' });
    }
  }

  /**
   * User Login with Email & Password
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user || !user.password) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      };

      return res.json({ success: true, user: safeUser, token });
    } catch (err: any) {
      console.error('[Login Error]', err);
      return res.status(500).json({ error: err.message || 'Login failed' });
    }
  }

  /**
   * Generates Google OAuth redirect URL
   */
  async getGoogleAuthUrl(req: Request, res: Response) {
    if (!config.google.clientId) {
      return res.status(400).json({
        error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env',
      });
    }

    const state = Math.random().toString(36).substring(7);
    const scope = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(' ');

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.google.clientId}&redirect_uri=${encodeURIComponent(
      config.google.redirectUri
    )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;

    return res.redirect(url);
  }

  /**
   * Google OAuth Callback
   */
  async googleCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    if (!code) {
      return res.redirect(`${config.clientUrl}/login?error=missing_code`);
    }

    try {
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.redirectUri,
        grant_type: 'authorization_code',
      });

      const { access_token } = tokenRes.data;

      const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { id: googleId, email, name, picture: avatarUrl } = profileRes.data;

      const user = await prisma.user.upsert({
        where: { email },
        update: { name, avatarUrl, googleId },
        create: { email, name, avatarUrl, googleId },
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(`${config.clientUrl}/dashboard`);
    } catch (err: any) {
      console.error('[Google OAuth Error]', err.response?.data || err.message);
      return res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
    }
  }

  /**
   * Get current authenticated user
   */
  async getMe(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        slackIntegration: {
          select: { teamName: true, channelName: true, createdAt: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.json({ user });
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out successfully' });
  }
}

export const authController = new AuthController();
