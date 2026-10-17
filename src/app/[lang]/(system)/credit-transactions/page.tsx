'use client';

import { useEffect, useState } from "react";
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import Loader from "@/src/components/loader";
import { Button } from "@/src/components/ui/button";
import { FileText, FileSpreadsheet, CheckCheck } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import amiriFont from "@/src/fonts/amiri.js";
import { Search, ScanBarcode, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/src/components/ui/alert-dialog";
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CreditSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");


  const [receipts, setReceipts] = useState<any[]>([]);
    const [businessName, setBusinessName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
  

  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar") || "en");
  const router = useRouter();
  const { data: session, error } = useSWR("/api/session", fetcher);



const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    if (session === null) router.push("/");
    else if (session && !session.user?.isSubscribed)
      router.push(`../${lang}/pricing`);
  }, [session, router, lang]);

  useEffect(() => {
    fetch("/api/credit-sales")
      .then(res => res.json())
      .then(data => setSales(data || []));
  }, []);

  const filteredSales = sales.filter((s) =>
    s.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.totalAmount).includes(searchTerm) ||
    s.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const markAsPaid = async (id: number) => {
    await fetch(`/api/credit-sales/pay/${id}`, { method: "PATCH" });

    setSales(prev =>
      prev.map(s =>
        s.id === id ? { ...s, status: "paid", remaining: 0 } : s
      )
    );
  };


  // Fetch receipts
    useEffect(() => {
      fetch("/api/receipts")
        .then(res => res.json())
        .then(data => setReceipts(data));
    }, []);
  
    // Fetch settings
    useEffect(() => {
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => {
          setBusinessName(data.businessName || "My Business");
          setLogoUrl(data.businessLogoUrl || "");
        });
    }, []);

  // ✅ PRINT
  const printReceipt = (receipt: any) => {
  const date = new Date(receipt.createdAt).toLocaleString();
  const outletInfo = receipt.outlet?.name || t("outlet");

  // ✅ FIX: support both shapes safely
  const cart = receipt.items || receipt.sales || [];

  const total = Number(receipt.totalAmount || receipt.total || 0);

  const billContent = `
  <div style="font-family: 'Courier New', monospace; width: 300px; padding: 15px;">
    
    <div style="text-align: center;">
      ${logoUrl ? `<img src="${logoUrl}" style="max-width: 80px;" />` : ""}
      <h2>${businessName}</h2>
    </div>

    <hr/>

    <p><strong>${t("saleReceipt")}</strong></p>
    <p>${t("date")}: ${date}</p>
    <p>${t("outlet")}: ${outletInfo}</p>

    <hr/>

    <table style="width:100%; font-size:12px;">
      <thead>
        <tr>
          <th>${t("product")}</th>
          <th>${t("quantity")}</th>
          <th>${t("price")}</th>
          <th>${t("total")}</th>
        </tr>
      </thead>

      <tbody>
        ${cart.map((item: any) => {
          const name =
           item?.product?.name || item?.productName || t("unknown")

          const qty = Number(item.quantity || 0);

          const price = Number(
            item.price ||
            item.product?.selling_price ||
            0
          );

          const rowTotal = price * qty;

          return `
            <tr>
              <td>${name}</td>
              <td>${qty}</td>
              <td>$${price.toFixed(2)}</td>
              <td>$${rowTotal.toFixed(2)}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>

    <hr/>

    <p style="text-align:right;">
      <strong>${t("total")}: $${total.toFixed(2)}</strong>
    </p>

    <p style="text-align:center;">${t("thankYou")}</p>
  </div>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Enable popups");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${t("print")}</title>
      </head>
      <body onload="window.print(); window.close();">
        ${billContent}
      </body>
    </html>
  `);

  printWindow.document.close();
};


  const handlePDF = () => {
    const doc = new jsPDF({ orientation: "l" });

    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");

    autoTable(doc, {
      head: [["Customer", "Total", "Status", "Date"]],
      body: filteredSales.map(s => [
        s.customerName,
        `$${s.totalAmount}`,
        s.status,
        new Date(s.createdAt).toLocaleString()
      ])
    });

    doc.save("credit_sales.pdf");
  };

  const handleExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSales);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Credit Sales");
    XLSX.writeFile(wb, "credit_sales.xlsx");
  };

  const handleCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredSales);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "credit_sales.csv";
    link.click();
  };

  if (error) return <div>Error</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <SidebarProvider className="primary-colors">

      <AppSidebar
              className="fixed scrollbar-hide overflow-y-scroll top-0 z-99999 h-full w-64 primary-colors transition-all duration-300 ease-in-out ltr:left-0 rtl:right-0 group-data-[collapsible=offcanvas]:ltr:-left-64 group-data-[collapsible=offcanvas]:rtl:-right-64"
              variant="inset"
              user={{
                name: session.user.name || "Guest",
                email: session.user.email || "Not logged in",
                avatar: session.user.image || "/default-avatar.png",
              }}
            />
      
            <SidebarInset>
              <header className="primary-colors z-99999 flex h-[var(--header-height)] shrink-0 items-center gap-2">
                <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                  <SidebarTrigger className="-ml-1 rtl:-mr-1" />
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <h1 className="text-base font-medium">{t('creditTransactions')}</h1>
                  <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
                    <Link className="flex items-center z-99" href={`/${lang}/search-items`}>
                      <Search className="h-4 w-4 ml-2 primary-text" />
                    </Link>
                  </div>
                </div>
              </header>

        <main className="p-6 relative">
               
        {/* ⚫ Grid */}
        <div className="absolute z-10 inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* 🟡 Yellow Glow */}
        <div className="absolute z-10 inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>



          <div className="ml-auto relative z-99 mt-2 border-theme rounded">
            <Input
              placeholder={t("search")}
              value={searchTerm}
              className="secondary-colors"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="z-99 relative primary-colors mt-2 p-2 border-theme rounded">
            <CardContent>

              <div className="flex gap-2 mb-4">
                <Button onClick={handlePDF}>
                <FileText size={16}/> {t("pdf")}
              </Button>

              <Button onClick={handleExcel}>
                <FileSpreadsheet size={16}/> {t("excel")}
              </Button>

              <Button onClick={handleCSV}>
                {t("csv")}
              </Button>
              </div>

              <Table className="border-theme">
                <TableHeader className="secondary-colors">
                  <TableRow>
                    <TableHead>{t("customer")}</TableHead>
                    <TableHead>{t("products")}</TableHead>
                    <TableHead>{t("total")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>

                      <TableCell>{sale.customerName}</TableCell>

                      <TableCell>
                        {(sale.items || []).map((item: any, i: number) => (
                          <div key={i}>
                            {item?.product?.name || item?.productName || "Unknown"} × {item?.quantity ?? 0}
                          </div>
                        ))}
                      </TableCell>

                      <TableCell>${sale.totalAmount}</TableCell>

                      <TableCell>
                        {sale.status === "pending" ? (
                          <Badge className="bg-yellow-500">{t("pending")}</Badge>
                        ) : (
                          <Badge className="bg-green-600">{t("paid")}</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {new Date(sale.createdAt).toLocaleString()}
                      </TableCell>

                      <TableCell className="flex gap-2">

                        {sale.status === "pending" && (
                         
                          <Button
                              onClick={() => setSelectedSale(sale)}
                              className="bg-green-600"
                            >
                              <CheckCheck /> {t("pay")}
                            </Button>
                        )}

                        <Button className="secondary-colors" onClick={() => printReceipt(sale)}>
                          🖨️ {t("print")}
                        </Button>

                      </TableCell>

                    </TableRow>
                  ))}

                  {filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        {t("No data")}
                      </TableCell>
                    </TableRow>
                  )}

                </TableBody>
              </Table>

            </CardContent>
          </Card>

          
        </main>

        

      </SidebarInset>
      <AlertDialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
  <AlertDialogContent className="z-[999] secondary-colors border-theme">
    <AlertDialogHeader>
      <AlertDialogTitle>
        {t("confirmPayment") || "Are you sure?"}
      </AlertDialogTitle>

      <AlertDialogDescription>
        {t("confirmPaymentDesc") || "This action will mark this sale as paid."}
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel className="primary-colors">
        {t("cancel") || "Cancel"}
      </AlertDialogCancel>

      <AlertDialogAction
      className="third-colors"
        onClick={() => {
          if (selectedSale) {
            markAsPaid(selectedSale.id);
            setSelectedSale(null);
          }
        }}
      >
        {t("confirm") || "Confirm"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
 
 
    </SidebarProvider>
  );
}