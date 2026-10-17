'use client';

import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { SidebarTrigger } from "@/src/components/ui/sidebar";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import useSWR from "swr";
import { format } from 'date-fns';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { useRouter } from "next/navigation";
import Loader from "@/src/components/loader";
import { Search, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import 'flatpickr/dist/flatpickr.min.css';
import amiriFont from "@/src/fonts/amiri.js"; // export default "<base64string>";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { motion } from 'framer-motion';


const Flatpickr = dynamic(() => import('react-flatpickr'), { ssr: false });

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Winning {
  id: number;
  nameOfProduct: string;
  winQuantity: number;
  quantityOfProducts: number;
  createdAt: string;
}

export default function WinningPage({ params }: { params: { lang: string } }) {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  const tableRef = useRef<HTMLTableElement | null>(null);


  const fetchWinnings = async () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    try {
      const res = await fetch(`/api/winning?${params.toString()}`);
      const data = await res.json();
      setWinnings(data);
    } catch (err) {
      console.error('Error fetching winnings:', err);
    }
  };

  useEffect(() => {
    fetchWinnings();
  }, []);

  const totalWinnings = winnings.reduce((acc, w) => acc + Number(w?.winQuantity || 0), 0);
  const totalProducts = winnings.reduce((acc, w) => acc + Number(w?.quantityOfProducts || 0), 0);

  const router = useRouter();
  const { data: session, error } = useSWR("/api/session", fetcher);

  useEffect(() => {
    if (session === null) {
      router.push("/");
    } else if (session && !session.user?.isSubscribed) {
      router.push(`../${lang}/pricing`);
    }
  }, [session, router]);



// ✅ Export as PDF with Arabic font support
const handlePDF = () => {
  const doc = new jsPDF({ orientation: "l" });
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");
  doc.setFontSize(14);

   doc.text(t("winning.heading"), lang === "ar" ? 280 : 14, 10, {
    align: lang === "ar" ? "right" : "left",
  });

  autoTable(doc, {
    html: tableRef.current!,
    styles: { font: "Amiri" },
    headStyles: { font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });

  doc.save("winnings.pdf");
};



// ✅ Export as Excel
const handleExcel = () => {
  const ws = XLSX.utils.table_to_sheet(tableRef.current);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Winnings");
  XLSX.writeFile(wb, "winnings.xlsx");
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
  link.download = "winnings.csv";
  link.click();
};








  if (error) return <div>{t("dashboard.error")}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;
  

  return (
    <div className="winning-page">
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
          className="fixed scrollbar-hide overflow-y-scroll top-0 z-99999 h-full w-64 primary-colors transition-all duration-300 ease-in-out ltr:left-0 rtl:right-0 group-data-[collapsible=offcanvas]:ltr:-left-64 group-data-[collapsible=offcanvas]:rtl:-right-64"
          variant="inset"
          user={{
            name: session.user.name || "Guest",
            email: session.user.email || "Not logged in",
            avatar: session.user.image || "/default-avatar.png",
          }}
        />
        <SidebarInset>
          <header className="secondary-background flex h-[var(--header-height)] shrink-0 items-center gap-2">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
              <SidebarTrigger className="-ml-1 rtl:-mr-1" />
              <Separator orientation="vertical" className="mx-2 h-4" />
              <h1 className="text-base font-medium">{t('winning.title')}</h1>
              <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
                <Link className="flex items-center z-20" href={`/${lang}/search-items`}>
                  <Search className="h-4 w-4 ml-2 primary-text" />
                </Link>
              </div>
            </div>
          </header>

          <main className="secondary-colors">

                {/* ⚫ Grid */}
                  <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            
                  {/* 🟡 Yellow Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
            


            <div className="flex flex-1 flex-col">
              <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">{t('winning.heading')}</h1>

                <div className="p-0 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="z-30 primary-colors py-16 rounded-xl border-theme">
                    <p className="text-muted-foreground text-sm">{t('winning.totalWinnings')}</p>
                    <p className="text-2xl font-semibold">${totalWinnings.toFixed(2)}</p>
                  </div>
                  <div className="z-30 primary-colors py-16 rounded-xl border-theme">
                    <p className="text-muted-foreground text-sm">{t('winning.totalSold')}</p>
                    <p className="text-2xl font-semibold">{totalProducts}</p>
                  </div>
                </div>

                <div className="relative primary-colors py-6 px-6 rounded-xl border-theme z-30 space-y-4">
                  <div className="z-30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-4">
                      {/* Start Date */}
                      <div className="relative z-30 w-full">
                        <label className="absolute left-3 top-1 text-white text-sm pointer-events-none">
                          {t('winningfilterstartDate')}
                        </label>
                        <Flatpickr
                          options={{
                            dateFormat: 'Y-m-d',
                            disableMobile: true, // Use Flatpickr UI even on mobile
                          }}
                          value={startDate}
                          onChange={([date]) =>
                            setStartDate(date?.toISOString().split('T')[0] ?? '')
                          }
                          placeholder={t('winningfilterstartDate')}
                          className="z-30 secondary-colors   rounded px-3 pt-5 pb-1 w-full"
                        />
                      </div>
                    
                      {/* End Date */}
                      <div className="relative z-30 w-full">
                        <label className="absolute left-3 top-1 text-white text-sm pointer-events-none">
                          {t('winningfilterendDate')}
                        </label>
                        <Flatpickr
                          options={{
                            dateFormat: 'Y-m-d',
                            disableMobile: true,
                          }}
                          value={endDate}
                          onChange={([date]) =>
                            setEndDate(date?.toISOString().split('T')[0] ?? '')
                          }
                          placeholder={t('winningfilterendDate')}
                          className="z-30 secondary-colors   rounded px-3 pt-5 pb-1 w-full"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 z-30 ">
                      <Button onClick={fetchWinnings} className="z-30 px-10 py-2 secondary-colors">
                        {t('winningfilterbutton')}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto z-30 ">
                     <div className="flex gap-2 mb-4 z-30 ">
                      <Button onClick={handlePDF} className="secondary-colors flex items-center gap-1 z-30 ">
                        <FileText size={16} /> PDF
                      </Button>
                      <Button onClick={handleExcel} className="secondary-colors flex items-center gap-1 z-30 ">
                        <FileSpreadsheet size={16} /> Excel
                      </Button>
                      <Button onClick={handleCSV} className="secondary-colors flex items-center gap-1 z-30 ">
                        CSV
                      </Button>
                    </div>
                    <Table ref={tableRef} className="min-w-full text-sm relative z-30">
                      <TableHeader className="secondary-colors border-b">
                        <TableRow>
                          <TableHead className="px-2 py-1">{t('winning.table.date')}</TableHead>
                          <TableHead className="px-2 py-1">{t('winning.table.winnings')}</TableHead>
                          <TableHead className="px-2 py-1">{t('winning.table.product')}</TableHead>
                          <TableHead className="px-2 py-1">{t('winning.table.quantity')}</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {winnings.map((win) => (
                          <TableRow key={win.id} className="primary-colors border-b">
                            <TableCell className="px-2 py-1" suppressHydrationWarning>
                              {typeof window === "undefined" ? "" : format(new Date(win.createdAt), "PPPpp")}
                            </TableCell>
                            <TableCell className="px-2 py-1">
                              ${win.winQuantity.toFixed(2)}
                            </TableCell>
                            <TableCell className="px-2 py-1">
                              {win.nameOfProduct}
                            </TableCell>
                            <TableCell className="px-2 py-1">
                              {win.quantityOfProducts}
                            </TableCell>
                          </TableRow>
                        ))}

                        {winnings.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="px-4 py-2 text-center secondary-colors">
                              {t('winning.table.noData')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
