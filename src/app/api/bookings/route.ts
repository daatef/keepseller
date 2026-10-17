import { NextResponse } from "next/server";
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

    const { productName, clientName, mobileNumber, quantity, notes, status } = body;

    if (
      typeof mobileNumber !== "number" ||
      typeof quantity !== "number" ||
      isNaN(mobileNumber) ||
      isNaN(quantity)
    ) {
      return NextResponse.json({ error: "Invalid mobile number or quantity" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        productName,
        clientName,
        mobileNumber,
        quantity,
        notes,
        status: status ?? "PENDING",
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;
    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);
    const bookings = await prisma.booking.findMany({
      orderBy: { bookedAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Booking GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
