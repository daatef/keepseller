// /api/admin/messages
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { title, content, userId } = await req.json();

  const message = await prisma.message.create({
    data: { title, content, userId: userId || null },
  });

  return Response.json(message);
}