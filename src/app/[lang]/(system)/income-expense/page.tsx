'use client';

import { useEffect, useRef, useState } from "react";
import { AppSidebar } from '@/src/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/src/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/tabs';
import { Separator } from '@/src/components/ui/separator';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Loader from '@/src/components/loader';
import { useTranslation } from '@/src/lib/useTranslation';
import { format } from 'date-fns';
import { FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import amiriFont from "@/src/fonts/amiri.js"; // export default "<base64string>";
import { Calendar } from "lucide-react";
import Flatpickr from "react-flatpickr"
import "flatpickr/dist/flatpickr.min.css"
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function IncomeExpensePage() {
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const router = useRouter();

  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeReason, setIncomeReason] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const tableRefIncome = useRef<HTMLTableElement>(null);
  const tableRefExpense = useRef<HTMLTableElement>(null);

  const startDateRef = useRef<any>(null)
  const endDateRef = useRef<any>(null)
const [startDate, setStartDate] = useState<string>("");
const [endDate, setEndDate] = useState<string>("");

  const { data: session, error } = useSWR('/api/session', fetcher);


  useEffect(() => {
    if (session === null) router.push('/');
    else if (session && !session.user?.isSubscribed) router.push(`../${lang}/pricing`);
  }, [session, router, lang]);

  useEffect(() => {
    fetch('/api/income').then((res) => res.json()).then(setIncomes);
    fetch('/api/expense').then((res) => res.json()).then(setExpenses);
  }, []);

  const validateAmount = (amount: string) => {
    if (!amount || isNaN(Number(amount))) {
      toast.error(t('incomeExpensetoast.enterValidNumber'));
      return false;
    }
    return true;
  };

  const handleAddIncome = async () => {
    if (!validateAmount(incomeAmount)) return;

    const res = await fetch('/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(incomeAmount),
        reason: incomeReason,
      }),
    });

    if (res.ok) {
      toast.success(t('incomeExpensetoast.entryAdded'));
      window.location.reload();
    } else {
      toast.error(t('incomeExpensetoast.failedUpdate'));
    }
  };

  const handleAddExpense = async () => {
    if (!validateAmount(expenseAmount)) return;

    const res = await fetch('/api/expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(expenseAmount),
        reason: expenseReason,
      }),
    });

    if (res.ok) {
      toast.success(t('incomeExpensetoast.entryAdded'));
      window.location.reload();
    } else {
      toast.error(t('incomeExpensetoast.failedUpdate'));
    }
  };



  // ✅ Income Table Print
