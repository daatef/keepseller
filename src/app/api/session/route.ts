import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // global client
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(null);
  }

  // Global prisma used for auth/user info
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      email: true,
      name: true,
      image: true,
      isSubscribed: true,
    },
  });

  if (!user) return NextResponse.json(null);

  return NextResponse.json({ user });
}
