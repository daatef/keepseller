import { NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);
    const { productId, quantity, nameOfProduct, outletId } = await req.json();

    if (!productId || !quantity || !nameOfProduct) {
      return NextResponse.json({ error: "Missing input data" }, { status: 400 });
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (quantity > product.quantity_in_stock) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const totalRevenue = new Decimal(product.selling_price).mul(quantity);
    const winAmount = (product.selling_price - product.wholesale_price) * quantity;

    const pocket = await prisma.pocket.findFirst() ??
      await prisma.pocket.create({ data: { moneyOnHand: new Decimal(0) } });

    const result = await prisma.$transaction([
      prisma.sale.create({
        data: {
          productId,
          quantity,
          total_revenue: totalRevenue.toNumber(),
          outletId: outletId || null,
        },
      }),

      prisma.products.update({
        where: { id: productId },
        data: {
          quantity_in_stock: {
            decrement: quantity,
          },
        },
      }),

      prisma.pocket.update({
        where: { id: pocket.id },
        data: {
          moneyOnHand: {
            increment: totalRevenue,
          },
        },
      }),

      prisma.winning.create({
        data: {
          winQuantity: winAmount,
          quantityOfProducts: quantity,
          nameOfProduct,
        },
      }),
    ]);

    return NextResponse.json(result[0]); // Return the sale
  } catch (error) {
    console.error("POST /api/sell error:", error);
    return NextResponse.json(
      { error: "Failed to record sale" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);

    const sales = await prisma.sale.findMany({
      include: {
        product: true,
        outlet: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("GET /api/sell error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
}
