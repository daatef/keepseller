"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Header from "../../components/header/header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config, library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
config.autoAddCss = false;
library.add(fas);

type Plan = "monthly" | "yearly" | "lifetime";

export default function PaymentSection() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as "en" | "ar") || "en";
  const t = useTranslation(lang);

  const { data: session } = useSession();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  const [billing, setBilling] = useState<Plan>("monthly");

  const plans = {
    monthly: { price: 199, label: t("monthlySubscription"), desc: t("monthlyDesc") },
    yearly: { price: 899, label: t("yearlySubscription"), desc: t("yearlyDesc") },
    lifetime: { price: 2000, label: t("lifetimeSubscription"), desc: t("lifetimeDesc") },
  };

  const activePlan = plans[billing];

  const pay = async (plan: Plan) => {
    try {
      setLoading(plan);
      setError("");

      if (!session?.user?.id) throw new Error(t("loginRequired") || "Login required");

      const res = await fetch("/api/paymob/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          plan,
          email: session.user.email,
          firstName: session.user.name?.split(" ")[0] || "User",
          lastName: session.user.name?.split(" ")[1] || "User",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("paymentFailed") || "Payment failed");

      // Redirect للصفحة المستقلة
      router.push(`/${lang}/payment?iframeURL=${encodeURIComponent(data.iframeURL)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <section className="relative w-full bg-black text-white py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[180px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">{t("makePayment")}</h2>
            <p className="text-gray-400 mb-12">{t("oneTimePaymentDescription")}</p>
          </motion.div>

          {/* Error */}
          {error && <div className="bg-red-600/20 text-red-400 px-4 py-2 rounded mb-6 text-center">{error}</div>}

          {/* Plan Toggle */}
          <div className="flex justify-center mb-14">
            <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur">
              {(["monthly", "yearly", "lifetime"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setBilling(type)}
                  className={`px-5 py-2 rounded-full text-sm transition ${
                    billing === type ? "bg-yellow-400 text-black font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {plans[type].label}
                </button>
              ))}
            </div>
          </div>

          {/* Card */}
          <motion.div
            key={billing}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-[1px] rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-transparent hover:from-yellow-400/60 transition-all"
          >
            <div className="relative p-10 rounded-3xl bg-black/80 backdrop-blur-xl border border-white/10">
              {/* Badge */}
              {billing === "yearly" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs bg-yellow-400 text-black rounded-full font-semibold shadow">
                  {t("mostPopular")}
                </div>
              )}
              {billing === "lifetime" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs bg-white text-black rounded-full font-semibold">
                  {t("bestValue")}
                </div>
              )}

              <h3 className="text-xl text-gray-400 mb-4">{activePlan.label}</h3>
              <div className="text-6xl font-bold mb-4 text-white">
                {activePlan.price} <span className="text-lg text-gray-400 ml-2">EGP</span>
              </div>
              <p className="text-gray-400 mb-8">{activePlan.desc}</p>

              <button
                disabled={loading === billing}
                onClick={() => pay(billing)}
                className="w-full py-4 rounded-xl bg-yellow-400 text-black font-semibold text-lg hover:scale-[1.03] transition shadow-lg"
              >
                {loading === billing ? "..." : t("payNow")}
              </button>

              <div className="mt-6 text-gray-500 text-sm">🔒 {t("securePaymentBy")}</div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}