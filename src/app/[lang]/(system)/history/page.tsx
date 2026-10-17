'use client';

import React, { useEffect, useState } from 'react';
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/tabs';
import { Card, CardContent } from '@/src/components/ui/card';
import Link from "next/link";
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/src/lib/useTranslation';
import Loader from "@/src/components/loader";
import useSWR from "swr";
import { Search, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import amiriFont from "@/src/fonts/amiri.js"; // export default "<base64string>";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Calendar } from "lucide-react";
import { useRef } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';





const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Sale {
  id: number;
  product: { name: string };
  quantity: number;
  total_revenue: number;
  createdAt: string;
  outlet?: { name: string; location?: string | null } | null;
}

interface Purchase {
  id: number;
  product: { name: string };
  supplier: { name: string }; // ✅ جديد
  quantity: number;
  totalCost: number;
  createdAt: string;
}

interface ReturnSale {
  id: number;
  product: { name: string };
  quantity: number;
  refundAmount: number;
  reason?: string;
  createdAt: string;
}

interface ReturnPurchase {
  id: number;
  product: { name: string };
  quantity: number;
  refundAmount: number;
  reason?: string;
  createdAt: string;
}



export default function HistoryPage() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const router = useRouter();

  const { data: session, error } = useSWR("/api/session", fetcher);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [returnSales, setReturnSales] = useState<ReturnSale[]>([]);
  const [returnPurchases, setReturnPurchases] = useState<ReturnPurchase[]>([]);

 const startDateRef = useRef<any>(null)
  const endDateRef = useRef<any>(null)

  const SaletableRef = useRef<HTMLTableElement | null>(null);
  const PurchasetableRef = useRef<HTMLTableElement | null>(null);
  const RetSaletableRef = useRef<HTMLTableElement | null>(null);
  const RetPurchasetableRef = useRef<HTMLTableElement | null>(null);
  
const [startDate, setStartDate] = useState<string>("");
const [endDate, setEndDate] = useState<string>("");

  const [query, setQuery] = useState('');

  
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [salesRes, purchasesRes, returnSalesRes, returnPurchasesRes] = await Promise.all([
        fetch('/api/sale-history'),
        fetch('/api/purchase-history'),
        fetch('/api/return-sale-history'),
        fetch('/api/return-purchase-history'),
      ]);

      if (!salesRes.ok || !purchasesRes.ok || !returnSalesRes.ok || !returnPurchasesRes.ok) {
        console.error("Error fetching one or more history APIs");
        return;
      }
 
      setSales(await salesRes.json());
      setPurchases(await purchasesRes.json());
      setReturnSales(await returnSalesRes.json());
      setReturnPurchases(await returnPurchasesRes.json());
    } catch (err) {
      console.error("History fetch error", err);
    }
  };

  fetchData();
}, []);

  useEffect(() => {
    if (session === null) router.push("/");
    else if (session && !session.user?.isSubscribed) router.push(`../${lang}/pricing`);
  }, [session, router]);

