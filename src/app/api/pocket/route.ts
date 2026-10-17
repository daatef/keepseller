import { NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

// GET /api/pocket
export async function GET() {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);
    const pocket = await prisma.pocket.findFirst();

    if (!pocket) {
      return NextResponse.json({ error: "No pocket record found" }, { status: 404 });
    }

    return NextResponse.json({ moneyOnHand: pocket.moneyOnHand.toString() });
  } catch (error) {
    console.error("GET /api/pocket error:", error);
    return NextResponse.json({ error: "Failed to fetch pocket data" }, { status: 500 });
  }
}

// POST /api/pocket
export async function POST(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);
    const { moneyOnHand } = await req.json();

    const money = parseFloat(moneyOnHand);
    if (isNaN(money)) {
      return NextResponse.json({ error: "Invalid money value" }, { status: 400 });
    }

    const amountDecimal = new Decimal(money.toString());

    let pocket = await prisma.pocket.findFirst();

    if (!pocket) {
      // Create pocket and its first update
      pocket = await prisma.pocket.create({
        data: {
          moneyOnHand: amountDecimal,
          updates: {
            create: {
              amount: amountDecimal,
            },
          },
        },
      });
    } else {
      // Update pocket and create a new update log
      pocket = await prisma.pocket.update({
        where: { id: pocket.id },
        data: {
          moneyOnHand: amountDecimal,
        },
      });

      await prisma.pocketUpdate.create({
        data: {
          amount: amountDecimal,
          pocketId: pocket.id,
        },
      });
    }

    return NextResponse.json({
      id: pocket.id,
      moneyOnHand: pocket.moneyOnHand.toString(),
      updatedAt: pocket.updatedAt,
    });
  } catch (error) {
  console.error("POST /api/pocket error:", error instanceof Error ? error.stack : error);
  return NextResponse.json({ error: "Failed to update pocket data" }, { status: 500 });
}
}
