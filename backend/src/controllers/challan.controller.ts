import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { z } from 'zod';

const challanItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().positive(),
});

const challanSchema = z.object({
  customerId: z.number(),
  items: z.array(challanItemSchema).min(1, 'At least one product is required'),
  status: z.enum(['DRAFT', 'CONFIRMED']).default('DRAFT'),
});

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challans = await prisma.challan.findMany({
      include: { customer: { select: { name: true } }, createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: challans });
  } catch (error) {
    next(error);
  }
};

export const getChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: true, customer: true, createdBy: { select: { name: true } } }
    });
    if (!challan) return res.status(404).json({ success: false, error: 'Challan not found' });
    res.json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { customerId, items, status } = challanSchema.parse(req.body);
    
    // Generate challan number: CHL-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const count = await prisma.challan.count({ where: { challanNumber: { startsWith: `CHL-${dateStr}` } } });
    const challanNumber = `CHL-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    // Verify products exist and have stock if confirmed
    const productIds = items.map(i => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    let totalQuantity = 0;
    const challanItemsData = [];

    for (const item of items) {
      const p = productMap.get(item.productId);
      if (!p) throw new Error(`Product ID ${item.productId} not found`);
      
      if (status === 'CONFIRMED' && p.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${p.name}. Available: ${p.currentStock}`);
      }

      totalQuantity += item.quantity;
      challanItemsData.push({
        productId: p.id,
        quantity: item.quantity,
        productName: p.name,
        sku: p.sku,
        unitPrice: p.unitPrice
      });
    }

    const challan = await prisma.$transaction(async (tx) => {
      const newChallan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          status,
          createdById: req.user.id,
          items: {
            create: challanItemsData
          }
        },
        include: { items: true }
      });

      if (status === 'CONFIRMED') {
        for (const item of challanItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Sales Challan ${challanNumber}`,
              createdById: req.user.id
            }
          });
        }
      }

      return newChallan;
    });

    res.status(201).json({ success: true, data: challan });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: error.errors });
    if (error.message.includes('Insufficient stock') || error.message.includes('not found')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
};

export const updateChallanStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const statusSchema = z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']);
    const newStatus = statusSchema.parse(req.body.status);
    const challanId = Number(req.params.id);

    const updatedChallan = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({ where: { id: challanId }, include: { items: true } });
      if (!challan) throw new Error('Challan not found');
      if (challan.status === newStatus) return challan;
      if (challan.status === 'CANCELLED') throw new Error('Cannot change status of a cancelled challan');
      if (challan.status === 'CONFIRMED' && newStatus === 'DRAFT') throw new Error('Cannot revert a confirmed challan to draft');

      if (newStatus === 'CONFIRMED') {
        // Reduce stock
        for (const item of challan.items) {
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          if (!p) throw new Error(`Product ID ${item.productId} not found`);
          if (p.currentStock < item.quantity) throw new Error(`Insufficient stock for ${p.name}. Available: ${p.currentStock}`);
          
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Sales Challan ${challan.challanNumber}`,
              createdById: req.user.id
            }
          });
        }
      } else if (newStatus === 'CANCELLED' && challan.status === 'CONFIRMED') {
        // Revert stock
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } }
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'IN',
              reason: `Cancelled Sales Challan ${challan.challanNumber}`,
              createdById: req.user.id
            }
          });
        }
      }

      return await tx.challan.update({
        where: { id: challanId },
        data: { status: newStatus }
      });
    });

    res.json({ success: true, data: updatedChallan });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: error.errors });
    if (error.message) return res.status(400).json({ success: false, error: error.message });
    next(error);
  }
};
