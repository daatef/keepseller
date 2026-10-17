'use client';

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/src/components/ui/sidebar";
import Loader from "@/src/components/loader";
import { useTranslation } from "@/src/lib/useTranslation";
import { Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SuppliersPage() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const router = useRouter();

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [searchTerm, setSearchTerm] = useState(""); // ✅ search state

  const { data: session } = useSWR("/api/session", fetcher);
  const { data: suppliers, mutate } = useSWR(session ? "/api/suppliers" : null, fetcher);




// ✅ Filter suppliers by searchTerm
  const filteredSuppliers = useMemo(() => {
    if (!suppliers || !Array.isArray(suppliers)) return [];
    const term = searchTerm.toLowerCase();
    return suppliers.filter((s: any) =>
      s.name?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.address?.toLowerCase().includes(term)
    );
  }, [suppliers, searchTerm]);





const handleAdd = async () => {
    if (!form.name) return toast.error(t("Name required"));

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(t("Supplier added"));
        setForm({ name: "", phone: "", email: "", address: "" });
        mutate();
      } else {
        const data = await res.json();
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Somethingwentwrong"));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch("/api/suppliers/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("ERROR RESPONSE:", data);
        throw new Error(data.error || "Failed");
      }

      toast.success(t("Deleted") || "Deleted");
      mutate();
    } catch (error: any) {
      console.error("DELETE ERROR:", error);
      toast.error(error.message || t("SomethingWentWrong"));
    }
  };












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
        <header className="secondary-background primary-text z-30 flex h-(--header-height) shrink-0 items-center gap-2">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{t("manageSuppliers")}</h1>
          </div>
        </header>

        <div className="secondary-colors flex flex-1 flex-col p-6 gap-6">

              {/* ⚫ Grid */}
                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          


          {/* ADD SUPPLIER FORM */}
          <Card className="w-full primary-colors border-theme z-30 mx-2 my-2">
            <CardHeader>
              <CardTitle className="text-xl">{t("addSupplier")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["name", "phone", "email", "address"].map((field) => (
                <Input
                  key={field}
                  placeholder={t(field) || field}
                  value={(form as any)[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="px-2 secondary-colors"
                />
              ))}
              <Button className="mx-2 px-4 third-colors" onClick={handleAdd}>
                {t("addSupplier")}
              </Button>
            </CardContent>
          </Card>

          {/* SEARCH INPUT */}
          <Input
              placeholder={t("searchSuppliers") || "Search suppliers..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
              z-50
                ml-2
                w-full
                primary-background 
                primary-text
                rounded-lg        
                px-4 py-2         
                focus:ring-2
                focus:ring-white  
                transition-all
                duration-200
                placeholder-opacity-100
              "
            />
          {/* SUPPLIERS LIST */}
          <Card className="w-full primary-colors z-30 border-theme mx-2">
            <CardHeader>
              <CardTitle className="text-xl">{t("suppliersList")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!suppliers ? (
                <Loader />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="secondary-colors border-b">
                      <TableHead>ID</TableHead>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("phone")}</TableHead>
                      <TableHead>{t("email")}</TableHead>
                      <TableHead>{t("address")}</TableHead>
                      <TableHead>{t("createdAt")}</TableHead>
                      <TableHead>{t("delete")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="primary-colors">
                    {(filteredSuppliers.length > 0 ? filteredSuppliers : []).map((s: any, index: number) => (
                      <TableRow key={s.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.phone || "-"}</TableCell>
                        <TableCell>{s.email || "-"}</TableCell>
                        <TableCell>{s.address || "-"}</TableCell>
                        <TableCell>
                          {s.createdAt
                            ? new Intl.DateTimeFormat(lang, {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }).format(new Date(s.createdAt))
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center p-4">
                          {t("NoSuppliersFound") || "No suppliers found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}