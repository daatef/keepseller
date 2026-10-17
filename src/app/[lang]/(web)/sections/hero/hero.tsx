"use client";

import * as React from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { motion } from "framer-motion";
import Link from "next/link";
export default function HeroSection() {
  const params = useParams();
  const lang = (params?.lang as "en" | "ar") || "en";
  const t = useTranslation(lang);
  const callbackUrl = `/${lang}/dashboard`;

  return (
    <section className="relative py-7 md:py-2 lg:py-0 min-h-[calc(100vh-80px)] bg-black text-white flex items-center overflow-hidden">

      {/* ⚫ Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* 🟡 Yellow Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>

      <div className="relative px-6 max-w-screen-xl mx-auto px-2 sm:px-6 w-full grid md:grid-cols-2 gap-16 items-center">

        {/* 🔥 LEFT */}
        <div className="flex flex-col gap-6">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-fit px-4 py-1 text-sm rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 backdrop-blur"
          >
            ⚡ {t("newFeature") || "Smart POS System"}
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold leading-tight"
          >
            {t("heroheading")}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-gray-400 max-w-xl"
          >
            {t("herodescription")}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 flex-wrap"
          >
            {/* 🟡 Primary */}
            <button onClick={() => signIn("github", { callbackUrl })} className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:scale-105 hover:bg-yellow-300 transition shadow-lg">
              {t("getStarted") || "Start Free"}
            </button>
            

            {/* ⚪ Secondary */}
            <button onClick={() => signIn("demo", { callbackUrl })} className="px-6 py-3 rounded-xl border border-white/20 hover:border-yellow-400 hover:text-yellow-300 transition">
              {t("demo") || "Live Demo"}
            </button>
          </motion.div>

          {/* Stats */}
          <div className="flex gap-8 mt-6 text-sm text-gray-500">
            <div>
              <p className="text-yellow-400 font-bold text-lg">{t("+1K")}</p>
              {t("statsUsers")}
            </div>
            <div>
              <p className="text-yellow-400 font-bold text-lg">{t("99%")}</p>
              {t("statsUptime")}
            </div>
            <div>
              <p className="text-yellow-400 font-bold text-lg">{t("24/7")}</p>
              {t("statsSupport")}
            </div>
          </div>

        </div>

        {/* 💎 RIGHT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex justify-center"
        >

          {/* 🟡 Glow */}
          <div className="absolute w-[400px] h-[400px] bg-yellow-400/20 rounded-full blur-[120px]"></div>

          {/* Glass */}
          <div className="relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-3 shadow-[0_20px_80px_rgba(255,255,0,0.08)]">

            <Image
              src={lang === "ar" ? "/screenshot-ar.png" : "/screenshot-en.png"}
              alt="Dashboard"
              width={1200}
              height={800}
              className="rounded-xl"
            />

            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-black/80 border border-yellow-400/20 backdrop-blur-lg rounded-xl px-4 py-3 text-sm shadow-xl">
              💰 <span className="text-yellow-400">{t("floatingRevenue")}</span>
            </div>

            <div className="absolute -top-6 -right-6 bg-black/80 border border-yellow-400/20 backdrop-blur-lg rounded-xl px-4 py-3 text-sm shadow-xl">
              📦 <span className="text-yellow-400">{t("floatingInventory")}</span>
            </div>




          </div>
        </motion.div>

      </div>
    </section>
  );
}