import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function GET(req: Request) {
  const session = await auth();
  const schema = session?.user?.tenantSchema;

  if (!schema) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prisma = getPrismaForTenant(schema);

  const { searchParams } = new URL(req.url);
  const take = Number(searchParams.get("take") || 50);
  const skip = Number(searchParams.get("skip") || 0);

  const returnSales = await prisma.returnSale.findMany({
    take,
    skip,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      quantity: true,
      refundAmount: true,
      reason: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      originalSale: {
        select: {
          id: true,
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(returnSales);
}
