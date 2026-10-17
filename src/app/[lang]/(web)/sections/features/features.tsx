"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const params = useParams();
  const lang = (params?.lang as "en" | "ar") || "en";
  const t = useTranslation(lang);

  return (
    <section className="relative w-full bg-black text-white py-24 overflow-hidden">

      {/* 🟡 Yellow Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[180px] rounded-full"></div>

      {/* ⚫ Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* 🔥 Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t("featuresTitle")}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t("featuresSubtitle") ||
              "Everything you need to manage your business with precision and simplicity."}
          </p>
        </div>

        {/* 💎 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

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

      </div>
    </section>
  );
}