'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { toast } from 'react-hot-toast';
import { Separator } from "@/src/components/ui/separator";
import Link from "next/link";
import { format } from 'date-fns';
import useSWR from "swr";
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/src/lib/useTranslation';
import Loader from "@/src/components/loader";
import { Search, FileText, FileSpreadsheet } from "lucide-react";
import amiriFont from "@/src/fonts/amiri.js"; // export default "<base64string>";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Calendar } from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// ✅ Interfaces OUTSIDE the component
interface Pocket {
  moneyOnHand: number;
}

interface PocketHistory {
  id: number;
  amount: string | number;
  createdAt: string;  // ISO string from DB
  updatedAt: string;  // ISO string from DB
}

export default function PocketPage() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const router = useRouter();

  const [moneyOnHand, setMoneyOnHand] = useState<number>(0);
  const [newMoney, setNewMoney] = useState<string>('');
  const [history, setPocketHistory] = useState<PocketHistory[]>([]); // ✅ typed
  const tableRef = useRef<HTMLTableElement | null>(null);
 

  const { data: session, error } = useSWR("/api/session", fetcher);

 const startDateRef = useRef<any>(null)
  const endDateRef = useRef<any>(null)
const [startDate, setStartDate] = useState<string>("");
const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (session === null) {
      router.push("/");
    } else if (session && !session.user?.isSubscribed) {
      router.push(`../${lang}/pricing`);
    }
  }, [session, router, lang]);

  useEffect(() => {
    fetch('/api/pocket')
      .then(res => res.json())
      .then((data: Pocket) => {
        if (data.moneyOnHand) {
          setMoneyOnHand(parseFloat(String(data.moneyOnHand)));
        }
      })
      .catch(console.error);

    fetch('/api/pocket/history')
      .then(res => res.json())
      .then((data: PocketHistory[]) => setPocketHistory(data))
      .catch(console.error);
  }, []);

  const updateMoney = async () => {
    if (!newMoney || isNaN(Number(newMoney))) {
      toast.error(t('toast.enterValidNumber'));
      return;
    }

    const res = await fetch('/api/pocket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moneyOnHand: newMoney }),
    });

    if (res.ok) {
      toast.success(t('toast.moneyUpdated'));
      setMoneyOnHand(parseFloat(newMoney));
      setNewMoney('');

      // Instead of full reload, refetch
      fetch('/api/pocket')
        .then(res => res.json())
        .then((data: Pocket) => setMoneyOnHand(parseFloat(String(data.moneyOnHand || 0))))
        .catch(console.error);

      fetch('/api/pocket/history')
        .then(res => res.json())
        .then((data: PocketHistory[]) => setPocketHistory(data))
        .catch(console.error);
    } else {
      toast.error(t('toast.failedUpdate'));
    }
  };

  // ✅ Export as PDF with correct alignment
  const handlePDF = () => {
    const doc = new jsPDF({ orientation: "l" });
    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");
    doc.setFontSize(14);

    if (lang === "ar") {
      doc.text(t("pocket.historyTitle"), 280, 10, { align: "right" });
    } else {
      doc.text(t("pocket.historyTitle"), 14, 10, { align: "left" });
    }

    autoTable(doc, {
      html: tableRef.current!,
      styles: { font: "Amiri" },
      headStyles: { font: "Amiri" },
      bodyStyles: { font: "Amiri" },
    });

    doc.save("pocket-update-history.pdf");
  };

  // ✅ Export as Excel
  const handleExcel = () => {
    const ws = XLSX.utils.table_to_sheet(tableRef.current);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pocket Update History");
    XLSX.writeFile(wb, "pocket-update-history.xlsx");
  };

  // ✅ Export as CSV with BOM for Arabic
  const handleCSV = () => {
    const ws = XLSX.utils.table_to_sheet(tableRef.current);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pocket-update-history.csv";
    link.click();
  };

  const filterByDate = <T extends { updatedAt: string }>(data: T[]): T[] => {
  if (!startDate && !endDate) return data;
  
    return data.filter(item => {
      const itemDate = new Date(item.updatedAt).getTime();
      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() : Infinity;
      return itemDate >= start && itemDate <= end;
    });
  };
  


  if (error) return <div>{t("dashboard.error")}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  // ✅ you can now safely use history everywhere



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
            <h1 className="text-base font-medium">{t('pocket.title')}</h1>
            <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
              <Link className="flex items-center z-30" href={`/${lang}/search-items`}>
                <Search className="h-4 w-4 ml-2 primary-text" />
              </Link>
            </div>
          </div>
        </header>

        <main className="secondary-colors flex flex-1 flex-col p-6">
              {/* ⚫ Grid */}
                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          
          <Card className="z-30 w-full h-max max-w-md my-10 primary-colors border-theme">
            <CardHeader>
              <CardTitle>{t('pocket.moneyOnHand')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-bold primary-text">${moneyOnHand.toFixed(2)}</p>
              <div className="space-y-2">
                <Label htmlFor="money">{t('pocket.updateMoneyLabel')}</Label>
                <Input
                  id="money"
                  type="number"
                  placeholder={t('pocket.moneyPlaceholder')}
                  value={newMoney}
                  onChange={(e) => setNewMoney(e.target.value)}
                  className="secondary-colors"
                />
              </div>
              <Button className="px-6 third-colors" onClick={updateMoney}>
                {t('pocket.updateButton')}
              </Button>
            </CardContent>
          </Card>

        <div className="primary-colors z-30 px-6 py-6 rounded-xl border-theme">
         {/* the filter */}
          <div className="z-30 flex flex-wrap items-end gap-6 mb-6">
          
            {/* Start Date */}
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium">{t("filterStartDate")}</Label>
          
              <div
                className="relative cursor-pointer"
                onClick={() => startDateRef.current?.flatpickr?.open()}
              >
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
          
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
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
          
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
          
          </div>
          {history.length > 0 && (
            <div className="mt-6 w-full overflow-x-auto z-30">
              <h3 className="font-semibold mb-2">{t("pocket.historyTitle")}</h3>
              <div className="flex gap-2 mb-4">
                <Button onClick={handlePDF} className="secondary-colors flex items-center gap-1">
                  <FileText size={16} /> PDF
                </Button>
                <Button onClick={handleExcel} className="secondary-colors flex items-center gap-1">
                  <FileSpreadsheet size={16} /> Excel
                </Button>
                <Button onClick={handleCSV} className="secondary-colors flex items-center gap-1">
                  CSV
                </Button>
              </div>
              <table ref={tableRef} className="min-w-full text-sm border rounded overflow-hidden">
                <thead className="secondary-colors border-b">
                  <tr className="text-left rtl:text-right">
                    <th className="p-2">{t("pocket.historyDate")}</th>
                    <th className="p-2">{t("pocket.historyAmount")}</th>
                  </tr>
                </thead>
                <tbody>

                  {filterByDate(history).map((entry: any) => (
                    <tr key={entry.id} className="primary-colors border-b">
                      <td className="p-2">{format(new Date(entry.updatedAt), 'PPPpp')}</td>
                      <td className="p-2">${parseFloat(entry.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
