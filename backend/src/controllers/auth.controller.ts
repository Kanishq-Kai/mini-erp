import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    // Seed initial users if DB is empty for easy testing
    const usersCount = await prisma.user.count();
    if (usersCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.createMany({
        data: [
          { email: 'admin@minierp.com', password: hashedPassword, name: 'Admin', role: 'ADMIN' },
          { email: 'sales@minierp.com', password: hashedPassword, name: 'Sales Rep', role: 'SALES' },
          { email: 'warehouse@minierp.com', password: hashedPassword, name: 'Warehouse Mgr', role: 'WAREHOUSE' },
          { email: 'accounts@minierp.com', password: hashedPassword, name: 'Accountant', role: 'ACCOUNTS' },
        ]
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: any, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role } });
  } catch (error) {
    next(error);
  }
};
