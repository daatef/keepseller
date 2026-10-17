import type { Metadata } from "next";
import "../styles/globals.css";


export const metadata: Metadata = {
  title: {
    default: "KeepSeller - Smart POS & Business Management System",
    template: "%s | KeepSeller",
  },
  description:
    "KeepSeller is a powerful all-in-one POS and business management system to manage sales, inventory, purchases, and finances with ease.",

  keywords: [
    "POS system",
    "inventory management",
    "sales system",
    "business management software",
    "Next.js app",
    "store management",
    "Egypt POS",
  ],

  authors: [{ name: "David Divan" }],
  creator: "KeepSeller",

  // 🌍 SEO & Crawlers
  robots: {
    index: true,
    follow: true,
  },

  // 🔗 Canonical
  metadataBase: new URL("https://KeepSeller.com"),
  alternates: {
    canonical: "/",
  },

  // 📱 Open Graph (Facebook, LinkedIn)
  openGraph: {
    title: "KeepSeller - Smart POS System",
    description:
      "Manage your business smarter with KeepSeller POS system. Track sales, inventory, and profits in real-time.",
    url: "https://KeepSeller.com",
    siteName: "KeepSeller",
    images: [
      {
        url: "/logo.png", // put inside /public
        width: 1200,
        height: 630,
        alt: "KeepSeller POS System",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 🐦 Twitter SEO
  twitter: {
    card: "summary_large_image",
    title: "KeepSeller POS System",
    description:
      "All-in-one POS system for managing your business efficiently.",
    images: ["/logo.png"],
  },

  

  // 🎨 Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },

  // 📦 App Info
  applicationName: "KeepSeller",
  category: "business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}