// #### Sales
// ✅ Export as PDF with Arabic font support
const SalehandlePDF = () => {
  const doc = new jsPDF({ orientation: "l" });
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");
  doc.setFontSize(14);

  doc.text(t("salestableheading"), 14, 10, {
    align: lang === "ar" ? "right" : "left",
  });

  autoTable(doc, {
    html: SaletableRef.current!,
    styles: { font: "Amiri" },
    headStyles: { font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });

  doc.save("sales-history.pdf");
};
// ✅ Export as Excel
const SalehandleExcel = () => {
  const ws = XLSX.utils.table_to_sheet(SaletableRef.current);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sale History");
  XLSX.writeFile(wb, "sales-history.xlsx");
};
// ✅ Export as CSV with BOM
const SalehandleCSV = () => {
  const ws = XLSX.utils.table_to_sheet(SaletableRef.current);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "sales-history.csv";
  link.click();
};

// #### Purchase
const PurchasehandlePDF = () => {
  const doc = new jsPDF({ orientation: "l" });
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");
  doc.setFontSize(14);

  doc.text(t("purchasetableheading"), 14, 10, {
    align: lang === "ar" ? "right" : "left",
  });

  autoTable(doc, {
    html: PurchasetableRef.current!,
    styles: { font: "Amiri" },
    headStyles: { font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });

  doc.save("purchase-history.pdf");
};
const PurchasehandleExcel = () => {
  const ws = XLSX.utils.table_to_sheet(PurchasetableRef.current);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Purchase History");
  XLSX.writeFile(wb, "purchase-history.xlsx");
};
const PurchasehandleCSV = () => {
  const ws = XLSX.utils.table_to_sheet(PurchasetableRef.current);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "purchase-history.csv";
  link.click();
};

// #### Return Sale
const RetSalehandlePDF = () => {
  const doc = new jsPDF({ orientation: "l" });
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");
  doc.setFontSize(14);

  doc.text(t("returnsaletableheading"), 14, 10, {
    align: lang === "ar" ? "right" : "left",
  });

  autoTable(doc, {
    html: RetSaletableRef.current!,
    styles: { font: "Amiri" },
    headStyles: { font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });

  doc.save("return-sale-history.pdf");
};
const RetSalehandleExcel = () => {
  const ws = XLSX.utils.table_to_sheet(RetSaletableRef.current);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Return Sale History");
  XLSX.writeFile(wb, "return-sale-history.xlsx");
};
const RetSalehandleCSV = () => {
  const ws = XLSX.utils.table_to_sheet(RetSaletableRef.current);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "return-sale-history.csv";
  link.click();
};

// #### Return Purchase
const RetPurchasehandlePDF = () => {
  const doc = new jsPDF({ orientation: "l" });
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");
  doc.setFontSize(14);

  doc.text(t("returnpurchasetableheading"), 14, 10, {
    align: lang === "ar" ? "right" : "left",
  });

  autoTable(doc, {
    html: RetPurchasetableRef.current!,
    styles: { font: "Amiri" },
    headStyles: { font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });

  doc.save("return-purchase-history.pdf");
};
const RetPurchasehandleExcel = () => {
  const ws = XLSX.utils.table_to_sheet(RetPurchasetableRef.current);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Return Purchase History");
  XLSX.writeFile(wb, "return-purchase-history.xlsx");
};
const RetPurchasehandleCSV = () => {
  const ws = XLSX.utils.table_to_sheet(RetPurchasetableRef.current);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "return-purchase-history.csv";
  link.click();
};



  const filterByDate = <T extends { createdAt: string }>(data: T[]): T[] => {
  if (!startDate && !endDate) return data;

  return data.filter(item => {
    const itemDate = new Date(item.createdAt).getTime();
    const start = startDate ? new Date(startDate).getTime() : -Infinity;
    const end = endDate ? new Date(endDate).getTime() : Infinity;
    return itemDate >= start && itemDate <= end;
  });
};



   useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) throw new Error("Failed to fetch settings")
        const data = await res.json()
        setBusinessName(data.businessName)
        setLogoUrl(data.businessLogoUrl)
        setTheme(data.theme)
        setLanguage(data.language)
      } catch (err) {
        console.error(err)
      toast.error(t("settings.errors.load"))
      }
    }
    fetchSettings()
  }, [])
      
