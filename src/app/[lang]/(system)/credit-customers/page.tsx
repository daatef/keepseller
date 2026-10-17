'use client';

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import Loader from "@/src/components/loader";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "@/src/lib/useTranslation";
import { Search, ScanBarcode, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { FileText, FileSpreadsheet, Printer } from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import amiriFont from "@/src/fonts/amiri.js"; // export default "<base64string>";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CustomersPage() {
  const router = useRouter();
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", email: "", address: "" });
  const { data: customersData, mutate: mutateCustomers } = useSWR("/api/customers", fetcher);
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar") || "en");
  const { data: session, error } = useSWR("/api/session", fetcher);
  const { data: customers } = useSWR("/api/customers", fetcher);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (session === null) router.push("/");
    else if (session && !session.user?.isSubscribed)
      router.push(`../${lang}/pricing`);
  }, [session, router, lang]);




  const handleAddCustomer = async () => {
      if (!customerForm.name) return toast.error(t("nameRequired") || "Name required");
      const res = await fetch("/api/customers", {
        method: "POST",
        body: JSON.stringify(customerForm),
      });
      if (res.ok) {
        toast.success(t("customerAdded") || "Customer added");
        setCustomerForm({ name: "", phone: "", email: "", address: "" });
        mutateCustomers();
      }
    };




// 📄 PDF
const exportCustomersPDF = () => {
  const doc = new jsPDF({ orientation: "l" });

  // 🔤 Arabic Font
  doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.setFont("Amiri");

  doc.setFontSize(14);

  doc.text(t("customers") || "العملاء", 14, 10, {
    align: lang === "ar" ? "right" : "left",
  });

  const tableData = filtered.map((c: any) => [
    c.name,
    c.email,
    c.phone,
    c.address,
  ]);

  autoTable(doc, {
    head: [[
      t("name"),
      t("email"),
      t("phone"),
      t("address"),
    ]],

    body: tableData,

    styles: {
      font: "Amiri",
      halign: lang === "ar" ? "right" : "left",
    },

    headStyles: {
      font: "Amiri",
      halign: lang === "ar" ? "right" : "left",
    },

    bodyStyles: {
      font: "Amiri",
    },
  });

  doc.save("customers.pdf");
};


// 📊 Excel
const exportCustomersExcel = () => {
  const data = filtered.map((c: any) => ({
    [t("name")]: c.name,
    [t("email")]: c.email,
    [t("phone")]: c.phone,
    [t("address")]: c.address,
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers");

  XLSX.writeFile(wb, "customers.xlsx");
};


// 📁 CSV
const exportCustomersCSV = () => {
  const data = filtered.map((c: any) => ({
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "customers.csv";
  link.click();
};





 const filtered = (customers || []).filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );


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
            <h1 className="text-base font-medium">{t('creditCustomers')}</h1>
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




          

             {/* ADD CUSTOMER */}
              <Card className="z-50 relative w-full h-max primary-colors border-theme my-6">
                <CardHeader><CardTitle>{t("addCustomer")}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {["name", "phone", "email", "address"].map(f => (
                    <Input
                      key={f}
                      className="secondary-colors"
                      placeholder={t(f)}
                      value={(customerForm as any)[f]}
                      onChange={(e) => setCustomerForm({ ...customerForm, [f]: e.target.value })}
                    />
                  ))}
                  <Button className="px-6 third-colors" onClick={handleAddCustomer}>{t("add")}</Button>
                </CardContent>
              </Card>




          {/* Search Customers */}
          <div className="ml-auto relative secondary-colors z-50 rounded-lg border-theme my-6">
            <Input
              placeholder={t('SearchCustomers')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


            <div className="flex relative z-999 gap-2">
              <Button onClick={exportCustomersPDF}>
                <FileText size={16} /> {t("pdf")}
              </Button>
              <Button onClick={exportCustomersExcel}>
                <FileSpreadsheet size={16} /> {t("excel")}
              </Button>
              <Button onClick={exportCustomersCSV}>
                {t("csv")}
              </Button>
            </div>
           {/* Table of Customers */}         
          <Card className="relative z-50 primary-colors my-2 border-theme">
            <CardContent>

              <Table className="border-theme">
                <TableHeader className="secondary-colors">
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead>{t('address')}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{c.address}</TableCell>
                    </TableRow>
                  ))}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        {t('noCustomerFound')}
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