// app/api/products/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

// -----------------------------
// POST: Create new product
// -----------------------------
export async function POST(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = await getPrismaForTenant(schema);
    const body = await req.json();

    const {
      productname,
      code,
      wholesaleprice,
      sellingprice,
      percentagewin,
      quantity,
      minimumAlertLevel,
      trackInventory,
      image,
    } = body;

    if (!productname || !code || isNaN(wholesaleprice) || isNaN(sellingprice) || isNaN(percentagewin)) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const newProduct = await prisma.products.create({
      data: {
        name: productname,
        code,
        wholesale_price: parseFloat(wholesaleprice),
        selling_price: parseFloat(sellingprice),
        percentage_of_win: parseFloat(percentagewin),
        quantity_in_stock: quantity !== undefined ? parseInt(quantity) : 0,
        minimumAlertLevel: minimumAlertLevel !== undefined ? parseInt(minimumAlertLevel) : 10,
        trackInventory: trackInventory !== undefined ? Boolean(trackInventory) : true,
        ...(image ? { image } : {}),
      },
    });

    const alert = newProduct.quantity_in_stock < newProduct.minimumAlertLevel;

    return NextResponse.json({ product: newProduct, alert });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// -----------------------------
// GET: List all products with most recent purchase
// -----------------------------
export async function GET() {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = await getPrismaForTenant(schema);

   let products;
    try {
      products = await prisma.products.findMany({
        include: {
          purchases: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
      products = await prisma.products.findMany(); // fallback
    }

    const productsWithMeta = products.map((p) => ({
        ...p,
        mostRecentPurchase: p.purchases?.[0]?.createdAt ?? null,
        alert: p.quantity_in_stock < p.minimumAlertLevel,
      }));

    return NextResponse.json(productsWithMeta);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// -----------------------------
// DELETE: Delete a product
// -----------------------------
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = await getPrismaForTenant(schema);
    const { id } = await req.json();
    const productId = Number(id);

    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    // Delete related records first
    await prisma.returnSale.deleteMany({ where: { productId } });
    await prisma.sale.deleteMany({ where: { productId } });
    await prisma.returnPurchase.deleteMany({ where: { productId } });
    await prisma.purchase.deleteMany({ where: { productId } });

    // Delete product
    await prisma.products.delete({ where: { id: productId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

// -----------------------------
// PATCH: Update a product
// -----------------------------
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = await getPrismaForTenant(schema);
    const body = await req.json();
    const { id, name, code, wholesaleprice, sellingprice, percentagewin, quantity, minimumAlertLevel, trackInventory, image } = body;

    if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    const updatedProduct = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        ...(name ? { name } : {}),
        ...(code ? { code } : {}),
        ...(wholesaleprice !== undefined ? { wholesale_price: parseFloat(wholesaleprice) } : {}),
        ...(sellingprice !== undefined ? { selling_price: parseFloat(sellingprice) } : {}),
        ...(percentagewin !== undefined ? { percentage_of_win: parseFloat(percentagewin) } : {}),
        ...(quantity !== undefined ? { quantity_in_stock: parseInt(quantity) } : {}),
        ...(minimumAlertLevel !== undefined ? { minimumAlertLevel: parseInt(minimumAlertLevel) } : {}),
        ...(trackInventory !== undefined ? { trackInventory: Boolean(trackInventory) } : {}),
        ...(image !== undefined ? { image } : {}),
      },
    });

    const alert = updatedProduct.quantity_in_stock < updatedProduct.minimumAlertLevel;

    return NextResponse.json({ product: updatedProduct, alert });
  } catch (error) {
    console.error("PATCH /api/products error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}