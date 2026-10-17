// app/[lang]/layout.tsx
import '../../styles/globals.css';
import '../../styles/app.css';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/src/context/theme-provider";
import { auth } from "@/auth";
import { getPrismaForTenant } from "@/lib/prisma-tenant";
import { SessionProvider } from "next-auth/react";
export const metadata = {
  title: 'KeepSeller POS & Business Management System',
  description:
    'KeepSeller is a powerful, all-in-one management tool designed to help businesses efficiently handle sales, purchases, inventory, and finances. With an intuitive interface and real-time tracking, KeepSeller simplifies daily operations, boosts productivity, and provides valuable insights to support smarter business decisions.',
  keywords: [
    "POS system",
    "management system",
    "inventory system",
    "نظام كاشير",
    "برنامج إدارة محلات",
    "برنامج إدارة للصيدليات",
    "برنامج إدارة للكافيه",
    "برنامج إدارة للمكتبات",
  ],
};

export default async function SecondRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = ['ar', 'en', 'fr'].includes(resolvedParams.lang) ? resolvedParams.lang : 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  let theme: "light" | "dark" = "light";
  try {
    const session = await auth()
    const schema = session?.user?.tenantSchema

    if (schema) {
      const prisma = getPrismaForTenant(schema)
      const settings = await prisma.setting.findFirst()

      if (settings?.theme) {
        theme = settings.theme as "light" | "dark"
      }
    }
  } catch (err) {
    console.error("Theme load error:", err)
  }

  return (
        <SessionProvider>

     <main className="antialiased font-ours bg-[var(--web-primary-background-color)] text-[var(--web-primary-text-color)] max-w-screen h-auto">
      <ThemeProvider initialTheme={theme}>
      {children}
      </ThemeProvider>
      <Toaster position="top-right" />
    </main>
        </SessionProvider>

  );
}