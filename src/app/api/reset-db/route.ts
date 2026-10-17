import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function POST() {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);

    // Deleting all related data in FK-safe order
    await prisma.returnSale.deleteMany();
    await prisma.returnPurchase.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.winning.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.outlet.deleteMany();

    await prisma.income.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.pocketUpdate.deleteMany();

    await prisma.products.deleteMany();

    // Reset pocket balance if any
    await prisma.pocket.updateMany({
      data: { moneyOnHand: 0 },
    });

    return NextResponse.json({ message: "✅ Tenant data reset successfully" });
  } catch (error) {
    console.error("[❌ RESET TENANT DB ERROR]", error);
    return NextResponse.json(
      { error: "Failed to reset tenant data" },
      { status: 500 }
    );
  }
}
