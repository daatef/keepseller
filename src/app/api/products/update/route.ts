import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";
import cloudinary from "@/lib/cloudinary";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const schema = session?.user?.tenantSchema;

    if (!schema) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaForTenant(schema);

    const formData = await req.formData();

    const id = Number(formData.get("id"));
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const wholesale = Number(formData.get("wholesale"));
    const selling = Number(formData.get("selling"));
    const percentage = Number(formData.get("percentage"));

    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const upload = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "products" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      imageUrl = upload.secure_url;
    }

    const updated = await prisma.products.update({
      where: { id },
      data: {
        name,
        code,
        wholesale_price: wholesale,
        selling_price: selling,
        percentage_of_win: percentage,
        ...(imageUrl && { image: imageUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}