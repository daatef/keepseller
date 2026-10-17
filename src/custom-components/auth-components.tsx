// components/auth-components.tsx
'use client'

import { handleSignIn, handleSignOut } from '@/src/lib/auth-actions'
import { Button } from './ui/button'

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form action={() => handleSignIn(provider)}>
      <Button {...props} type="submit">
        {props.children || 'Sign In'}
      </Button>
    </form>
  )
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form action={handleSignOut} className="w-full">
      <Button type="submit" variant="ghost" {...props}>
        {props.children || 'Sign Out'}
      </Button>
    </form>
  )
}
