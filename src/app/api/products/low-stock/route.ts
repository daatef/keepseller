// app/api/products/low-stock/route.ts
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

    const products = await prisma.products.findMany({
      orderBy: {
        quantity_in_stock: "asc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products/low-stock error:", error);
    return NextResponse.json({ error: "Failed to fetch low-stock products" }, { status: 500 });
  }
}
