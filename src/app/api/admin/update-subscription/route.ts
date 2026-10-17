import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const { userId, plan, subscriptionStart, subscriptionEnd } = body;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      subscriptionStart: subscriptionStart
        ? new Date(subscriptionStart)
        : null,
      subscriptionEnd: subscriptionEnd
        ? new Date(subscriptionEnd)
        : null,
      isSubscribed: true,
      subscriptionStatus: "active",
    },
  });

  return Response.json({ success: true });
}

