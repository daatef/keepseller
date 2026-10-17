'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import en from '@/src/locales/en.json';
import ar from '@/src/locales/ar.json';
import fr from '@/src/locales/fr.json';
import de from '@/src/locales/de.json';


const translations = {
  en: en as Record<string, string>,
  ar: ar as Record<string, string>,
  fr: fr as Record<string, string>,
  de: de as Record<string, string>,
};

export function useTranslation(locale: string = 'en') {
  const router = useRouter();
  const valid = locale === 'en' || locale === 'ar' || locale ==='fr' || locale ==='de';

  useEffect(() => {
    if (!valid) {
      router.push('/en/not-found');
    }
  }, [valid, router]);

  const t = translations[valid ? locale : 'en'];
  return (key: string) => t[key] || key;
}
