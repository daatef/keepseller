// app/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  // ✅ Allow public routes
  const isApiRoute = pathname.startsWith("/api");
  const isAuthRoute = pathname.startsWith("/auth");
  const isNextRoute = pathname.startsWith("/_next") || pathname === "/favicon.ico";
  if (isApiRoute || isAuthRoute || isNextRoute) return NextResponse.next();

  // 🔐 Get user token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // 👤 Get user from DB
  const user = await prisma.user.findUnique({ where: { email: token.email! } });
  if (!user) {
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  const now = new Date();
  const isSubscribed = user.isSubscribed && (user.plan === "lifetime" || (user.subscriptionEnd && now <= new Date(user.subscriptionEnd)));
  const adminEmail = process.env.ADMIN_EMAIL || "";

  // ⛔ Admin route protection
  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute && token.email !== adminEmail) {
    url.pathname = "/not-authorized";
    return NextResponse.redirect(url);
  }

  // ⛔ Non-admin & not subscribed → redirect to pricing page
  const allowedBeforeSubscription = ["/pricing", "/auth/signin"];
  const isAllowedBeforeSubscription = allowedBeforeSubscription.some((path) => pathname.startsWith(path));
  if (!isSubscribed && !isAdminRoute && !isAllowedBeforeSubscription) {
    url.pathname = "/pricing";
    return NextResponse.redirect(url);
  }

  // ⛔ Prevent subscribed users from visiting pricing page
  if (isSubscribed && pathname.startsWith("/pricing")) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/products/:path*",
    "/history/:path*",
    "/sell-product/:path*",
    "/purchase-product/:path*",
    "/pocket-page/:path*",
    "/winnings-page/:path*",
    "/pricing",
  ],
};