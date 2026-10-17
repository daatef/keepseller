// app/api/admin/users/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ Use shared instance

type DeleteParams = {
  params: { id: string };
};

export async function DELETE(_: Request, { params }: DeleteParams) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { success: false, error: "User not found or cannot be deleted" },
      { status: 404 }
    );
  }
}
