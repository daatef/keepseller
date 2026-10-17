// /app/api/send-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, address, city, country, notes } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // ✅ Send order to your support email
    await transporter.sendMail({
      from: `"KeepSeller Orders" <${process.env.GMAIL_USER}>`,
      to: `"KeepSeller Orders" <${process.env.GMAIL_USER}>`, // where you want to receive orders
      subject: "📦 New Order Received",
      html: `
        <h2>New Order</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address || "N/A"}</p>
        <p><strong>City:</strong> ${city || "N/A"}</p>
        <p><strong>Country:</strong> ${country || "N/A"}</p>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
      `,
    });

    // ✅ Optional: send confirmation to customer
    await transporter.sendMail({
      from: `"KeepSeller" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "✅ Your order has been received",
      text: `Hi ${name}, thank you for your order! Our team will contact you soon.`,
    });

    return NextResponse.json({ message: "Order sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: "Failed to send order" }, { status: 500 });
  }
}
