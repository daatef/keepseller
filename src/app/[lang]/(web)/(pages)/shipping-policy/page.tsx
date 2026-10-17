'use client';
import { useTranslation } from '@/src/lib/useTranslation';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { useSession } from "next-auth/react";
import Header from '../../components/header/header';
config.autoAddCss = false;
library.add(fas);

export default function ShippingPolicyPage() {
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const { data: session } = useSession();

  return (
    <>
              <Header session={session} />
    <div className="shipping-page rtl:text-right ltr:text-left max-w-4xl mx-auto p-6 bg-[var(--web-primary-background-color)] text-[var(--web-primary-text-color)]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="rtl:text-right ltr:text-left mt-8 flex text-sm text-white go-back mb-6 cursor-pointer">
        <div className="flex">
          <FontAwesomeIcon icon={['fas', 'arrow-left']} className="text-white go-back-icon flex mx-2" />
          <a href={`/${lang}`} className="hover:underline">{t('GoToMainPage')}</a>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-4">{t('shipping.title')}</h1>
        <p className="mb-2">{t('shipping.methods')}</p>
        <p className="mb-2">{t('shipping.costs')}</p>
        <p>{t('shipping.time')}</p>
      </div>
    </div>
    </>
  );
}
