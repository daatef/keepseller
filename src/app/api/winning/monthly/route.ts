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
    const data = await prisma.winning.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Group by month-year and sum `winQuantity`
    const monthlyTotals: Record<string, number> = {};

    data.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const month = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }); // e.g., "June 2025"

      const value = Number(entry.winQuantity);
      if (!monthlyTotals[month]) monthlyTotals[month] = 0;
      monthlyTotals[month] += value;
    });

    // Convert to sorted array
    const responseData = Object.entries(monthlyTotals)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, totalWinning]) => ({ month, totalWinning }));

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("GET /api/winning/monthly error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
