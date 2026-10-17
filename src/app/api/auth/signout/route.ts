import { NextResponse } from "next/server";

export async function GET() {
  // Clear cookies and redirect
  const response = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));

  // Remove session cookie (adjust the name if you're using a custom one)
  response.cookies.set("authjs.session-token", "", { maxAge: 0 });

  return response;
}