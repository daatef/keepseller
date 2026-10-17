'use client';

import { useEffect, useState } from "react";
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import Link from "next/link";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import Loader from "@/src/components/loader";
import { Button } from "@/src/components/ui/button";
import { Search, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import { motion } from 'framer-motion';

// ✅ Import Arabic font
import amiriFont from "@/src/fonts/amiri.js";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LowStockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const router = useRouter();
  const { data: session, error } = useSWR("/api/session", fetcher);

  useEffect(() => {
    if (session === null) router.push("/");
    else if (session && !session.user?.isSubscribed) router.push(`../${lang}/pricing`);
  }, [session, router]);

  useEffect(() => {
    fetch("/api/products/low-stock")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // ✅ Filter products based on search
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.wholesale_price).includes(searchTerm) ||
    String(p.selling_price).includes(searchTerm) ||
    String(p.quantity_in_stock).includes(searchTerm)
  );

  const handlePDF = () => {
    const doc = new jsPDF({ orientation: "l" });
    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");
    doc.setFontSize(14);

    doc.text(t("lowStockProducts"), 14, 10, { align: lang === "ar" ? "right" : "left" });
    autoTable(doc, {
      head: [[
        t("productNamePlaceholder"),
        t("productImagePlaceholder"),
        t("lowStockProductsWholesale"),
        t("lowStockProductsSellingPrice"),
        t("lowStockProductsQuantity"),
        t("lowStockminimumAlert"),
        t("status")
      ]],
      body: filteredProducts.map(p => [
        p.name,
        p.image,
        `$${p.wholesale_price}`,
        `$${p.selling_price}`,
        p.quantity_in_stock,
        p.minimumAlertLevel,
        p.quantity_in_stock < p.minimumAlertLevel ? t("lowStock") : t("inStock")
      ]),
      styles: { font: "Amiri" },
      headStyles: { font: "Amiri" },
      bodyStyles: { font: "Amiri" },
    });

    doc.save("low_stock_products.pdf");
  };

  const handleExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProducts.map(p => ({
      Name: p.name,
      Wholesale: p.wholesale_price,
      Selling: p.selling_price,
      Quantity: p.quantity_in_stock,
      MinimumAlert: p.minimumAlertLevel,
      Status: p.quantity_in_stock < p.minimumAlertLevel ? t("lowStock") : t("inStock")
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Low Stock Products");
    XLSX.writeFile(wb, "low_stock_products.xlsx");
  };

  const handleCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredProducts.map(p => ({
      Name: p.name,
      Wholesale: p.wholesale_price,
      Selling: p.selling_price,
      Quantity: p.quantity_in_stock,
      MinimumAlert: p.minimumAlertLevel,
      Status: p.quantity_in_stock < p.minimumAlertLevel ? t("lowStock") : t("inStock")
    })));
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "low_stock_products.csv";
    link.click();
  };

  if (error) return <div>{t("dashboard.error")}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <SidebarProvider
      className="primary-colors"
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
        {/* Premium Blurred Glow Effects - Black, White & Yellow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        className="fixed z-0 ltr:right-[-5rem] rtl:left-[-5rem] bottom-[-5rem] w-[25rem] h-[25rem] rounded-full
                   bg-gradient-to-tr from-yellow-400/60 via-white/40 to-black/10
                   blur-[120px] opacity-80 pointer-events-none"
      ></motion.div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        className="fixed z-0 top-1/2 right-1/3 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem]
                   rounded-full bg-gradient-to-br from-black/20 via-white/30 to-yellow-400/20
                   blur-[160px] opacity-70 pointer-events-none"
      ></motion.div>
      
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        className="fixed z-0 ltr:left-[-8rem] rtl:right-[-8rem] top-[20%] w-[20rem] h-[20rem]
                   rounded-full bg-gradient-to-l from-yellow-400/40 via-white/20 to-black/10
                   blur-[100px] opacity-60 pointer-events-none"
      ></motion.div>
      
      <AppSidebar
        className="fixed scrollbar-hide overflow-y-scroll top-0 z-99999 h-full w-64 primary-colors
              transition-all duration-300 ease-in-out
              ltr:left-0 rtl:right-0
              group-data-[collapsible=offcanvas]:ltr:-left-64
              group-data-[collapsible=offcanvas]:rtl:-right-64"
        variant="inset"
        user={{
          name: session.user.name || "Guest",
          email: session.user.email || "Not logged in",
          avatar: session.user.image || "/default-avatar.png",
        }}
      />

      <SidebarInset>
        <header className="z-30 secondary-background flex h-[var(--header-height)] shrink-0 items-center gap-2">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{t("lowStockProducts")}</h1>
            <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
              <Link className="flex items-center z-30" href={`/${lang}/search-items`}>
                <Search className="h-4 w-4 ml-2 primary-text" />
              </Link>
            </div>
          </div>
        </header>

        <main className="secondary-colors relative p-6 space-y-1">

              {/* ⚫ Grid */}
                <div className="absolute z-[1] inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute z-[1] inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          
          {/* Search Input */}
          <div className="my-4 relative z-[50]">
          <Input
            placeholder={t("searchProducts") || "Search products..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mx-0 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
          />
          </div>
          <Card className="primary-colors relative z-[50] border-theme py-0 my-0">
            <CardContent className="p-4 overflow-x-auto space-y-4">
              <div className="flex gap-2">
                <Button onClick={handlePDF} className="flex items-center gap-1">
                  <FileText size={16} /> PDF
                </Button>
                <Button onClick={handleExcel} className="flex items-center gap-1">
                  <FileSpreadsheet size={16} /> Excel
                </Button>
                <Button onClick={handleCSV} className="flex items-center gap-1">
                  CSV
                </Button>
              </div>

              <Table className="min-w-full border-theme">
                <TableHeader>
                  <TableRow className="secondary-colors">
                    <TableHead>{t("productNamePlaceholder")}</TableHead>
                    <TableHead>{t("productImagePlaceholder")}</TableHead>
                    <TableHead>{t("lowStockProductsWholesale")}</TableHead>
                    <TableHead>{t("lowStockProductsSellingPrice")}</TableHead>
                    <TableHead>{t("lowStockProductsQuantity")}</TableHead>
                    <TableHead>{t("lowStockminimumAlert")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const isLow = product.quantity_in_stock < product.minimumAlertLevel;
                    return (
                      <TableRow key={product.id} className="border-b">
                        <TableCell>{product.name}</TableCell>
                        <TableCell><img className="w-10" src={product.image} /></TableCell>
                        <TableCell>${product.wholesale_price}</TableCell>
                        <TableCell>${product.selling_price}</TableCell>
                        <TableCell>{product.quantity_in_stock}</TableCell>
                        <TableCell>{product.minimumAlertLevel}</TableCell>
                        <TableCell>
                          {isLow ? (
                            <Badge className="bg-red-600 text-white">{t("lowStock")}</Badge>
                          ) : (
                            <span className="text-green-600 font-medium">{t("inStock")}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-4">
                        {t("noProducts") || "No products available."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}