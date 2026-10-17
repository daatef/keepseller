import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let status = body.subscriptionStatus;

    if (body.subscriptionEnd) {
      const endDate = new Date(body.subscriptionEnd);
      const now = new Date();

      if (endDate < now) {
        status = "expired";
      } else {
        status = "active";
      }
    }

    await prisma.user.update({
      where: { id: body.id },
      data: {
        businessName: body.businessName,
        mobileNumber: body.mobileNumber,
        businessAddress: body.businessAddress,
        about: body.about,

        plan: body.plan,
        subscriptionStart: body.subscriptionStart
          ? new Date(body.subscriptionStart)
          : null,
        subscriptionEnd: body.subscriptionEnd
          ? new Date(body.subscriptionEnd)
          : null,

        subscriptionStatus: status,
        isSubscribed: status === "active",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}