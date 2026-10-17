import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filters: any = {};
    if (startDate && endDate) {
      filters.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59"),
      };
    } else if (startDate) {
      filters.createdAt = { gte: new Date(startDate) };
    } else if (endDate) {
      filters.createdAt = { lte: new Date(endDate + "T23:59:59") };
    }

    const winnings = await prisma.winning.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });

    const formatted = winnings.map((win) => ({
      ...win,
      winQuantity: Number(win.winQuantity), // Convert Decimal → Number
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/winning error:", error);
    return NextResponse.json(
      { error: "Failed to fetch winnings" },
      { status: 500 }
    );
  }
}
