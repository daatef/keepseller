import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();

    const position = formData.get('position')?.toString() || '';
    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const phone = formData.get('phone')?.toString() || '';
    const message = formData.get('message')?.toString() || '';
    const cvFile = formData.get('cv') as File | null;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App password
      },
    });

    const mailOptions: any = {
      from: `"Career Page" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Job Application - ${position}`,
      html: `
        <h2>New Application</h2>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    // Attach CV if uploaded
    if (cvFile) {
      const arrayBuffer = await cvFile.arrayBuffer();
      mailOptions.attachments = [
        {
          filename: cvFile.name,
          content: Buffer.from(arrayBuffer),
        },
      ];
    }

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}