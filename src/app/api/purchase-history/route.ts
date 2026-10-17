import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function GET() {

  
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);

    const purchases = await prisma.purchase.findMany({
      include: {
        product: true,
        supplier: true, // ✅ مهم
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("GET /api/purchase-history error:", error);
    return NextResponse.json({ error: "Failed to fetch purchase history" }, { status: 500 });
  }




}
