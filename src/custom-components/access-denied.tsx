'use client';
import { useTranslation } from '@/src/lib/useTranslation';
import { useParams } from 'next/navigation';
import { signIn } from "next-auth/react"

export default function AccessDenied() {

  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  return (
    <>
      <h1>Access Denied</h1>
      <p>
        <a
          href="/api/auth/signin"
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          You must be signed in to view this page
        </a>
      </p>
    </>
  )
}
