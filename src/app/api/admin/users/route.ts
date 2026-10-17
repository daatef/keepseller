// 2. API Route: /app/api/admin/users/route.ts
import { NextResponse } from 'next/server';

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' },
  });
  return NextResponse.json(users);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
