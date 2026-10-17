'use client';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from "@/src/lib/useTranslation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
config.autoAddCss = false;
library.add(fas);

type Plan = "monthly" | "yearly" | "lifetime";

export default function SubscriptionPage() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const { data: session } = useSession();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const plans: { name: string; price: number; displayPrice: string; duration: string; features: string[]; type: Plan }[] = [
    {
      name: t("subscription.monthly") || "Monthly",
      price: 199,
      displayPrice: "EGP 199",
      duration: t("subscription.perMonth") || "per month",
      features: [
        t("subscription.features.feature1") || "Full Access to POS",
        t("subscription.features.feature2") || "Smart Inventory",
        t("subscription.features.feature3") || "Analytics",
      ],
      type: "monthly",
    },
    {
      name: t("subscription.yearly") || "Yearly",
      price: 899,
      displayPrice: "EGP 899",
      duration: t("subscription.perYear") || "per year",
      features: [
        t("subscription.features.feature1") || "Full Access to POS",
        t("subscription.features.feature2") || "Smart Inventory",
        t("subscription.features.feature3") || "Analytics",
        t("subscription.features.feature4") || "Priority Support",
      ],
      type: "yearly",
    },
    {
      name: t("subscription.lifetime") || "Lifetime",
      price: 2000,
      displayPrice: "EGP 2000",
      duration: t("subscription.oneTime") || "one-time payment",
      features: [
        t("subscription.features.feature1") || "Full Access to POS",
        t("subscription.features.feature2") || "Smart Inventory",
        t("subscription.features.feature3") || "Analytics",
        t("subscription.features.feature4") || "Priority Support",
        t("subscription.features.feature5") || "All Future Updates",
      ],
      type: "lifetime",
    },
  ];

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

      router.push(`/${lang}/payment?plan=${plan}`);;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Header session={session} />
      <section className="relative min-h-[calc(100vh-80px)] bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl pointer-events-none"></div>
        <div className="absolute -top-1/2 -left-1/2 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-[250px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          {/* Back Button */}
          <div
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 cursor-pointer text-yellow-400 hover:text-yellow-300 transition font-medium"
          >
            <FontAwesomeIcon width={20} icon={['fas', lang === 'ar' ? 'arrow-right' : 'arrow-left']} />
            <span>{t('GoToMainPage') || 'Back'}</span>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">{t("subscription.heading") || "Choose Your Plan"}</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">{t("subscription.description") || "Flexible plans for every business. Start with the one that fits your needs."}</p>
          </motion.div>

          {/* Error */}
          {error && <div className="bg-red-600/20 text-red-400 px-4 py-2 rounded mb-6 text-center">{error}</div>}

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between hover:scale-105 transition-transform shadow-lg"
              >
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{plan.name}</h2>
                <p className="text-4xl font-extrabold mb-4">
                  {plan.displayPrice} <span className="text-gray-400 text-lg">{plan.duration}</span>
                </p>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-yellow-400">✔</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => pay(plan.type)}
                  disabled={loading === plan.type}
                  className={`px-6 py-3 rounded-xl font-semibold text-black transition shadow-lg ${
                    loading === plan.type
                      ? "bg-gray-600 cursor-not-allowed text-gray-300"
                      : "bg-yellow-400 hover:bg-yellow-300"
                  }`}
                >
                  {loading === plan.type
                    ? t("processing") || "Processing..."
                    : t("subscription.subscribe") || "Subscribe"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}