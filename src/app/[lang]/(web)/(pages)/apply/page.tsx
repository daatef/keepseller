'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from '@/src/lib/useTranslation';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';

config.autoAddCss = false;
library.add(fas);

export default function ApplyJobPage() {
  const router = useRouter();
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const { data: session } = useSession();

  const [cv, setCv] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    position: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // 🔥 Auto-fill user info if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!cv) return toast.error(t('career.toast.cvRequired'));

    try {
      const fd = new FormData();
      fd.append('position', formData.position);
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('message', formData.message);
      fd.append('cv', cv);

      const res = await fetch('/api/apply', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(t('career.toast.success'));
        router.push(`/${lang}/`);
      } else {
        toast.error(t('career.toast.error'));
      }
    } catch (err) {
      toast.error(t('career.toast.serverError'));
      console.error(err);
    }
  };

  return (
    <>
      <Header session={session} />

      <section
        className="relative min-h-[calc(100vh-80px)] bg-black text-white flex flex-col lg:flex-row items-center overflow-hidden px-6 lg:px-16"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* 🔥 Background */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-400/10 blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/5 blur-[100px]"></div>

        {/* 🟡 FORM */}
        <motion.div
          initial={{ opacity: 0, x: lang === 'ar' ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex-1 max-w-xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-[0_50px_120px_rgba(255,255,255,0.05)] m-6"
        >
          {/* Back */}
          <div
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 cursor-pointer text-yellow-400 hover:text-yellow-300 transition"
          >
            <FontAwesomeIcon
              width={25}
              icon={['fas', lang === 'ar' ? 'arrow-right' : 'arrow-left']}
            />
            {t('common.back')}
          </div>

          {/* Info */}
          <div className="mb-8">
            <span className="text-yellow-400 text-sm tracking-widest">
              {t('career.apply.info')}
            </span>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5">
            <input
              type="text"
              name="position"
              placeholder={t('career.form.position')}
              value={formData.position}
              onChange={handleChange}
              className="bg-black/40 border border-white/10 rounded-xl p-3 focus:border-yellow-400 outline-none transition"
              required
            />

            <input
              type="text"
              name="name"
              placeholder={t('career.form.name')}
              value={formData.name}
              onChange={handleChange}
              className="bg-black/40 border border-white/10 rounded-xl p-3 focus:border-yellow-400 outline-none transition"
              required
            />

            <input
              type="email"
              name="email"
              placeholder={t('career.form.email')}
              value={formData.email}
              onChange={handleChange}
              className="bg-black/40 border border-white/10 rounded-xl p-3 focus:border-yellow-400 outline-none transition"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder={t('career.form.phone')}
              value={formData.phone}
              onChange={handleChange}
              className="bg-black/40 border border-white/10 rounded-xl p-3 focus:border-yellow-400 outline-none transition"
              required
            />

            {/* CV Upload */}
            <label className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-yellow-400 transition">
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={(e) => setCv(e.target.files?.[0] || null)}
              />
              <p className="text-gray-400">{cv ? cv.name : t('career.form.cv')}</p>
            </label>

            <textarea
              name="message"
              placeholder={t('career.form.message')}
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="bg-black/40 border border-white/10 rounded-xl p-3 focus:border-yellow-400 outline-none transition"
            />

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl font-bold bg-yellow-400 text-black hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
            >
              {t('career.form.submit')}
            </button>
          </form>
        </motion.div>

        {/* 🖼 IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: lang === 'ar' ? -60 : 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex-1 relative max-w-xl m-6"
        >
          <Image
            src="/apply-img.jpg"
            width={600}
            height={700}
            alt="Career"
            className="rounded-3xl shadow-2xl"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl"></div>
        </motion.div>
      </section>
    </>
  );
}