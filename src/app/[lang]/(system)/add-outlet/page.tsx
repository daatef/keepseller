'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import toast from 'react-hot-toast';
import { Separator } from "@/src/components/ui/separator";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import useSWR from 'swr';
import Loader from '@/src/components/loader';
import { motion } from 'framer-motion';
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AddOutletPage() {
  const router = useRouter();
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const { data: session, error: sessionError } = useSWR("/api/session", fetcher);
  const { data: outlets = [], mutate } = useSWR('/api/outlets', fetcher);

  useEffect(() => {
    if (session === null) {
      router.push("/");
    } else if (session && !session.user?.isSubscribed) {
    router.push(`../${lang}/pricing`);
    }
  }, [session, router]);

  const handleAddOutlet = async () => {
    if (!name.trim()) {
      toast.error(t('toast.outletNameRequired'));
      return;
    }

    const res = await fetch('/api/outlets', {
      method: 'POST',
      body: JSON.stringify({ name, location })
    });

    if (res.ok) {
      toast.success(t('toast.outletCreated'));
      setName('');
      setLocation('');
      mutate();
    } else {
      const err = await res.json();
      toast.error(err.error || t('toast.outletFailed'));
    }
  };

  if (sessionError) return <div>{t("outletDashboard.error")}</div>;
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
            <h1 className="text-base font-medium">{t('outlet.title')}</h1>
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
          
          <Card className="z-30 w-full h-max primary-colors border-theme">
            <CardHeader>
              <CardTitle>{t('outlet.pageTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className='mb-2'>{t('outlet.nameLabel')}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('outlet.namePlaceholder')}
                  className="secondary-colors"
                />
              </div>

              <div>
                <Label className='mb-2'>{t('outlet.locationLabel')}</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('outlet.locationPlaceholder')}
                  className="secondary-colors"
                />
              </div>

              <Button className="px-6 third-colors" onClick={handleAddOutlet}>
                {t('outlet.submitButton')}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 w-full p-5 rounded-xl overflow-x-auto z-30 border-theme">
            <h3 className="font-semibold mb-5 mt-4">{t('outlet.outletListTitle')}</h3>
            <table className="min-w-full text-sm border rounded overflow-hidden">
              <thead className="secondary-colors border-b">
                <tr className="text-left rtl:text-right">
                  <th className="p-2">{t('outlet.nameLabel')}</th>
                  <th className="p-2">{t('outlet.locationLabel')}</th>
                  <th className="p-2">{t('outletForm.date')}</th>
                </tr>
              </thead>
              <tbody>
                {outlets.map((outlet: any) => (
                  <tr key={outlet.id} className="primary-colors border-b">
                    <td className="p-2">{outlet.name}</td>
                    <td className="p-2">{outlet.location || '-'}</td>
                    <td className="p-2">{new Date(outlet.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {outlets.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center">
                      {t('historytableempty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
