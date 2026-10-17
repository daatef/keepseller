import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function GET() {
  const session = await auth();
  const schema = session?.user?.tenantSchema;

  if (!schema) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prisma = getPrismaForTenant(schema);
      const returnPurchases = await prisma.returnPurchase.findMany({
      include: {
        product: true,
        supplier: true, // ✅ مهم
      },
      orderBy: { createdAt: "desc" },
    });

  return NextResponse.json(returnPurchases);
}
