'use client'

import { Button } from '../../../../../custom-components/ui/button'
import { signIn } from 'next-auth/react' // ✅ Client-side signIn
import UserButtonClient from '../../../../../custom-components/user-button-client'
import { useParams } from 'next/navigation'
import { useTranslation } from '../../../../../lib/useTranslation'
import type { Session } from 'next-auth'

interface HeaderClientProps {
  session: Session | null
}

export default function HeaderClient({ session }: HeaderClientProps) {
  const { lang } = useParams()
  const t = useTranslation((lang as 'en' | 'ar') || 'en')

  return session ? (
    <UserButtonClient session={session} />
  ) : (
    <Button type="button" className="w-max text-white whitespace-nowrap" onClick={() => signIn("github")}>
    {t('signIn')}
    </Button>

  )
}