const [businessName, setBusinessName] = useState("");
const [logoUrl, setLogoUrl] = useState("");
const [businessCode, setBusinessCode] = useState("");
const [theme, setTheme] = useState("");
const [language, setLanguage] = useState("");






  if (error) return <div>{t("dashboard.error")}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <div className="dashboard">
      <SidebarProvider className="primary-colors" style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
      
      
      
      

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
          className="fixed scrollbar-hide overflow-y-scroll top-0 z-99999 h-full w-64 primary-colors transition-all duration-300 ease-in-out ltr:left-0 rtl:right-0 group-data-[collapsible=offcanvas]:ltr:-left-64 group-data-[collapsible=offcanvas]:rtl:-right-64"
          variant="inset"
          user={{
            name: session.user.name || "Guest",
            email: session.user.email || "Not logged in",
            avatar: session.user.image || "/default-avatar.png"
          }}
        />
        <SidebarInset>
          <header className="z-30 secondary-background flex h-[var(--header-height)] shrink-0 items-center gap-2">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
              <SidebarTrigger className="-ml-1 rtl:-mr-1" />
              <Separator orientation="vertical" className="mx-2 h-4" />
              <h1 className="text-base font-medium">{t("sidebarhistory")}</h1>
              <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
                <Link className="flex items-center z-20" href={`/${lang}/search-items`}>
                  <Search className="h-4 w-4 ml-2 primary-text" />
                </Link>
              </div>
            </div>
          </header>

          <main className="secondary-colors p-6 overflow-y-scroll scrollbar-hide h-full">
                {/* ⚫ Grid */}
                  <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            
                  {/* 🟡 Yellow Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
            
            <div className="primary-colors px-6 py-6 rounded-xl flex flex-1 flex-col z-30 relative border-theme">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="p-4 max-w-7xl">
                  <h1 className="relative z-30 text-2xl font-bold mb-4">{t("historytitle")}</h1>

                  {/* start the filter */}
                  <div className="relative z-30 flex flex-wrap items-end gap-6 mb-6">

  {/* Start Date */}
  <div className="flex flex-col space-y-2">
    <Label className="text-sm font-medium">{t("filterStartDate")}</Label>

    <div
      className="relative cursor-pointer"
      onClick={() => startDateRef.current?.flatpickr?.open()}
    >
      <Calendar className="secondary-colors absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      <Flatpickr
        ref={startDateRef}
        options={{ dateFormat: "Y-m-d", disableMobile: true }}
        value={startDate}
        placeholder={t("filterStartDate")}
        onChange={([date]) =>
          setStartDate(date?.toISOString().split("T")[0] ?? "")
        }
        className="pl-8 w-48 secondary-colors   rounded px-3 py-1.5"
      />
    </div>
  </div>

  {/* End Date */}
  <div className="flex flex-col space-y-2">
    <Label className="text-sm font-medium">{t("filterEndDate")}</Label>

    <div
      className="relative cursor-pointer"
      onClick={() => endDateRef.current?.flatpickr?.open()}
    >
      <Calendar className="secondary-colors absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      <Flatpickr
        ref={endDateRef}
        options={{ dateFormat: "Y-m-d", disableMobile: true }}
        value={endDate}
        placeholder={t("filterEndDate")}
        onChange={([date]) =>
          setEndDate(date?.toISOString().split("T")[0] ?? "")
        }
        className="pl-8 w-48 secondary-colors   rounded px-3 py-1.5"
      />
    </div>
  </div>
</div>{/* end filter */}
                  


                  <Tabs defaultValue="sales" className="w-full">
                    <div className="flex flex-col gap-4">
  <TabsList className="z-30 flex flex-row flex-wrap bg-muted rounded-none p-1 mb-4 gap-1">
    <TabsTrigger
      value="sales"
      className="w-1/2 sm:w-auto my-1 px-5 py-4 font-semibold transition-colors duration-200 data-[state=active]:bg-[var(--third-background-color)] data-[state=active]:text-[var(--third-text-color)] bg-[var(--secondary-background-color)] text-[var(--secondary-text-color)]"
    >
      {t("historytabsales")}
    </TabsTrigger>
    <TabsTrigger
      value="purchases"
      className="w-1/2 sm:w-auto my-1 px-5 py-4 font-semibold transition-colors duration-200  data-[state=active]:bg-[var(--third-background-color)] data-[state=active]:text-[var(--third-text-color)]  bg-[var(--secondary-background-color)] text-[var(--secondary-text-color)]"
    >
      {t("historytabpurchases")}
    </TabsTrigger>
    <TabsTrigger
      value="return-sales"
      className="w-1/2 sm:w-auto my-1 px-5 py-4 font-semibold transition-colors duration-200  data-[state=active]:bg-[var(--third-background-color)] data-[state=active]:text-[var(--third-text-color)]  bg-[var(--secondary-background-color)] text-[var(--secondary-text-color)]"
    >
      {t("historytabreturnsales")}
    </TabsTrigger>
    <TabsTrigger
      value="return-purchases"
      className="w-1/2 sm:w-auto my-1 px-5 py-4 font-semibold transition-colors duration-200 data-[state=active]:bg-[var(--third-background-color)] data-[state=active]:text-[var(--third-text-color)]  bg-[var(--secondary-background-color)] text-[var(--secondary-text-color)]"
    >
      {t("historytabreturnpurchases")}
    </TabsTrigger>
  </TabsList>
  {/* SALES TAB */}
  <TabsContent className="mt-10 gap-2 rtl:text-right ltr:text-left" value="sales">
    <div className="z-30 flex flex-row gap-2 mb-4 mt-12 md:mt-2 lg:mt-2">
      <Button onClick={SalehandlePDF} className="secondary-colors items-center gap-1">
        <FileText size={16} /> PDF
      </Button>
      <Button onClick={SalehandleExcel} className="secondary-colors items-center gap-1">
        <FileSpreadsheet size={16} /> Excel
      </Button>
      <Button onClick={SalehandleCSV} className="secondary-colors items-center gap-1">
        CSV
      </Button>
    </div>
    <Card className="rounded-none p-0 m-0 bg-none">
      <CardContent className="overflow-x-auto w-full p-0 mx-0 my-4 bg-none">
