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

    // Create income
    const income = await db.income.create({
      data: {
        amount,
        reason,
        pocketId: pocket.id,
      },
    });

    // Update pocket: add amount to moneyOnHand
    await db.pocket.update({
      where: { id: pocket.id },
      data: {
        moneyOnHand: {
          increment: amount,
        },
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error('❌ Failed to create income:', error);
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
    const incomes = await db.income.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(incomes);
  } catch (error) {
    console.error('❌ Failed to fetch incomes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
