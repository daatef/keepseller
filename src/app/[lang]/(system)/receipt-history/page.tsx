'use client';

import { useEffect, useState } from "react";
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { Card, CardContent } from "@/src/components/ui/card";
import Link from "next/link";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import Loader from "@/src/components/loader";
import { Button } from "@/src/components/ui/button";
import { Search, FileText, FileSpreadsheet, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const router = useRouter();
  const { data: session, error } = useSWR("/api/session", fetcher);

  // Redirect
  useEffect(() => {
    if (session === null) router.push("/");
    else if (session && !session.user?.isSubscribed) {
      router.push(`../${lang}/pricing`);
    }
  }, [session, router, lang]);

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

const filteredReceipts = receipts.filter(r => {
  const search = searchTerm.toLowerCase();

  const matchId = String(r.id).includes(search);

  const matchProduct = r.sales?.some((s: any) =>
    s.product.name.toLowerCase().includes(search)
  );

  const matchDate = new Date(r.createdAt)
    .toLocaleString()
    .toLowerCase()
    .includes(search);

  const matchTotal = String(r.total)
    .toLowerCase()
    .includes(search);

  return matchId || matchProduct || matchDate || matchTotal;
});
  // ✅ PRINT
  const printReceipt = (receipt: any) => {
    const date = new Date(receipt.createdAt).toLocaleString();
    const outletInfo = receipt.outlet?.name || t("outlet");
    const cart = receipt.sales || [];
    const total = receipt.total || 0;

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
          ${cart.map((item: any) => `
            <tr>
              <td>${item.product.name}</td>
              <td>${item.quantity}</td>
              <td>$${item.product.selling_price.toFixed(2)}</td>
              <td>$${(item.product.selling_price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <hr/>

      <p style="text-align:right;"><strong>${t("total")}: $${total.toFixed(2)}</strong></p>

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

  // PDF
  const handlePDF = () => {
    const doc = new jsPDF();
    filteredReceipts.forEach((r, idx) => {
      doc.text(`${t("receiptId")} #${r.id}`, 14, 10 + idx * 60);
      autoTable(doc, {
        startY: 20 + idx * 60,
        head: [[t("product"), t("quantity"), t("total")]],
        body: r.sales.map((s: any) => [
          s.product.name,
          s.quantity,
          `$${s.total_revenue}`
        ]),
      });
      doc.text(`${t("total")}: $${r.total}`, 14, 40 + idx * 60);
      if (idx < filteredReceipts.length - 1) doc.addPage();
    });
    doc.save("receipts.pdf");
  };

  // Excel
  const handleExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredReceipts.flatMap(r =>
        r.sales.map((s: any) => ({
          ReceiptID: r.id,
          Date: new Date(r.createdAt).toLocaleString(),
          Product: s.product.name,
          Quantity: s.quantity,
          Total: s.total_revenue
        }))
      )
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipts");
    XLSX.writeFile(wb, "receipts.xlsx");
  };

  // CSV
  const handleCSV = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredReceipts.flatMap(r =>
        r.sales.map((s: any) => ({
          ReceiptID: r.id,
          Date: new Date(r.createdAt).toLocaleString(),
          Product: s.product.name,
          Quantity: s.quantity,
          Total: s.total_revenue
        }))
      )
    );
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "receipts.csv";
    link.click();
  };

  if (error) return <div>{t("error")}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <SidebarProvider className="primary-colors">
      <AppSidebar
        variant="inset"
        user={{
          name: session.user.name || "Guest",
          email: session.user.email || "Not logged in",
          avatar: session.user.image || "/default-avatar.png",
        }}
      />

      <SidebarInset>
        <header className="secondary-background flex h-12 items-center px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h1>{t("receiptsHistory")}</h1>

          <div className="ml-auto">
            <Link href={`/${lang}/search-items`}>
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="p-6 space-y-4 relative">

              {/* ⚫ Grid */}
                <div className="absolute z-[1] inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute z-[1] inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          


          <Input
            placeholder={t("searchReceipts")}
            className="relative z-[50]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Card className="border-theme relative z-[50]">
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button onClick={handlePDF}>
                  <FileText size={16} /> {t("pdf")}
                </Button>
                <Button onClick={handleExcel}>
                  <FileSpreadsheet size={16} /> {t("excel")}
                </Button>
                <Button onClick={handleCSV}>
                  {t("csv")}
                </Button>
              </div>

              <Table className="border-theme">
                <TableHeader className="secondary-colors">
                  <TableRow>
                    <TableHead>{t("receiptId")}</TableHead>
                    <TableHead>{t("receiptDate")}</TableHead>
                    <TableHead>{t("total")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>{receipt.id}</TableCell>
                        <TableCell>
                        {new Intl.DateTimeFormat("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        }).format(new Date(receipt.createdAt))}
                        </TableCell>                      <TableCell>${receipt.total}</TableCell>
                      <TableCell>
                        <Button onClick={() => printReceipt(receipt)}>
                          <Printer size={16} /> {t("print")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredReceipts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        {t("noReceipts")}
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