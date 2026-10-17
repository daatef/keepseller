'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useTranslation } from '@/src/lib/useTranslation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';
config.autoAddCss = false;
library.add(fas);


interface OrderYourCopyProps {
  lang: string
}

export default function OrderYourCopyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const [loading, setLoading] = useState(false)
  const PRICE = 2000 // Lifetime subscription price

  useEffect(() => {
    if (status === 'unauthenticated') router.push(`/${lang}/signin`)
    if (status === 'authenticated' && session?.user?.isSubscribed) {
      router.push(`/${lang}/dashboard`)
    }
  }, [status, session, router, lang])

  const handlePay = async () => {
    if (!session?.user?.email) return toast.error(t('emailNotFound'))

    setLoading(true)
    try {
      const res = await fetch('/api/paymob/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, amount: PRICE }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else {
        toast.error(t('paymentCreationError'))
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      toast.error(t('paymentError'))
      setLoading(false)
    }
  }

  return (
    <>
              <Header session={session} />
    <div>
    
    <div className="min-h-screen flex flex-col justify-start items-center bg-black text-white px-4">
      <div onClick={() => router.push(`/${lang}`)} className="go-back mt-6 mb-6 cursor-pointer">
        <FontAwesomeIcon
          icon={['fas', 'arrow-left']}
          className="text-white mx-2 go-back-icon"
        />
        <span className="text-white">{t('contactReturn')}</span>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl text-center mt-20 mb-16">
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
          {t('subscribeNow')}
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          {t('fullAccessDescription')}
        </p>
      </div>

      {/* Card Container */}
      <div className="flex flex-col md:flex-row gap-10 items-center justify-center mb-20">
        {/* Order Summary */}
        <div className="w-96 bg-gray-800 border border-white/20 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white tracking-wide">{t('orderSummary')}</h2>
          <div className="flex justify-between text-white text-lg">
            <span>{t('lifetimeSubscription')}</span>
            <span>{PRICE} EGP</span>
          </div>
          <div className="border-t border-white/20 mt-4 pt-4 flex justify-between text-xl font-bold">
            <span>{t('total')}</span>
            <span>{PRICE} EGP</span>
          </div>
        </div>

        {/* Payment Card */}
        <div className="w-96 bg-gray-900 border border-white/20 rounded-3xl p-8 flex flex-col gap-6 items-center shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">{t('makePayment')}</h2>
          <p className="text-gray-300 text-center mb-4">
            {t('oneTimePaymentDescription')}
          </p>

          <button
            onClick={handlePay}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-black transition-all ${
              loading
                ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                : 'bg-white hover:bg-gray-200'
            }`}
          >
            {loading ? t('processing') : t('payNow')}
          </button>

          <p className="text-gray-400 text-sm text-center mt-4">
            {t('securePaymentBy')}
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-2xl text-center mb-20">
        <p className="text-gray-300 text-lg">
          {t('afterPaymentActivated')}
          <span className="font-bold text-white ml-2">{t('readyToStart')}</span>
        </p>
      </div>
    </div>

    </div>
    </>
  )
}