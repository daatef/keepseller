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
    const history = await prisma.pocketUpdate.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/pocket/history error:", error);
    return NextResponse.json({ error: "Failed to fetch pocket history" }, { status: 500 });
  }
}
