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
    const { productId, quantity, refundAmount, reason } = body;

    if (!productId || !quantity || !refundAmount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const product = await db.products.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const pocket = await db.pocket.findFirst();

    const winAmount = (product.selling_price - product.wholesale_price) * quantity;

    await db.$transaction(async (tx) => {
      // 1. Create the return sale
      await tx.returnSale.create({
        data: {
          productId,
          quantity,
          refundAmount,
          reason,
        },
      });

      // 2. Increase product stock
      await tx.products.update({
        where: { id: productId },
        data: {
          quantity_in_stock: { increment: quantity },
        },
      });

      // 3. Decrease pocket balance (refund to customer)
      if (pocket) {
        await tx.pocket.update({
          where: { id: pocket.id },
          data: {
            moneyOnHand: {
              decrement: refundAmount,
            },
          },
        });
      }

      // 4. Subtract winnings as negative entry
      await tx.winning.create({
        data: {
          nameOfProduct: product.name,
          winQuantity: -winAmount, // negative because it's a return
          quantityOfProducts: -quantity,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Return Sale Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
