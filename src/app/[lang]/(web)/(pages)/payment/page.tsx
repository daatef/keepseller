"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "../../components/header/header";
import { motion } from "framer-motion";
import { useTranslation } from "@/src/lib/useTranslation";
import { useSession } from "next-auth/react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/src/components/ui/button";

import { config, library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

config.autoAddCss = false;
library.add(fas);

export default function PaymentPage() {
  const params = useParams();
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session } = useSession();

  const plan = searchParams.get("plan") || "";
  const methodFromUrl = searchParams.get("method");

  const [paymentMethod, setPaymentMethod] = useState(
    methodFromUrl === "wallet" ? "wallet" : "card"
  );

  const [iframeURL, setIframeURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPayment = async () => {
      if (!session?.user?.id || !plan) return;

      try {
        setLoading(true);
        setError(null);
        setIframeURL(null);

        const res = await fetch("/api/paymob/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            plan,
            email: session.user.email,
            firstName: session.user.name?.split(" ")[0] || "User",
            lastName: session.user.name?.split(" ")[1] || "User",
            paymentMethod,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Payment failed");
        }

        // ✅ SAFE: only set iframe if exists
        if (data.iframeURL && (data.type === "card" || data.type === "wallet")) {
          setIframeURL(data.iframeURL);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createPayment();
  }, [paymentMethod, plan, session?.user?.id]);

  if (!session) return null;

  return (
    <>
      <Header session={session} />

      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-400/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full my-6">
          {/* Back */}
          <div
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-2 cursor-pointer text-yellow-400 font-semibold hover:text-yellow-300 transition"
          >
            <FontAwesomeIcon width={25} icon={["fas", "arrow-left"]} />
            <span>{t("contactReturn")}</span>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              {t("completePayment")}
            </h1>

            <p className="text-gray-400 max-w-xl mx-auto">
              {t("paymentDesc")}
            </p>
          </div>

          {/* Switch */}
          <div className="flex gap-4 justify-center mb-6">
            <Button
              onClick={() => setPaymentMethod("card")}
              className={
                paymentMethod === "card"
                  ? "bg-yellow-400 text-black"
                  : ""
              }
            >
              💳 {t('card')}
              
            </Button>

            <Button
              onClick={() => setPaymentMethod("wallet")}
              className={
                paymentMethod === "wallet"
                  ? "bg-yellow-400 text-black"
                  : ""
              }
            >
              📱 {t('wallet')}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center px-4">
            {/* LOADING */}
            {loading && (
              <div className="flex flex-col items-center">
                <AiOutlineLoading3Quarters className="animate-spin text-yellow-400 text-5xl" />
                <p className="mt-4 text-gray-300">
                  {t("loadingPayment")}
                </p>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}

            {/* IFRAME SAFE RENDER */}
            {iframeURL && (
              <div className="relative w-full max-w-5xl h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10">

                {/* Secure badge */}
                <div className="absolute top-3 right-3 z-10 bg-black/70 px-3 py-1 text-sm rounded-full text-yellow-400 border border-yellow-400/30">
                  🔒 {t("secure")}
                </div>

                <motion.iframe
                  src={iframeURL}
                  className="w-full h-[100vh] -mt-[80px]"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  onLoad={() => setLoading(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}