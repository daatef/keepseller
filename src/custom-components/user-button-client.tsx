'use client'

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import type { Session } from 'next-auth';
import { SignOut } from './auth-components';
import { useParams } from 'next/navigation';
import { useTranslation } from '../lib/useTranslation';

interface Props {
  session: Session;
}

export default function UserButtonClient({ session }: Props) {
  if (!session?.user) return null;

  const { name, email, image, isSubscribed } = session.user; // use session directly
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  // Determine the link and label based on subscription
  const menuLink = isSubscribed ? 'dashboard' : 'pricing';
  const menuLabel = isSubscribed ? t('dashboard') : t('subscribe');

  return (
    <div className="flex items-center gap-4 ml-auto">
      <div className="hidden sm:flex flex-col items-end">
        <p className="text-sm font-medium text-white">{name || 'no name'}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[160px] text-white">{email}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-primary"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={
                  image ?? `https://api.dicebear.com/9.x/thumbs/svg?seed=${email}&randomizeIds=true`
                }
                alt={name ?? 'User'}
              />
              <AvatarFallback>{name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 py-3 bg-[var(--web-secondary-background-color)] text-[var(--web-secondary-text-color)] ltr:right-0 rtl:left-0 absolute ltr:text-right rtl:text-left"
          align="end"
        >
          <DropdownMenuItem asChild>
            <a
              href={`/${lang}/${menuLink}`}
              className="block w-full px-4 text-sm font-normal hover:bg-muted/50 h-8 leading-8"
            >
              {menuLabel}
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <SignOut className="px-4 text-sm font-bold h-8">
              {t('signOut')}
            </SignOut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}