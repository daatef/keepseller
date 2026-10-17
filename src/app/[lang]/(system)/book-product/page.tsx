'use client';

import React, { useEffect, useState } from 'react';
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Separator } from "@/src/components/ui/separator";
import { SidebarTrigger } from "@/src/components/ui/sidebar";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Loader from "@/src/components/loader";
import { useTranslation } from "@/src/lib/useTranslation";
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BookProductPage() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const [productName, setProductName] = useState('');
  const [clientName, setClientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const router = useRouter();
  const { data: session, error } = useSWR("/api/session", fetcher);
  const { data: bookings, mutate } = useSWR("/api/bookings", fetcher);

  useEffect(() => {
    if (session === null) router.push("/");
    else if (session && !session.user?.isSubscribed) router.push(`../${lang}/pricing`);
  }, [session, router]);

  if (error) return <div>{t("bookingDashboard.error")}</div>;
  if (!session || session === undefined || bookings === undefined) return <Loader />;

  const handleBooking = async () => {
    if (!productName || !clientName || !mobileNumber || !quantity) {
      toast.error(t("toast.fillAllFields"));
      return;
    }

    const mobileNumParsed = Number(mobileNumber);
    const quantityParsed = Number(quantity);

    if (isNaN(mobileNumParsed) || isNaN(quantityParsed)) {
      toast.error(t("toast.invalidNumber"));
      return;
    }

    const res = await fetch('/api/bookings', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName,
        clientName,
        mobileNumber: mobileNumParsed,
        quantity: quantityParsed,
        notes,
        status: "PENDING",
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(t("toast.bookingSuccess"));
      setProductName('');
      setClientName('');
      setMobileNumber('');
      setQuantity('');
      setNotes('');
      mutate(); // refresh bookings
    } else {
      toast.error(data.error || t("toast.bookingFailed"));
    }
  };

  const updateStatus = async (bookingId: number | string, newStatus: string) => {
    const id = Number(bookingId);
    if (isNaN(id)) {
      toast.error(t("InvalidbookingID"));
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(t("toast.statusUpdated"));
        mutate(); // refresh bookings
      } else {
        console.error("Update failed:", data);
        toast.error(data.error || t("toast.updateFailed"));
      }
    } catch (err) {
      console.error("Network or server error:", err);
      toast.error(t("toast.updateFailed"));
    }
  };

  return (
    <SidebarProvider className="primary-colors">
     
      <AppSidebar
        className="fixed scrollbar-hide overflow-y-scroll top-0 z-99999 h-full w-64 primary-colors ltr:left-0 rtl:right-0"
        variant="inset"
        user={{
          name: session.user.name || "Guest",
          email: session.user.email || "Not logged in",
          avatar: session.user.image || "/default-avatar.png",
        }}
      />

      <SidebarInset>
        <header className="z-30 secondary-background flex h-[var(--header-height)] shrink-0 items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h1 className="text-base font-medium">{t("booking.title")}</h1>
        </header>

        <main className="secondary-colors flex flex-1 flex-col gap-8 p-6">

              {/* ⚫ Grid */}
                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          
          {/* Booking Form */}
          <Card className="z-30 w-full primary-colors border-theme">
            <CardHeader>
              <CardTitle>{t("booking.pageTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="my-2">{t("booking.productName")}</Label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={t("booking.placeholders.productName")}
                  className="secondary-colors"
                />
              </div>
              <div>
                <Label className="my-2">{t("booking.clientName")}</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t("booking.placeholders.clientName")}
                  className="secondary-colors"
                />
              </div>
              <div>
                <Label className="my-2">{t("booking.mobileNumber")}</Label>
                <Input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder={t("booking.placeholders.mobileNumber")}
                  className="secondary-colors"
                />
              </div>
              <div>
                <Label className="my-2">{t("booking.quantity")}</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={t("booking.placeholders.quantity")}
                  className="secondary-colors"
                />
              </div>
              <div>
                <Label className="my-2">{t("booking.notes")}</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("booking.placeholders.notes")}
                  className="secondary-colors"
                />
              </div>

              <Button className="px-6 third-colors" onClick={handleBooking}>
                {t("booking.submitButton")}
              </Button>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="w-full z-30 primary-colors rtl:text-right">
            <CardHeader>
              <CardTitle>{t("booking.tableTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="secondary-colors border-b">
                    <TableHead>ID</TableHead>
                    <TableHead>{t("booking.clientName")}</TableHead>
                    <TableHead>{t("booking.productName")}</TableHead>
                    <TableHead>{t("booking.mobileNumber")}</TableHead>
                    <TableHead>{t("booking.quantity")}</TableHead>
                    <TableHead>{t("booking.status")}</TableHead>
                    <TableHead>{t("booking.notes")}</TableHead>
                    <TableHead>{t("booking.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="border-b">
                  {bookings.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.id}</TableCell>
                      <TableCell>{booking.clientName}</TableCell>
                      <TableCell>{booking.productName}</TableCell>
                      <TableCell>{booking.mobileNumber}</TableCell>
                      <TableCell>{booking.quantity}</TableCell>
                      <TableCell>
                        <select
                          value={booking.status}
                          onChange={(e) => updateStatus(booking.id, e.target.value)}
                          className="bg-[var(--primary-background-color)] text-[var(--primary-text-color)] text-sm rounded px-2"
                        >
                          <option value="PENDING">{t("select.pending")}</option>
                          <option value="CONFIRMED">{t("select.confirmed")}</option>
                          <option value="CANCELLED">{t("select.cancelled")}</option>
                          <option value="COMPLETED">{t("select.completed")}</option>
                        </select>
                      </TableCell>
                        <TableCell>{booking.notes || "-"}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-xs">
                          {new Date(booking.bookedAt).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