// Export as PDF with Arabic font support
const IncomehandlePDF = () => {
  const doc = new jsPDF({ orientation: "l" });
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");
  doc.setFontSize(14);

  doc.text(t("incomeExpense.income"), 14, 10, {
    align: lang === "ar" ? "right" : "left",
  });

  autoTable(doc, {
    html: tableRefIncome.current!,
    styles: { font: "Amiri" },
    headStyles: { font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });

  doc.save("income-history.pdf");
};

// Export as Excel
const IncomehandleExcel = () => {
  const ws = XLSX.utils.table_to_sheet(tableRefIncome.current);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Income History");
  XLSX.writeFile(wb, "income-history.xlsx");
};

// Export as CSV (with BOM for Arabic)
const IncomehandleCSV = () => {
  const ws = XLSX.utils.table_to_sheet(tableRefIncome.current);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "income-history.csv";
  link.click();
};

// ✅ Expense Table Print
// Export as PDF with Arabic font support
const ExpensehandlePDF = () => {
  const doc = new jsPDF({ orientation: "l" });
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");
  doc.setFontSize(14);

  doc.text(t("incomeExpense.expense"), 14, 10, {
    align: lang === "ar" ? "right" : "left",
  });

  autoTable(doc, {
    html: tableRefExpense.current!,
    styles: { font: "Amiri" },
    headStyles: { font: "Amiri" },
    bodyStyles: { font: "Amiri" },
  });

  doc.save("expense-history.pdf");
};

// Export as Excel
const ExpensehandleExcel = () => {
  const ws = XLSX.utils.table_to_sheet(tableRefExpense.current);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expense History");
  XLSX.writeFile(wb, "expense-history.xlsx");
};

// Export as CSV (with BOM for Arabic)
const ExpensehandleCSV = () => {
  const ws = XLSX.utils.table_to_sheet(tableRefExpense.current);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expense-history.csv";
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
  


  if (error) return <div>{t('incomeExpensedashboard.error')}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <SidebarProvider className="primary-colors" style={{
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)',
    } as React.CSSProperties}>



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
        className="fixed top-0 scrollbar-hide overflow-y-scroll z-99999 h-full w-64 primary-colors transition-all duration-300 ease-in-out ltr:left-0 rtl:right-0"
        variant="inset"
        user={{
          name: session.user.name || 'Guest',
          email: session.user.email || 'Not logged in',
          avatar: session.user.image || '/default-avatar.png',
        }}
      />

      <SidebarInset>
        <header className="z-30 secondary-background flex h-[var(--header-height)] items-center gap-2">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{t('incomeExpense.title')}</h1>
            <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
              <Link href={`/${lang}/search-items`} className="flex items-center z-30">
                <Search className="h-4 w-4 ml-2 primary-text" />
              </Link>
            </div>
          </div>
        </header>

        <main className=" secondary-colors flex flex-1 flex-col p-6">
              {/* ⚫ Grid */}
                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          
            <div className="primary-colors px-4 py-4 border-theme rounded-xl">
          <div className="flex flex-1 flex-col">
                {/* the filter */}
                <div className="flex flex-wrap items-end gap-6 mb-6">
                
                  {/* Start Date */}
                  <div className="flex flex-col space-y-2 relative z-30">
                    <Label className="text-sm font-medium">{t("filterStartDate")}</Label>
                
                    <div
                      className="relative cursor-pointer"
                      onClick={() => startDateRef.current?.flatpickr?.open()}
                    >
                      <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                
                      <Flatpickr
                        ref={startDateRef}
                        options={{
                          dateFormat: "Y-m-d",
                          disableMobile: true, // ensures Flatpickr UI on mobile
                        }}
                        value={startDate}
                        placeholder={t("filterStartDate")}
                        onChange={([date]) => setStartDate(date?.toISOString().split("T")[0] ?? "")}
                        className="pl-8 w-48 secondary-colors   rounded px-3 py-1.5"
                      />
                    </div>
                  </div>
                
                  {/* End Date */}
                  <div className="flex flex-col space-y-2 relative z-30">
                    <Label className="text-sm font-medium">{t("filterEndDate")}</Label>
                
                    <div
                      className="relative cursor-pointer"
                      onClick={() => endDateRef.current?.flatpickr?.open()}
                    >
                      <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                
                      <Flatpickr
                        ref={endDateRef}
                        options={{
                          dateFormat: "Y-m-d",
                          disableMobile: true,
                        }}
                        value={endDate}
                        placeholder={t("filterEndDate")}
                        onChange={([date]) => setEndDate(date?.toISOString().split("T")[0] ?? "")}
                        className="pl-8 w-48 secondary-colors   rounded px-3 py-1.5"
                      />
                    </div>
                  </div>
                
                </div>
          
<Tabs defaultValue="income" className="w-full rtl:text-right z-30">

  <TabsList className="bg-muted p-1 mb-4 flex flex-wrap gap-2 ltr:justify-start rtl:justify-end">
    <TabsTrigger
      value="income"
      className="px-4 py-2 font-semibold transition-colors duration-200 data-[state=active]:bg-[var(--third-background-color)] data-[state=active]:text-[var(--third-text-color)]"
    >
      {t('incomeExpense.income')}
    </TabsTrigger>

    <TabsTrigger
      value="expense"
      className="px-4 py-2 font-semibold transition-colors duration-200 data-[state=active]:bg-[var(--third-background-color)] data-[state=active]:text-[var(--third-text-color)]"
    >
      {t('incomeExpense.expense')}
    </TabsTrigger>
  </TabsList>


  {/* ================= INCOME TAB ================= */}
  <TabsContent value="income">

    <div className="flex gap-2 mb-4">
      <Button onClick={IncomehandlePDF} className="secondary-colors flex items-center gap-1">
        <FileText size={16} /> PDF
      </Button>

      <Button onClick={IncomehandleExcel} className="secondary-colors flex items-center gap-1">
        <FileSpreadsheet size={16} /> Excel
      </Button>

      <Button onClick={IncomehandleCSV} className="secondary-colors flex items-center gap-1">
        CSV
      </Button>
    </div>

    <Card className="w-full primary-colors border-theme">
      <CardHeader>
        <CardTitle className="rtl:text-right">{t('incomeExpense.addIncome')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 rtl:text-right">

        <div>
          <Label className="mb-1 block">{t('form.amount')}</Label>
          <Input
            type="number"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            placeholder={t('form.placeholders.amount')}
            className="w-full secondary-colors"
          />
        </div>

        <div>
          <Label className="mb-1 block">{t('form.reason')}</Label>
          <Input
            value={incomeReason}
            onChange={(e) => setIncomeReason(e.target.value)}
            placeholder={t('form.placeholders.reason')}
            className="w-full secondary-colors"
          />
        </div>

        <Button onClick={handleAddIncome} className="px-6 third-colors">
          {t('form.submit')}
        </Button>

      </CardContent>
    </Card>


    <div className="mt-6 w-full overflow-x-auto">
      <h3 className="font-semibold mb-2">{t('incomeExpense.incomeHistory')}</h3>

      <table ref={tableRefIncome} className="min-w-full text-sm">
        <thead className="secondary-colors border-b">
          <tr className="text-left rtl:text-right">
            <th className="p-2">{t('form.date')}</th>
            <th className="p-2">{t('form.amount')}</th>
            <th className="p-2">{t('form.reason')}</th>
          </tr>
        </thead>

        <tbody>
          {filterByDate(incomes).map((entry) => (
            <tr key={entry.id} className="primary-colors border-b">
              <td className="p-2">{format(new Date(entry.createdAt), 'PPPpp')}</td>
              <td className="p-2">${parseFloat(entry.amount?.toString() || '0').toFixed(2)}</td>
              <td className="p-2">{entry.reason || '-'}</td>
            </tr>
          ))}

          {incomes.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center">
                {t('historytableempty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

  </TabsContent>



  {/* ================= EXPENSE TAB ================= */}
  <TabsContent value="expense">

    <div className="flex gap-2 mb-4">
      <Button onClick={ExpensehandlePDF} className="secondary-colors flex items-center gap-1">
        <FileText size={16} /> PDF
      </Button>

      <Button onClick={ExpensehandleExcel} className="secondary-colors flex items-center gap-1">
        <FileSpreadsheet size={16} /> Excel
      </Button>

      <Button onClick={ExpensehandleCSV} className="secondary-colors flex items-center gap-1">
        CSV
      </Button>
    </div>


    <Card className="w-full primary-colors">
      <CardHeader>
        <CardTitle className="rtl:text-right">{t('incomeExpense.addExpense')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 rtl:text-right">

        <div>
          <Label className="mb-1 block">{t('form.amount')}</Label>
          <Input
            type="number"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder={t('form.placeholders.amount')}
            className="w-full secondary-colors"
          />
        </div>

        <div>
          <Label className="mb-1 block">{t('form.reason')}</Label>
          <Input
            value={expenseReason}
            onChange={(e) => setExpenseReason(e.target.value)}
            placeholder={t('form.placeholders.reason')}
            className="w-full secondary-colors"
          />
        </div>

        <Button onClick={handleAddExpense} className="px-6 third-colors">
          {t('form.submit')}
        </Button>

      </CardContent>
    </Card>


    <div className="mt-6 w-full overflow-x-auto">
      <h3 className="font-semibold mb-2">{t('incomeExpense.expenseHistory')}</h3>

      <table ref={tableRefExpense} className="min-w-full text-sm">
        <thead className="secondary-colors border-b">
          <tr className="text-left rtl:text-right">
            <th className="p-2">{t('form.date')}</th>
            <th className="p-2">{t('form.amount')}</th>
            <th className="p-2">{t('form.reason')}</th>
          </tr>
        </thead>

        <tbody>
          {filterByDate(expenses).map((entry) => (
            <tr key={entry.id} className="primary-colors border-b">
              <td className="p-2">{format(new Date(entry.createdAt), 'PPPpp')}</td>
              <td className="p-2">${parseFloat(entry.amount?.toString() || '0').toFixed(2)}</td>
              <td className="p-2">{entry.reason || '-'}</td>
            </tr>
          ))}

          {expenses.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center">
                {t('historytableempty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

  </TabsContent>

</Tabs>

          </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
