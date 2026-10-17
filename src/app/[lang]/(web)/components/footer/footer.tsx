"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const columns = [
    {
      title: t("footerColumns.company") || "Company",
      links: [
        { label: t("footerLinks.about") || "About Us", href: `/${lang}/about` },
        { label: t("footerLinks.careers") || "Careers", href: `/${lang}/careers` },
        { label: t("footerLinks.about.developer") || "About the Developer", href: `/${lang}/about-developer` },
      ],
    },
    {
      title: t("footerColumns.products") || "Products",
      links: [
        { label: t("footerLinks.pricing") || "Pricing", href: `/${lang}/pricing` },
        { label: t("footerLinks.features") || "Features", href: `/${lang}/features` },
        { label: t("footerLinks.checkout") || "Checkout", href: `/${lang}/checkout` },
      ],
    },
    {
      title: t("footerColumns.support") || "Support",
      links: [
        { label: t("footerLinks.terms") || "Terms & Conditions", href: `/${lang}/terms` },
        { label: t("footerLinks.privacy") || "Privacy Policy", href: `/${lang}/privacy-policy` },
        { label: t("footerLinks.refund") || "Refund Policy", href: `/${lang}/refund-policy` },
      ],
    },
  ];

  const socialLinks = [
    { label: "Facebook", href: "https://facebook.com", color: "text-blue-500" },
    { label: "Twitter", href: "https://twitter.com", color: "text-blue-400" },
    { label: "LinkedIn", href: "https://linkedin.com", color: "text-blue-600" },
    { label: "GitHub", href: "https://github.com", color: "text-white" },
    { label: "Instagram", href: "https://instagram.com", color: "text-pink-400" },
    
  ];

  return (
    <footer className="relative bg-black text-white overflow-hidden">

      {/* 🔥 Top Glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* 🔹 TOP GRID */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">

          {/* 🔸 LEFT (Logo + Newsletter + Description) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Image src="/logo.png" alt="Logo" width={120} height={40} className="mb-6" />

            <p className="text-gray-400 mb-6 max-w-md">
              {t("footerDescription") || "We build modern, high-performance web applications and tools for businesses worldwide. Stay updated with our latest products, insights, and updates."}
            </p>

            
          </motion.div>

          {/* 🔸 RIGHT (Links Grid) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-10"
          >
            {columns.map((col, idx) => (
              <div key={idx}>
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                  {col.title}
                </h3>

                <ul className="space-y-3 text-sm">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-yellow-400 transition"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 🔹 DIVIDER */}
        <div className="h-px bg-white/10 mb-10"></div>

        {/* 🔹 BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Copyright */}
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {t("footerCopyright") || "Your Company"}. All rights reserved.
          </p>

          {/* Quick Links */}
          <div className="flex gap-6 text-sm text-gray-400">
            <a href={`/${lang}/terms`} className="hover:text-yellow-400 transition">
              {t("footerLinks.terms") || "Terms"}
            </a>
            <a href={`/${lang}/privacy-policy`} className="hover:text-yellow-400 transition">
              {t("footerLinks.privacy") || "Privacy"}
            </a>
            <a href={`/${lang}/refund-policy`} className="hover:text-yellow-400 transition">
              {t("footerLinks.refund") || "Refund"}
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:text-yellow-400 transition font-bold ${social.color}`}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}