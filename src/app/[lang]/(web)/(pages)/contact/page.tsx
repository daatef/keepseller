'use client';
import React, { useState } from 'react';
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

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function ContactPage() {
  const router = useRouter();
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const { data: session } = useSession();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[\p{L}\s]{2,50}$/u.test(formData.name)) return toast.error(t('toastInvalidName'));
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error(t('toastInvalidEmail'));
    if (!/^\d{8,15}$/.test(formData.phone)) return toast.error(t('toastInvalidPhone'));
    if (formData.message.trim().length < 10) return toast.error(t('toastInvalidMessage'));

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success(t('toastSuccess'));
        setFormData({ name: '', email: '', phone: '', message: '' });
        router.push(`/${lang}/`);
      } else toast.error(t('toastError'));
    } catch {
      toast.error(t('toastErrorNetwork'));
    }
  };

  return (
    <>
        
    <Header session={session} />
    <section
      className="relative min-h-[calc(100vh-80px)] bg-black text-white flex flex-col lg:flex-row items-center overflow-hidden px-6 lg:px-16"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* 🔹 Background rectangles */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-yellow-500/10 rotate-[25deg] blur-3xl"></div>
      <div className="absolute top-20 right-[-10rem] w-96 h-96 bg-yellow-500/5 rotate-[-12deg] blur-3xl"></div>
      <div className="absolute bottom-[-20rem] left-1/2 w-96 h-96 bg-white/5 rotate-[15deg] blur-3xl"></div>
      <div className="absolute bottom-[-32] right-0 w-72 h-72 bg-white/10 rotate-[10deg] blur-2xl"></div>

      {/* 🔹 Form Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex-1 max-w-lg bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-[0_40px_100px_rgba(255,255,255,0.05)] m-6"
      >
        <div
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 cursor-pointer text-yellow-400 font-semibold hover:text-yellow-300 transition"
        >
          <FontAwesomeIcon width={25} icon={['fas', 'arrow-left']} />
          <span>{t('contactReturn')}</span>
        </div>

        <h1 className="text-3xl font-bold mb-6">{t('contactTitle')}</h1>

        <div className="mb-6 text-gray-300">
          <p>
            <span className="font-semibold">{t('contactMobile')}:</span>{' '}
            <a href="tel:+201107130468" className="text-blue-500 hover:underline">
              +20 01107130468
            </a>
          </p>
          <p>
            <span className="font-semibold">{t('contactAddress')}:</span> Cairo, Egypt
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder={t('contactPlaceholderName')}
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder={t('contactPlaceholderEmail')}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder={t('contactPlaceholderPhone')}
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder={t('contactPlaceholderMessage')}
            value={formData.message}
            onChange={handleChange}
            rows={5}
            required
          />
          <button className="w-full py-3 rounded-xl font-semibold bg-yellow-400 hover:bg-yellow-300 text-black transition">
            {t('contactSubmit')}
          </button>
        </form>
      </motion.div>

      {/* 🔹 Image Panel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 relative max-w-lg m-6"
      >
        <Image
          src="/contact-img.jpg"
          width={500}
          height={600}
          alt="Contact Background"
          className="rounded-3xl shadow-xl"
        />
      </motion.div>
    </section>
    </>
  );
}