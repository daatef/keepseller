'use client'

import { useParams } from 'next/navigation'
import Header from '@/src/app/[lang]/(web)/components/header/header'
import HeroSection from './sections/hero/hero'
import FeaturesSection from './sections/features/features'
import PaymentSection from './sections/payment/payment'
import Footer from './components/footer/footer'
import { Button } from '@/src/custom-components/ui/button'
import { useTranslation } from '@/src/lib/useTranslation'
import { useState } from 'react'
import { useRouter } from "next/navigation";

interface IndexWebsiteClientProps {
  session: any
}

export default function IndexWebsiteClient({
  session,
  params,
}: IndexWebsiteClientProps & { params?: { lang: string } }) {
  // Get language
  const paramsLang = params?.lang
  const { lang: routeLang } = useParams() || {}
  const lang = (paramsLang || routeLang || 'en') as 'en' | 'ar'
  const t = useTranslation(lang)
  const router = useRouter()


  return (
    <div className="w-screen min-h-screen bg-[var(--web-primary-background-color)] flex flex-col">
      <Header session={session} />
      <HeroSection />
      <FeaturesSection />
      <PaymentSection />
      <Footer />
    </div>
  )
}
