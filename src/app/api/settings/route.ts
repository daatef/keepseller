import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";

// ✅ GET SETTINGS
export async function GET() {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);

    // Always only ONE settings row
    let settings = await prisma.setting.findFirst();

    // If no settings → create default
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          businessName: "My Business",
          businessLogoUrl: "",
          theme: "dark",
          language: "en",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// ✅ SAVE SETTINGS (UPSERT)
export async function POST(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);

    const body = await req.json();
    const { businessName, businessLogoUrl, theme, language } = body;

    // Get existing row
    const existing = await prisma.setting.findFirst();

    let settings;

    if (existing) {
      // UPDATE
      settings = await prisma.setting.update({
        where: { id: existing.id },
        data: {
          businessName,
          businessLogoUrl,
          theme,
          language,
        },
      });
    } else {
      // CREATE
      settings = await prisma.setting.create({
        data: {
          businessName,
          businessLogoUrl,
          theme,
          language,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("POST SETTINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}