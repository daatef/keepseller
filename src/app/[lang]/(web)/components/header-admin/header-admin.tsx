"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import CustomLink from "../../../../../custom-components/custom-link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/src/lib/useTranslation";
export default function HeaderAdmin() {


  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");



  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0B0B]/80 backdrop-blur-xl">
      <div className="flex items-center justify-center px-6 py-3 text-center max-w-screen-xl mx-auto secondary-colors">

        {/* LEFT */}
        <div className="flex items-center gap-10 secondary-colors">
          {/* Logo */}
          <h1 className="text-xl font-bold tracking-tight">
            <span className="bolder">Administrator Mode</span>
            <span className="bolder">.</span>
          </h1>

          {/* Nav */}
          <CustomLink className="flex bolder font-bold items-center py-0 px-2 text-sm" href={`../../${lang}/about`}>
            {t('about')}
        </CustomLink>
        <CustomLink className="flex bolder font-bold items-center py-0 px-2 text-sm" href={`../../${lang}/pricing`}>
            {t('pricing')}
        </CustomLink>
        <CustomLink className="flex bolder font-bold items-center py-0 px-2 text-sm" href={`../../${lang}/order-form`}>
            {t('order')}
        </CustomLink>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">


          {/* Notification */}
          <button className="relative p-2 bolder rounded-lg hover:bg-white/5 transition">
            <Bell className="w-5 h-5 bolder text-black-400 hover:text-white" />
            <span className="absolute bolder top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
          </button>

        </div>
      </div>
    </header>
  );
}