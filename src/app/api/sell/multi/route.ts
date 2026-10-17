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
    const { outletId, items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const pocket =
      (await prisma.pocket.findFirst()) ??
      (await prisma.pocket.create({ data: { moneyOnHand: new Decimal(0) } }));

    const results = await prisma.$transaction(async (tx) => {
      const createdSales: any[] = [];

      // ✅ Create receipt
      const receipt = await tx.receipt.create({
        data: {
          outletId: outletId || null,
          total: 0,
        },
      });

      // ✅ Loop items
      for (const { productId, quantity, selling_price } of items) {
        const product = await tx.products.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error(`Product with id ${productId} not found`);
        }

        if (quantity > product.quantity_in_stock) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // ✅ USE FRONTEND PRICE if provided
        const finalPrice = selling_price ?? product.selling_price;

        const totalRevenue = new Decimal(finalPrice).mul(quantity);

        const winAmount =
          (finalPrice - product.wholesale_price) * quantity;

        // ✅ Create sale
        const sale = await tx.sale.create({
          data: {
            productId,
            quantity,
            total_revenue: totalRevenue.toNumber(),
            outletId: outletId || null,
            receiptId: receipt.id,
          },
        });

        // ✅ Update stock
        await tx.products.update({
          where: { id: productId },
          data: {
            quantity_in_stock: {
              decrement: quantity,
            },
          },
        });

        // ✅ Update receipt total
        await tx.receipt.update({
          where: { id: receipt.id },
          data: {
            total: {
              increment: totalRevenue.toNumber(),
            },
          },
        });

        // ✅ Update pocket
        await tx.pocket.update({
          where: { id: pocket.id },
          data: {
            moneyOnHand: {
              increment: totalRevenue,
            },
          },
        });

        // ✅ Record winning
        await tx.winning.create({
          data: {
            winQuantity: winAmount,
            quantityOfProducts: quantity,
            nameOfProduct: product.name,
          },
        });

        createdSales.push(sale);
      }

      return createdSales;
    });

    return NextResponse.json({ success: true, sales: results });

  } catch (error: any) {
    console.error("POST /api/sell/multi error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record multi sale" },
      { status: 500 }
    );
  }
}