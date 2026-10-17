'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AppSidebar } from '@/src/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar';
import { Separator } from '@/src/components/ui/separator';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Search, ScanBarcode, Trash2, ShoppingCart, ImageOff } from "lucide-react";
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/src/lib/useTranslation';
import Loader from '@/src/components/loader';
import BarcodeScannerInput from '@/src/components/BarcodeScannerInput';
import Image from 'next/image';
import  SettingsPage from "@/src/custom-components/settings";
import { motion } from 'framer-motion';
const fetcher = (url: string) => fetch(url).then(res => res.json());


export default function SidebarSettingsPage() {
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const router = useRouter();

  const { data: session, error: sessionError } = useSWR('/api/session', fetcher);


  useEffect(() => {
    if (session === null) router.push('/');
    else if (session && !session.user?.isSubscribed) router.push(`../${lang}/pricing`);
  }, [session, router]);


  if (sessionError) return <div>{t('sale.dashboard.error')}</div>;
  if (!session) return <Loader />;
  if (!session.user?.isSubscribed) return null;


  return (
    <SidebarProvider className="primary-colors" style={{
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)'
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
        variant="inset"
        className="fixed scrollbar-hide overflow-y-scrolltop-0 z-99999 h-full w-64 ltr:left-0 rtl:right-0"
        user={{
          name: session.user.name || 'Guest',
          email: session.user.email || 'Not logged in',
          avatar: session.user.image || '/default-avatar.png'
        }}
      />

      <SidebarInset>
        <header className="primary-colors z-30 flex h-[var(--header-height)] items-center px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h1 className="text-base font-medium">{t('settings.title')}</h1>
          <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
            <Link href={`/${lang}/search-items`}>
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </header>

      <SettingsPage />



      </SidebarInset>
    </SidebarProvider>
  );
}
