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

export default function PricingInEgyptian() {
  const router = useRouter();
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const { data: session } = useSession();

  return (
    <>
              <Header session={session} />
    <section
      className="relative min-h-[calc(100vh-80px)] bg-black text-white flex flex-col lg:flex-row items-center overflow-hidden px-6 lg:px-16"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* 🔹 Background shapes */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-yellow-500/10 rotate-[25deg] blur-3xl"></div>
      <div className="absolute top-20 right-[-10rem] w-96 h-96 bg-yellow-500/5 rotate-[-12deg] blur-3xl"></div>
      <div className="absolute bottom-[-20rem] left-1/2 w-96 h-96 bg-white/5 rotate-[15deg] blur-3xl"></div>
      <div className="absolute bottom-[-32] right-0 w-72 h-72 bg-white/10 rotate-[10deg] blur-2xl"></div>

      {/* 🔹 Content Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex-1 max-w-lg bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-[0_40px_100px_rgba(255,255,255,0.05)] m-6"
      >
        {/* Go Back */}
        <div
          onClick={() => router.push(`/${lang}/`)}
          className="flex items-center gap-2 mb-6 cursor-pointer text-yellow-400 font-semibold hover:text-yellow-300 transition"
        >
          <FontAwesomeIcon width={25} icon={['fas', 'arrow-left']} />
          <span>{t('GoToMainPage')}</span>
        </div>

        {/* Title & Content */}
        <h1 className="text-3xl font-bold mb-6">{t('pricing-in-egyptian.title')}</h1>
        <div className="text-gray-300 space-y-3">
          <p>{t('pricing-in-egyptian.text')}</p>
        </div>
      </motion.div>

      {/* 🔹 Image Panel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 relative max-w-lg m-6"
      >
        <img
          src="/pricing-img.jpg"
          alt="Pricing Background"
          className="rounded-3xl shadow-xl object-cover w-full h-full"
        />
      </motion.div>
    </section>
    </>
  );
}