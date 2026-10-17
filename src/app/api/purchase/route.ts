// app/api/purchase/route.ts
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
    const body = await req.json();

    const { productId, quantity, supplierId } = body;

    // Validate inputs
    // if (!productId || typeof quantity !== "number" || quantity <= 0 || !supplierId) {
    //   return NextResponse.json({ error: "Invalid product, supplier, or quantity" }, { status: 400 });
    // }

    if (typeof quantity !== "number") {
      return NextResponse.json({ error: "Invalid Quantity" }, { status: 400 });
    }
    if (quantity <= 0) {
      return NextResponse.json({ error: "Quantity < 0" }, { status: 400 });
    }
    if (!supplierId) {
      return NextResponse.json({ error: "NoSupplierID" }, { status: 400 });
    }


    // Find product
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Find supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    // Calculate total cost
    const totalCost = new Decimal(product.wholesale_price).mul(quantity);

    // Get pocket
    const pocket = await prisma.pocket.findFirst();
    if (!pocket || pocket.moneyOnHand.lessThan(totalCost)) {
      return NextResponse.json({ error: "Not enough money on hand" }, { status: 400 });
    }

    // Run transaction: create purchase, update product, update pocket
      const result = await prisma.$transaction([
        prisma.purchase.create({
          data: {
            productId,
            supplierId,
            quantity,
            totalCost,
          },
        }),

      prisma.products.update({
        where: { id: productId },
        data: {
          quantity_in_stock: {
            increment: quantity,
          },
        },
      }),
      prisma.pocket.update({
        where: { id: pocket.id },
        data: {
          moneyOnHand: {
            decrement: totalCost,
          },
        },
      }),
    ]);

    return NextResponse.json({ message: "Purchase recorded", result });
  } catch (error: any) {
  console.error("POST /api/purchase FULL ERROR:", error);

  return NextResponse.json(
    { error: error.message || "Failed to record purchase" },
    { status: 500 }
  );
  }
}