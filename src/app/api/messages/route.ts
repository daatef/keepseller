// /api/messages
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
    },
    orderBy: { createdAt: "desc" },
  });

  const reads = await prisma.messageRead.findMany({
    where: { userId },
  });

  const readIds = new Set(reads.map(r => r.messageId));

  return Response.json(
    messages.map(m => ({
      ...m,
      isRead: readIds.has(m.id),
    }))
  );
}