<h2 className="text-lg mb-4 w-full z-30 font-bold text-dir">{t("salestableheading")}</h2>        
         <Table ref={SaletableRef} className="min-w-full text-sm relative z-30">
          <TableHeader className="secondary-colors border-b">
            <TableRow>
              <TableHead className="px-2 py-1">{t("salestabledate")}</TableHead>
              <TableHead className="px-2 py-1">{t("salestableproduct")}</TableHead>
              <TableHead className="px-2 py-1">{t("salestableproductprice")}</TableHead>
              <TableHead className="px-2 py-1">{t("salestablequantity")}</TableHead>
              <TableHead className="px-2 py-1">{t("salestabletotalrevenue")}</TableHead>
              <TableHead className="px-2 py-1">{t("salestableoutlet")}</TableHead>
              <TableHead className="px-2 py-1">{t("salestableactions")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filterByDate(sales).map((sale) => {
              const price = sale.total_revenue / sale.quantity;

              const handlePrint = () => {
                const printContent = document.getElementById(`receipt-${sale.id}`);
                if (printContent) {
                  const printWindow = window.open("", "", "width=600,height=800");
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Receipt</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
                          </style>
                        </head>
                        <body onload="window.print();">${printContent.innerHTML}</body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  }
                }
              };

              return (
                <TableRow
                  key={sale.id}
                  className="primary-colors border-b"
                >
                  <TableCell className="px-2 py-1" suppressHydrationWarning>
                    {typeof window === "undefined"
                      ? ""
                      : format(new Date(sale.createdAt), "PPPpp")}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    {sale.product.name}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    {Number(price || 0).toFixed(2)}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    {sale.quantity}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    ${Number(sale.total_revenue || 0).toFixed(2)}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    {sale.outlet
                      ? `${sale.outlet.name}${
                          sale.outlet.location ? ` - ${sale.outlet.location}` : ""
                        }`
                      : t("salestablenooutlet")}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    <Button
                      className="third-colors py-2 px-4 rounded"
                      size="sm"
                      onClick={handlePrint}
                    >
                      {t("salestableprintbtn")}
                    </Button>
                  </TableCell>

                  {/* Hidden receipt */}
<TableCell className="hidden">
<div id={`receipt-${sale.id}`} className="receipt-content">
      {/* Business Header */}
    <div style={{
      textAlign: 'center',
      marginBottom: '10px',
      borderBottom: '2px solid #000',
      paddingBottom: '5px'
    }}>
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Business Logo"
          style={{ maxWidth: 80, marginBottom: 5 }}
        />
      )}
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 'bold' }}>
        {businessName || 'Your Business Name'}
      </h2>
    </div>

    {/* Receipt Info */}
    <div style={{ fontSize: 12, margin: '10px 0' }}>
      <p style={{ margin: '2px 0' }}><strong>Sale Receipt</strong></p>
      <p style={{ margin: '2px 0' }}><strong>Date:</strong> {format(new Date(sale.createdAt), "PPPpp")}</p>
      <p style={{ margin: '2px 0' }}><strong>Outlet:</strong> {sale.outlet ? `${sale.outlet.name}${sale.outlet.location ? ` - ${sale.outlet.location}` : ''}` : '-'}</p>
    </div>

    <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

    {/* Items Table */}
    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #000' }}>Product</th>
          <th style={{ textAlign: 'right', borderBottom: '1px solid #000' }}>Qty</th>
          <th style={{ textAlign: 'right', borderBottom: '1px solid #000' }}>Price</th>
          <th style={{ textAlign: 'right', borderBottom: '1px solid #000' }}>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{sale.product.name}</td>
          <td style={{ textAlign: 'right' }}>{sale.quantity}</td>
          <td style={{ textAlign: 'right' }}>{(sale.total_revenue / sale.quantity).toFixed(2)}</td>
          <td style={{ textAlign: 'right' }}>{sale.total_revenue.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <hr style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />

    {/* Total */}
    <p style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 14, margin: '5px 0' }}>
      Total: ${sale.total_revenue.toFixed(2)}
    </p>

    {/* Footer */}
    <div style={{ textAlign: 'center', fontSize: 12, marginTop: 10 }}>
      <p>Thank you for your purchase!</p>
      <p style={{ fontSize: 10 }}>Business Code: {session.user?.businessCode || '-'}</p>
    </div>
  </div>
