import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().optional(),
  unitPrice: z.number().positive(),
  currentStock: z.number().int().min(0).default(0),
  minStockAlert: z.number().int().min(0).default(0),
  location: z.string().optional(),
});

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { sku: { contains: search } }
      ]
    } : {};
    const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({ data });
      if (p.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: p.id,
            quantity: p.currentStock,
            type: 'IN',
            reason: 'Initial Stock',
            createdById: req.user.id
          }
        });
      }
      return p;
    });
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: error.errors });
    next(error);
  }
};

export const updateProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const productId = Number(req.params.id);
    
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const oldProduct = await tx.product.findUnique({ where: { id: productId } });
      if (!oldProduct) throw new Error('Product not found');

      const p = await tx.product.update({
        where: { id: productId },
        data
      });

      if (data.currentStock !== undefined && data.currentStock !== oldProduct.currentStock) {
        const diff = data.currentStock - oldProduct.currentStock;
        await tx.stockMovement.create({
          data: {
            productId: p.id,
            quantity: Math.abs(diff),
            type: diff > 0 ? 'IN' : 'OUT',
            reason: 'Manual Adjustment',
            createdById: req.user.id
          }
        });
      }

      return p;
    });

    res.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: error.errors });
    next(error);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId: Number(req.params.id) },
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: movements });
  } catch (error) {
    next(error);
  }
};
