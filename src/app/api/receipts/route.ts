import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function GET() {
  try {
    // 1️⃣ Authenticate the user
    const session = await auth();

    if (!session?.user?.tenantSchema) {
      return NextResponse.json(
        { error: "Unauthorized: Tenant schema missing" },
        { status: 401 }
      );
    }

    const schema = session.user.tenantSchema;

    // 2️⃣ Get Prisma client for the tenant
    const prisma = getPrismaForTenant(schema);

    // 3️⃣ Fetch receipts with related sales and outlet info
    const receipts = await prisma.receipt.findMany({
      include: {
        sales: {
          include: {
            product: true, // Include product info for each sale
          },
        },
        outlet: true, // Include outlet info
      },
      orderBy: { createdAt: "desc" },
    });

    // 4️⃣ Return JSON response
    return NextResponse.json(receipts);
  } catch (error: any) {
    console.error("GET /api/receipts error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}