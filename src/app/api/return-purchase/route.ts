import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPrismaForTenant } from '@/lib/prisma-tenant';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getPrismaForTenant(schema);
    const body = await req.json();
    const { productId, supplierId, quantity, refundAmount, reason } = body;

    // Collect missing fields
    const missingFields: string[] = [];
    if (!productId) missingFields.push('productId');
    if (!supplierId) missingFields.push('supplierId');
    if (!quantity) missingFields.push('quantity');
    if (!refundAmount) missingFields.push('refundAmount');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const product = await db.products.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Create the return purchase
      await tx.returnPurchase.create({
        data: {
          productId,
          supplierId,
          quantity,
          refundAmount,
          reason,
        },
      });

      // Decrease product stock
      await tx.products.update({
        where: { id: productId },
        data: {
          quantity_in_stock: { decrement: quantity },
        },
      });

      // Update pocket balance
      const pocket = await tx.pocket.findFirst(); // assumes one pocket
      if (pocket) {
        await tx.pocket.update({
          where: { id: pocket.id },
          data: {
            moneyOnHand: {
              increment: refundAmount,
            },
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Return Purchase Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}