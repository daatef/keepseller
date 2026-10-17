'use client';
import { useTranslation } from '@/src/lib/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';

config.autoAddCss = false;
library.add(fas);

export default function RefundPolicyPage() {
  const router = useRouter();
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const { data: session } = useSession();

  return (
    <>
              <Header session={session} />
    <section
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative min-h-[calc(100vh-80px)] bg-black text-white overflow-hidden flex items-center px-6 lg:px-20"
    >
      {/* 🔥 Background Glow */}
      <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full"></div>

      {/* 🔹 Grid Layout */}
      <div className="grid lg:grid-cols-2 gap-12 items-center w-full z-10 py-8">

        {/* 🔹 LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Back */}
          <div
            onClick={() => router.push(`/${lang}`)}
            className="flex items-center mt-2 gap-2 mb-6 cursor-pointer text-yellow-400 hover:text-yellow-300 transition font-medium"
          >
            <FontAwesomeIcon width={25} icon={['fas', lang === 'ar' ? 'arrow-right' : 'arrow-left']} />
            <span>{t('GoToMainPage')}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-white">{t('refund.title')}</span>
            <br />
            
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-lg mb-8 max-w-xl leading-relaxed">
            {t('refund.eligibility')}
          </p>

          {/* Features */}
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400">✔</span>
              <p>{t('refund.process')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400">✔</span>
              <p>{t('refund.contact')}</p>
            </div>
          </div>
        </motion.div>

        {/* 🔹 RIGHT VISUAL */}
        <motion.div
          initial={{ opacity: 0, x: lang === 'ar' ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex justify-center items-center"
        >
          {/* Yellow Border Box */}
          <div className="absolute w-[320px] h-[320px] border-2 border-yellow-400 rotate-6 rounded-3xl"></div>

          {/* Main Box */}
          <div className="relative w-[320px] h-[320px] bg-white/5 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-[0_20px_80px_rgba(255,255,0,0.1)]">
            <FontAwesomeIcon icon={['fas', 'rotate-left']} className="text-yellow-400 text-6xl" />
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
}