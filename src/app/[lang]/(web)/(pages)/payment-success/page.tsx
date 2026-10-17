'use client';

import { useRouter } from "next/navigation";
import { useTranslation } from '@/src/lib/useTranslation';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';

export default function PaymentSuccess() {
  const router = useRouter();
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const { data: session } = useSession();

  return (
    <>
      <Header session={session} />

      <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 via-transparent to-white/5 blur-3xl -z-10"></div>
        <div className="absolute inset-0 bg-black/90 -z-20"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl hover:scale-[1.02] transition-transform"
        >
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center shadow-lg animate-pulse">
              <motion.span
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-4xl font-bold text-yellow-400"
              >
                ✔
              </motion.span>
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-3 tracking-wide text-yellow-400 drop-shadow-lg">
            {t("paymentSuccessTitle") || "Payment Successful!"}
          </h1>

          {/* Description */}
          <p className="text-white/70 mb-6 text-sm leading-relaxed">
            {t("paymentSuccessDesc") || "Thank you for your payment. Your subscription is now active."}
          </p>

          {/* Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={() => router.push(`/${lang}/dashboard`)}
              className="w-full py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-300 hover:shadow-lg transition-all duration-300"
            >
              {t("goToDashboard") || "Go to Dashboard"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}