import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ Use shared Prisma client

export async function POST(req: Request) {
  try {
    const { id, isSubscribed } = await req.json();

    if (!id || typeof isSubscribed !== "boolean") {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isSubscribed },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
