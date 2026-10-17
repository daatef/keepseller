// app/api/credit-sales/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

// ✅ إنشاء معاملة جديدة على الحساب
export async function POST(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);
    const body = await req.json();
    const { customerId, items, outletId } = body;

    // ✅ التحقق من البيانات
    if (!customerId || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const invalidItem = items.find(
      (i: any) =>
        !i.productId ||
        typeof i.quantity !== "number" ||
        i.quantity <= 0 ||
        typeof i.price !== "number" ||
        i.price < 0
    );
    if (invalidItem) {
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );

    // ✅ استخدام transaction آمنة
    const sale = await prisma.$transaction(async (tx) => {
      const creditSale = await tx.creditSale.create({
        data: {
          customerId,
          totalAmount,
          remaining: totalAmount,
          ...(outletId && { outletId }), // 👈 clean way
        },
      });

      // إنشاء items وتحديث المخزون
      for (const item of items) {
        const product = await tx.products.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.quantity_in_stock < item.quantity) {
          throw new Error(`Not enough stock`);
        }

        await tx.creditSaleItem.create({
          data: {
            creditSaleId: creditSale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });

        await tx.products.update({
          where: { id: item.productId },
          data: { quantity_in_stock: { decrement: item.quantity } },
        });
      }

      return creditSale;
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error("CreditSale POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ جلب جميع المعاملات مع العملاء والمنتجات
export async function GET(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);

    const creditSales = await prisma.creditSale.findMany({
      include: {
        items: {
          include: { product: true },
        },
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ تعديل output ليكون واضح للواجهة
    const formatted = creditSales.map((sale) => ({
      id: sale.id,
      customerId: sale.customerId,
      customerName: sale.customer?.name || "N/A",
      totalAmount: sale.totalAmount,
      remaining: sale.remaining,
      paidAmount: sale.paidAmount,
      status: sale.status,
      items: sale.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.product?.name || "N/A",
        quantity: i.quantity,
        price: i.price,
      })),
      createdAt: sale.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("CreditSale GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}