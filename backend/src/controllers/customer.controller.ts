import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile is required'),
  email: z.string().email().optional().or(z.literal('')),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  followUpDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  notes: z.string().optional(),
});

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { mobile: { contains: search } },
        { businessName: { contains: search } }
      ]
    } : {};

    const customers = await prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: { challans: true }
    });
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({ data: data as any });
    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = customerSchema.partial().parse(req.body);
    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: data as any
    });
    res.json({ success: true, data: customer });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    next(error);
  }
};
