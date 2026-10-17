// /api/messages/read
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    // ❌ لو مش مسجل دخول
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messageId } = await req.json();

    // ❌ لو مفيش messageId
    if (!messageId) {
      return new Response("Message ID is required", { status: 400 });
    }

    // ✅ منع التكرار (important جدًا)
    await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: session.user.id,
        },
      },
      update: {}, // لو موجود بالفعل
      create: {
        messageId,
        userId: session.user.id,
      },
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("READ MESSAGE ERROR:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}