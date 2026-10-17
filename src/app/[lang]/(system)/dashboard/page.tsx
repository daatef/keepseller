"use client";
import React from 'react';


import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import Loader from "@/src/components/loader";
import { AppSidebar } from "@/src/components/app-sidebar";
import { ChartWinningsInteractive } from "@/src/components/chart-area-interactive";
import { ChartBarLabel } from "@/src/components/chart-bar-label";
import Notifications from '../notificasions/page';
import { SectionCards } from "@/src/components/section-cards";
import { ResetDatabaseButton } from "@/src/components/ResetDatabaseButton";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { Search } from "lucide-react";
import ClientOnly from "../../ClientOnly";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { LowStockChart } from "@/src/components/low-stock-chart";
import SettingsPage from "@/src/custom-components/settings";
import { motion } from 'framer-motion';


const fetcher = (url: string) => fetch(url).then((res) => res.json());






export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]); 
useEffect(() => {
  fetch("/api/products/low-stock")
    .then((res) => res.json())
    .then((data) => setProducts(data));
}, []);
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const router = useRouter();
  const { data: session, error } = useSWR("/api/session", fetcher);

  useEffect(() => {
  if (session === null) {
    router.push("/");
  } else if (session && !session.user?.isSubscribed) {
    router.push(`../${lang}/pricing`);
  }
  }, [session, router]);




  const { data } = useSWR("/api/settings", fetcher);
  const businessName = data?.businessName || "";


  if (error) return <div>{t("dashboard.error")}</div>;

  // ✅ Show loader while waiting for session
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <ClientOnly>

      <div className="overflow-hidden">
        
     
        <SidebarProvider
          className="primary-colors"
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
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
                      avatar: session.user.image || "/default-avatar.png"
                    }}
                  />
                  <SidebarInset>
                    <header className="z-30 secondary-background flex h-[var(--header-height)] shrink-0 items-center gap-2">
                      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                        <SidebarTrigger className="-ml-1 rtl:-mr-1" />
                        <Separator orientation="vertical" className="mx-2 h-4" />
                        <h1 className="text-base font-medium">{t("dashboard.title")}</h1>
                        <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
                          <Link className="flex items-center z-20" href={`/${lang}/search-items`}>
                            <Search className="h-4 w-4 ml-2 primary-text" />
                          </Link>
                        </div>
                      </div>
                    </header>

      <div dir={lang === "ar" ? "rtl" : "ltr"}>

            <main className="secondary-colors">


    {/* ⚫ Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* 🟡 Yellow Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>



              <Notifications />

              <h1 className="text-2xl font-bold primary-colors py-15 px-6">
      👋      {t("welcomeBack")}, {businessName}
             </h1>



              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards />
                    <div className="px-4 lg:px-6 z-20">
                      <ChartWinningsInteractive />
                    </div>
                    {products.length > 0 && (
                        <div className="px-4 lg:px-6 z-20">
                          <LowStockChart products={products} />
                        </div>
                      )}
                    <div className="px-4 lg:px-6 z-20">
                      <ChartBarLabel />
                    </div>
                    
                  </div>
                </div>
              </div>


            </main>
            </div>

          </SidebarInset>
        </SidebarProvider>
      </div>
    </ClientOnly>
  );
}
