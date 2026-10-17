import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";
import { Decimal } from "@prisma/client/runtime/library";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    // =========================
    // AUTH FIRST
    // =========================
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const prisma = getPrismaForTenant(schema);

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.creditSale.findUnique({
        where: { id },
        include: {
          items: { include: { product: true } },
        },
      });

      if (!sale) throw new Error("NOT_FOUND");
      if (sale.status === "paid") throw new Error("ALREADY_PAID");

      const total = new Decimal(sale.totalAmount || 0);

      let profit = new Decimal(0);


      for (const item of sale.items) {
            const selling = new Decimal(item.price || 0);
const cost = new Decimal(item.product?.wholesale_price || 0);

const itemProfit = selling.sub(cost).mul(item.quantity);
            profit = profit.add(itemProfit);

            // =========================
            // 📦 UPDATE STOCK
            // =========================
            await tx.products.update({
                where: { id: item.productId },
                data: {
                quantity_in_stock: {
                    decrement: item.quantity,
                },
                },
            });

            // =========================
            // 🏆 UPDATE WINNING
            // =========================
            const existingWinning = await tx.winning.findFirst({
                where: {
                nameOfProduct: item.product?.name,
                },
            });

            if (existingWinning) {
                await tx.winning.update({
                where: { id: existingWinning.id },
                data: {
                    winQuantity: {
                    increment: itemProfit,
                    },
                    quantityOfProducts: {
                    increment: item.quantity,
                    },
                },
                });
            } else {
                await tx.winning.create({
                data: {
                    nameOfProduct: item.product?.name || "Unknown",
                    winQuantity: itemProfit,
                    quantityOfProducts: item.quantity,
                },
                });
            }
            }

      // =========================
      // LOOP ITEMS
      // =========================
      for (const item of sale.items) {
        const cost = new Decimal(item.product?.wholesale_price || 0);
        const selling = new Decimal(item.price || 0);

        // 💰 profit calculation
        const itemProfit = selling.sub(cost).mul(item.quantity);
        profit = profit.add(itemProfit);

        // 📦 update stock (correct schema field)
        await tx.products.update({
          where: { id: item.productId },
          data: {
            quantity_in_stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // =========================
      // 🏦 UPDATE POCKET
      // =========================
      const pocket = await tx.pocket.findFirst();

      if (pocket) {
        await tx.pocket.update({
          where: { id: pocket.id },
          data: {
            moneyOnHand: {
              increment: total,
            },
          },
        });
      }

      // =========================
      // 💳 UPDATE CREDIT SALE
      // =========================
      const updated = await tx.creditSale.update({
        where: { id },
        data: {
          remaining: 0,
          paidAmount: total,
          status: "paid",
        },
      });

      return { updated, profit };
    });

    return NextResponse.json({
      success: true,
      data: result.updated,
      profit: result.profit.toString(),
    });
  } catch (error: any) {
    console.error("PAY ERROR:", error);

    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (error.message === "ALREADY_PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}