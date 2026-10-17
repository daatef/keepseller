import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schema = `tenant_${session.user.id}`;
  const prisma = await getPrismaForTenant(schema);

  const { id, name, phone, email, address } = await req.json();

  const updated = await prisma.supplier.update({
    where: { id },
    data: { name, phone, email, address },
  });

  return NextResponse.json(updated);
}