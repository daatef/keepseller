'use client';

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';

export default function AboutMePage() {
  const params = useParams();
  const lang = (params?.lang as "en" | "ar") || "en";
  const t = useTranslation(lang);
  const { data: session } = useSession();

  const skills = [
    "Hardware Engineering",
    "Software Engineering",
    "Digital Marketing",
    "Microsoft Office",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Adobe Premiere Pro",
    "Windows Administration",
    "Linux Administration",
    "CCNA Networking",
    "HTML",
    "CSS",
    "JavaScript",
    "Next.js",
    "TailwindCSS",
    "Prisma",
    "PostgreSQL",
    "PHP",
    "Python",
    "Node.js",
    "React.js",
    "MySQL",
    "MongoDB",
    "SEO"
  ];

  const jobs = [
    {
      role: t("job1.role"),
      company: t("job1.company"),
      period: t("job1.period"),
      desc: t("job1.desc")
    },
    {
      role: t("job2.role"),
      company: t("job2.company"),
      period: t("job2.period"),
      desc: t("job2.desc")
    },
    {
      role: t("job3.role"),
      company: t("job3.company"),
      period: t("job3.period"),
      desc: t("job3.desc")
    }
  ];

  const education = [
    {
      degree: t("edu1.degree"),
      school: t("edu1.school"),
      period: t("edu1.period")
    }
  ];

  return (
    <>
      <Header session={session} />
      <main className="bg-black text-white min-h-screen px-6 py-16">

        {/* ================= HERO / PROFILE ================= */}
        <section className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 relative">

          {/* ⚫ Grid */}
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          {/* 🟡 Yellow Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>

          {/* 🟡 Glow Background */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="w-[700px] h-[700px] bg-yellow-400/10 rounded-full blur-[200px]"></div>
          </div>

          {/* PROFILE IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-64 h-64 rounded-2xl overflow-hidden border-4 border-yellow-400/50 shadow-xl"
          >
            <Image
              src="/profile.jpg"
              alt={t("myName")}
              fill
              className="object-cover"
            />
            {/* Glow */}
            <div className="absolute -inset-4 rounded-2xl bg-yellow-400/10 blur-3xl"></div>
          </motion.div>

          {/* ABOUT TEXT */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-400">
              {t("myName")}
            </h1>
            <p className="text-gray-400 mb-6 text-lg">
              {t("aboutMe")}
            </p>

            <div className="flex flex-wrap gap-4">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-white/5 border border-white/20 rounded-full text-sm text-yellow-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ================= EXPERIENCE ================= */}
        <section className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">
            {t("experience")}
          </h2>
          <div className="flex flex-col gap-6">
            {jobs.map((job, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl"
              >
                <h3 className="text-xl font-semibold text-yellow-400">{job.role}</h3>
                <p className="text-gray-400">{job.company} • {job.period}</p>
                <p className="mt-2 text-gray-300">{job.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= EDUCATION ================= */}
        <section className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">
            {t("education")}
          </h2>
          <div className="flex flex-col gap-6">
            {education.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl"
              >
                <h3 className="text-xl font-semibold text-yellow-400">{edu.degree}</h3>
                <p className="text-gray-400">{edu.school} • {edu.period}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= CONTACT CTA ================= */}
        <section className="max-w-4xl mx-auto mt-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-yellow-400 mb-4"
          >
            {t("contactMe")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-400 mb-6"
          >
            {t("contactDescription")}
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            href="mailto:realdaviderian@gmail.com"
            className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:scale-105 hover:bg-yellow-300 transition shadow-lg"
          >
            {t("emailMe")}
          </motion.a>
        </section>
      </main>
    </>
  );
}