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

  const { id } = await req.json();

  // Ensure id is provided
  if (!id) {
    return NextResponse.json({ error: "Supplier ID required" }, { status: 400 });
  }

  const supplier = await prisma.supplier.delete({
    where: { id },
  });

  return NextResponse.json({ success: true, supplier });
}