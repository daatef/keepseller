'use client';

import { useTranslation } from '@/src/lib/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';
export default function PaymentFailure() {
  const { lang } = useParams();
  const router = useRouter();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const { data: session } = useSession();

  return (
    <>
              <Header session={session} />
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center">
            <span className="text-3xl">✕</span>
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-3 tracking-wide">
          {t("paymentFailedTitle")}
        </h1>

        {/* Description */}
        <p className="text-white/60 mb-6 text-sm leading-relaxed">
          {t("paymentFailedDesc")}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition"
          >
            {t("tryAgain")}
          </button>

          <button
            onClick={() => router.push('/contact')}
            className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            {t("contactSupport")}
          </button>
        </div>
      </motion.div>
    </div>
    </>
  );
}