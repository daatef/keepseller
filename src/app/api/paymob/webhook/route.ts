//app/api/paymob/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateNewSubscription } from '@/src/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transaction = body.obj || body;

    if (!transaction?.order?.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const paymobId = String(transaction.order.id);
    const payment = await prisma.payment.findFirst({ where: { paymobId } });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'paid') {
      return NextResponse.json({ ok: true });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: transaction.success ? 'paid' : 'failed' },
    });

    if (transaction.success) {
  const user = await prisma.user.findUnique({ where: { id: payment.userId } });
  if (user) {
    // لو المستخدم مشترك بالفعل، نستخدم آخر end date كـ start
    const currentEnd = user.subscriptionEnd && user.subscriptionEnd > new Date()
      ? user.subscriptionEnd
      : new Date(); // لو مفيش اشتراك سابق أو انتهى، نبدأ من دلوقتي

    const { end } = calculateNewSubscription(user, payment.plan, currentEnd);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscribed: true,
        plan: payment.plan,
        subscriptionStart: user.subscriptionStart || new Date(), // start ما يتغيرش لو موجود
        subscriptionEnd: end,
        subscriptionStatus: 'active',
      },
    });
  }
}

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('WEBHOOK ERROR:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}