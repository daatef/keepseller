"use client";

import { MainNav } from './main-nav';
import HeaderClient from './header-client';
import LanguageSwitcher from '@/src/components/languageSwitcher';
import type { Session } from 'next-auth';
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/src/lib/useTranslation";

interface HeaderProps {
  session: Session | null;
}

export default function Header({ session }: HeaderProps) {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to add shadow / shrink header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[var(--web-primary-background-color)] backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-md h-14" : "shadow-none h-16 md:h-18"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        
        {/* Main Navigation */}
        <MainNav />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Conditional: Logged in → HeaderClient, Not logged in → Sign In */}
        {session ? (
          <HeaderClient session={session} />
        ) : (
          <a
            href={`/${lang}/signin`}
            className="px-3 font-bold text-sm text-white transition"
          >
            {t('signUpHeader')}
          </a>
        )}

      </div>
    </header>
  );
}