</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </TabsContent>
</div>

  {/* PURCHASES TAB (same design as SALES) */}
  <TabsContent className="rtl:text-right ltr:text-left" value="purchases">
    <div className="relative z-30 flex gap-2 mb-4">
      <Button onClick={PurchasehandlePDF} className="secondary-colors flex items-center gap-1">
        <FileText size={16} /> PDF
      </Button>
      <Button onClick={PurchasehandleExcel} className="secondary-colors flex items-center gap-1">
        <FileSpreadsheet size={16} /> Excel
      </Button>
      <Button onClick={PurchasehandleCSV} className="secondary-colors flex items-center gap-1">
        CSV
      </Button>
    </div>
 <Card className="rounded-none p-0 m-0 bg-none">
      <CardContent className="overflow-x-auto w-full p-0 mx-0 my-4 bg-none">
     <h2 className="text-lg mb-4 w-full z-30 font-bold text-dir">{t("purchasetableheading")}</h2>
        <Table ref={PurchasetableRef} className="min-w-full text-sm relative z-30">
          <TableHeader className="secondary-colors border-b">
            <TableRow>
              <TableHead className="px-2 py-1">{t("purchasetabledate")}</TableHead>
              <TableHead className="px-2 py-1">{t("supplier")}</TableHead>
              <TableHead className="px-2 py-1">{t("purchasetableproduct")}</TableHead>
              <TableHead className="px-2 py-1">{t("purchasetableproducthostprice")}</TableHead>
              <TableHead className="px-2 py-1">{t("purchasetablequantity")}</TableHead>
              <TableHead className="px-2 py-1">{t("purchasetabletotalcost")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filterByDate(purchases).map((p) => (
              <TableRow
                key={p.id}
                className="primary-colors border-b"
              >
                <TableCell className="px-2 py-1" suppressHydrationWarning>
                  {typeof window === "undefined"
                    ? ""
                    : format(new Date(p.createdAt), "PPPpp")}
                </TableCell>

                <TableCell className="px-2 py-1">
                  {p.supplier?.name || "-"}
                </TableCell>

                <TableCell className="px-2 py-1">
                  {p.product.name}
                </TableCell>

                <TableCell className="px-2 py-1">
                  {(Number(p.totalCost) / p.quantity).toFixed(2)}
                </TableCell>

                <TableCell className="px-2 py-1">
                  {p.quantity}
                </TableCell>

                <TableCell className="px-2 py-1">
                  ${Number(p.totalCost).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </TabsContent>

  {/* RETURN SALES TAB (same design) */}
  <TabsContent className="rtl:text-right ltr:text-left" value="return-sales">
    <div className="relative z-30 flex gap-2 mb-4">
      <Button onClick={RetSalehandlePDF} className="secondary-colors flex items-center gap-1">
        <FileText size={16} /> PDF
      </Button>
      <Button onClick={RetSalehandleExcel} className="secondary-colors flex items-center gap-1">
        <FileSpreadsheet size={16} /> Excel
      </Button>
      <Button onClick={RetSalehandleCSV} className="secondary-colors flex items-center gap-1">
        CSV
      </Button>
    </div>
 <Card className="rounded-none p-0 m-0 bg-none">
      <CardContent className="overflow-x-auto w-full p-0 mx-0 my-4 bg-none">
        <h2 className="text-lg mb-4 w-full z-30 font-bold text-dir">{t("returnsaletableheading")}</h2>
        <Table ref={RetSaletableRef} className="min-w-full text-sm relative z-30">
          <TableHeader className="secondary-colors border-b">
           <TableRow>
            <TableHead className="px-2 py-1">{t("returnsaletabledate")}</TableHead>
            <TableHead className="px-2 py-1">{t("returnsaletableproduct")}</TableHead>
            <TableHead className="px-2 py-1">{t("returnsaletablequantity")}</TableHead>
            <TableHead className="px-2 py-1">{t("returnsaletablerefund")}</TableHead>
            <TableHead className="px-2 py-1">{t("returnsaletablereason")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterByDate(returnSales).map((rs) => (
            <TableRow
              key={rs.id}
              className="primary-colors border-b"
            >
              <TableCell className="px-2 py-1" suppressHydrationWarning>
                {typeof window === "undefined"
                  ? ""
                  : format(new Date(rs.createdAt), "PPPpp")}
              </TableCell>

              <TableCell className="px-2 py-1">
                {rs.product.name}
              </TableCell>

              <TableCell className="px-2 py-1">
                {rs.quantity}
              </TableCell>

              <TableCell className="px-2 py-1">
                ${(rs.refundAmount ?? 0).toFixed(2)}
              </TableCell>

              <TableCell className="px-2 py-1">
                {rs.reason || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </CardContent>
    </Card>
  </TabsContent>

  {/* RETURN PURCHASES TAB (same design) */}
  <TabsContent className="rtl:text-right ltr:text-left" value="return-purchases">
    <div className="relative z-30 flex gap-2 mb-4">
      <Button onClick={RetPurchasehandlePDF} className="secondary-colors flex items-center gap-1">
        <FileText size={16} /> PDF
      </Button>
      <Button onClick={RetPurchasehandleExcel} className="secondary-colors flex items-center gap-1">
        <FileSpreadsheet size={16} /> Excel
      </Button>
      <Button onClick={RetPurchasehandleCSV} className="secondary-colors flex items-center gap-1">
        CSV
      </Button>
    </div>
 <Card className="rounded-none p-0 m-0 bg-none">
      <CardContent className="overflow-x-auto w-full p-0 mx-0 my-4 bg-none">
        <h2 className="text-lg mb-4 w-full z-30 font-bold text-dir">{t("returnpurchasetableheading")}</h2>
        <Table ref={RetPurchasetableRef} className="min-w-full text-sm relative z-30">
          <TableHeader className="secondary-colors border-b">
            <TableRow>
              <TableHead className="px-2 py-1">{t("returnpurchasetabledate")}</TableHead>
              <TableHead className="px-2 py-1">{t("supplier")}</TableHead>
              <TableHead className="px-2 py-1">{t("returnpurchasetableproduct")}</TableHead>
              <TableHead className="px-2 py-1">{t("returnpurchasetablequantity")}</TableHead>
              <TableHead className="px-2 py-1">{t("returnpurchasetabletotal")}</TableHead>
              <TableHead className="px-2 py-1">{t("returnpurchasereason")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filterByDate(returnPurchases).map((rp) => (
              <TableRow
                key={rp.id}
                className="primary-colors border-b"
              >
                <TableCell className="px-2 py-1" suppressHydrationWarning>
                  {typeof window === "undefined"
                    ? ""
                    : format(new Date(rp.createdAt), "PPPpp")}
                </TableCell>

                <TableCell className="px-2 py-1">
                  {rp.supplier?.name || "-"}
                </TableCell>

                <TableCell className="px-2 py-1">
                  {rp.product.name}
                </TableCell>

                <TableCell className="px-2 py-1">
                  {rp.quantity}
                </TableCell>

                <TableCell className="px-2 py-1">
                  ${Number(rp.refundAmount || 0).toFixed(2)}
                </TableCell>

                <TableCell className="px-2 py-1">
                  {rp.reason || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}









                    
