// src/app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

export async function PUT(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Unwrap params in case it's a Promise
    const params = await context.params;
    const bookingId = parseInt(params.id, 10); // now safe
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const prisma = getPrismaForTenant(schema);
    const { status } = await req.json();

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Booking UPDATE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
