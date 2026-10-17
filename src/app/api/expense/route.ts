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
    const { amount, reason } = await req.json();

    const pocket = await db.pocket.findFirst();
    if (!pocket) {
      return NextResponse.json({ error: 'Pocket not found' }, { status: 400 });
    }

    // Create expense
    const expense = await db.expense.create({
      data: {
        amount,
        reason,
        pocketId: pocket.id,
      },
    });

    // Update pocket: subtract amount from moneyOnHand
    await db.pocket.update({
      where: { id: pocket.id },
      data: {
        moneyOnHand: {
          decrement: amount,
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('❌ Failed to create expense:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getPrismaForTenant(schema);
    const expenses = await db.expense.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('❌ Failed to fetch expenses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
