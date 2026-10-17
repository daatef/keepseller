"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from '@/src/lib/useTranslation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { config, library } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { motion } from "framer-motion"; // ✅ Correct import
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';
config.autoAddCss = false;
library.add(fas);

export default function SignInPage() {
  const { lang } = useParams(); // get language from URL
  const callbackUrl = `/${lang}/dashboard`;
  const router = useRouter();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const { data: session } = useSession();

  return (
    <>
      <Header session={session} />

    <div className="min-h-screen relative bg-black text-white flex flex-col lg:flex-row overflow-hidden">
      
      {/* 🔹 Subtle Grid Background */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Left branding / illustration */}
      <div className="relative lg:w-1/2 flex flex-col justify-center items-center px-8 py-16 bg-black/90 backdrop-blur-md">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="POS Logo"
            width={140}
            height={140}
            className="mx-auto mb-6"
          />

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">
            {t("welcomeHeading")}
          </h1>

          <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
            {t("welcomeDescription")}
          </p>

          {/* Go Back */}
          <div
            onClick={() => router.push(`/${lang}/`)}
            className="inline-flex items-center gap-2 cursor-pointer text-yellow-400 font-semibold hover:text-yellow-300 transition"
          >
            <FontAwesomeIcon icon={['fas', 'arrow-left']} />
            <span>{t("signinReturn")}</span>
          </div>

          {/* Yellow Glow Circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-yellow-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-yellow-500/5 blur-3xl"></div>
        </div>
      </div>

      {/* Right SignIn Panel */}
      <div className="relative lg:w-1/2 flex justify-center items-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-[0_40px_100px_rgba(255,255,255,0.1)]"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            {t("signInTitle")}
          </h2>

          {/* GitHub SignIn */}
          <Button
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full mb-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold flex items-center justify-center gap-2 rounded-xl transition-all shadow-lg"
          >
            <Image src="/github-icon.png" alt="GitHub" width={20} height={20} />
            {t("signInGitHub")}
          </Button>

          {/* Demo SignIn */}
          <Button
            onClick={() => signIn("demo", { callbackUrl })}
            className="w-full mb-4 bg-gray-800 text-white hover:bg-gray-700 font-semibold rounded-xl transition"
          >
            {t("tryDemo")}
          </Button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <span className="flex-grow border-t border-white/20"></span>
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <span className="flex-grow border-t border-white/20"></span>
          </div>

          {/* Optional email/password placeholder */}
          <div className="text-center text-gray-300 text-sm">
            {t("needHelp")}{" "}
            <a href={`mailto:${t("supportEmail")}`} className="underline text-yellow-400 hover:text-yellow-300">
              {t("supportEmail")}
            </a>
          </div>

          {/* Floating Glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-yellow-500/10 blur-2xl"></div>
          <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full bg-yellow-500/5 blur-3xl"></div>
        </motion.div>
      </div>
    </div>
    </>
  );
}