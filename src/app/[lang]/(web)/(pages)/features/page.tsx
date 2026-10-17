"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { motion } from "framer-motion";
import Link from "next/link";

import { useSession } from "next-auth/react";
import Header from '../../components/header/header';
export default function FeaturesSection() {
  const params = useParams();
  const lang = (params?.lang as "en" | "ar") || "en";
  const t = useTranslation(lang);
  const { data: session } = useSession();

  return (
    <>
              <Header session={session} />
    <section className="relative w-full bg-black text-white py-32 overflow-hidden">


{/* ⚫ Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* 🟡 Yellow Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>



      {/* 🟡 Glow Background */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-[700px] h-[700px] bg-yellow-400/10 rounded-full blur-[200px]"></div>
      </div>

      {/* ⚫ Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t("featuresTitle") || "Powerful Features for Your Business"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-gray-400 text-lg"
          >
            {t("featuresSubtitle") || "Everything you need to manage, automate, and grow with confidence."}
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

            {Array.from({ length: 17 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        viewport={{ once: true }}
                        className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent hover:from-yellow-400/60 hover:via-yellow-300/30 transition-all duration-300"
                      >
          
                        {/* Card */}
                        <div className="relative h-full rounded-2xl bg-black/80 backdrop-blur-xl p-6 border border-white/5 group-hover:border-yellow-400/40 transition-all duration-300 overflow-hidden">
          
                          {/* 🟡 Glow on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-yellow-500/5 blur-2xl"></div>
          
                          {/* ✨ Top accent line */}
                          <div className="absolute top-0 left-0 w-0 h-[2px] bg-yellow-400 group-hover:w-full transition-all duration-500"></div>
          
                          {/* Content */}
                          <div className="relative z-10">
          
                            {/* Title */}
                            <h3 className="font-semibold text-white mb-2 text-lg group-hover:text-yellow-300 transition">
                              {t(`feature${i + 1}Title`)}
                            </h3>
          
                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition">
                              {t(`feature${i + 1}Desc`)}
                            </p>
          
                          </div>
          
                        </div>
                      </motion.div>
                    ))}

        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <Link
            href={`/${lang}/pricing`}
            className="inline-block px-8 py-4 rounded-2xl bg-yellow-400 text-black font-semibold text-lg hover:scale-105 hover:bg-yellow-300 transition shadow-lg"
            >
            {t("getStarted") || "Get Started Now"}
            </Link>
        </motion.div>
        </div>

      </div>
    </section>
    </>
  );
}