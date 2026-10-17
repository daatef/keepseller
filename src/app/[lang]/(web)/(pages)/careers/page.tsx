'use client';

import { useTranslation } from '@/src/lib/useTranslation';
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';
config.autoAddCss = false;
library.add(fas);

const jobList = [
  { id: 1, title: 'Flyer Distributor', department: 'Marketing', location: 'Egypt' },
  { id: 2, title: 'Social Media Specialist', department: 'Marketing', location: 'Remote' }
];

export default function CareerPage() {
  const router = useRouter();
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const [filter, setFilter] = useState('');
  const { data: session } = useSession();

  const filteredJobs = jobList.filter(
    (job) =>
      job.title.toLowerCase().includes(filter.toLowerCase()) ||
      job.department.toLowerCase().includes(filter.toLowerCase()) ||
      job.location.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
              <Header session={session} />
    <div className="w-full bg-black text-white relative overflow-hidden">
      {/* 🔥 Yellow Glow Backgrounds */}
      <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-yellow-500/10 blur-[120px] rounded-full"></div>



{/* ⚫ Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* 🟡 Yellow Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>



      {/* 🟡 Glow Background */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-[700px] h-[700px] bg-yellow-400/10 rounded-full blur-[200px]"></div>
      </div>



      {/* 🔹 HERO SECTION */}
      <section
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative px-6 max-w-screen-xl mx-auto min-h-screen flex items-center px-6 lg:px-20 z-10"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Back Button */}
            <div
              onClick={() => router.push(`/${lang}`)}
              className="flex items-center gap-2 mb-6 cursor-pointer text-yellow-400 hover:text-yellow-300 transition font-medium"
            >
              <FontAwesomeIcon width={25} icon={['fas', lang === 'ar' ? 'arrow-right' : 'arrow-left']} />
              <span>{t('GoToMainPage')}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-white">{t('career.hero.title')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-lg mb-8 max-w-xl leading-relaxed">
              {t('career.hero.subtitle')}
            </p>

            {/* CTA */}
            <a
              href="#open-positions"
              className="inline-block bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-300 transition"
            >
              {t('career.hero.cta')}
            </a>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center items-center"
          >
            {/* Yellow Border Box */}
            <div className="absolute w-[320px] h-[320px] border-2 border-yellow-400 rotate-6 rounded-3xl"></div>

            {/* Main Box */}
            <div className="relative w-[320px] h-[320px] bg-white/5 backdrop-blur-lg rounded-3xl flex flex-col items-center justify-center shadow-[0_20px_80px_rgba(255,255,0,0.1)]">
              <FontAwesomeIcon width={200} icon={['fas', 'briefcase']} className="text-yellow-400 text-6xl mb-4" />
              <p className="text-white font-semibold text-center">{t('career.hero.subtitle')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🔹 OPEN POSITIONS SECTION */}
      <section
        id="open-positions"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="py-20 px-6 lg:px-20 relative z-10"
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
          {t('career.openPositions')}
        </h2>

        {/* search input */}
        {/*
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder={t('career.searchPlaceholder')}
            className="px-4 py-3 rounded-xl bg-black text-white placeholder-gray-400 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div> */}

        {/* Job Cards */}
        <div className="grid md:grid-cols-2 max-w-screen-lg mx-auto lg:grid-cols-2 gap-8">
  {filteredJobs.map((job) => (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03 }}
      className="group relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/10 hover:border-yellow-400/40 transition-all duration-300"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 bg-yellow-400/5 blur-xl transition"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-400 transition">
          {job.title}
        </h3>

        {/* Department */}
        <p className="text-yellow-400 font-semibold mb-2">
          {job.department}
        </p>

        {/* Badges */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">
            {job.location}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">
            Full-time
          </span>
        </div>

        {/* Apply Button */}
        <button
          onClick={() => router.push(`/${lang}/apply`)}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition shadow-lg hover:shadow-yellow-400/30"
        >
          {t('career.applyNow') || 'Apply Now'}
        </button>
      </div>
    </motion.div>
  ))}
</div>
      </section>
    </div>
    </>
  );
}