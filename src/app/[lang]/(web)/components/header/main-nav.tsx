"use client"

import Image from "next/image"

import { cn } from "@/lib/utils"
import CustomLink from "../../../../../custom-components/custom-link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../../../../../custom-components/ui/navigation-menu"
import React from "react"
import { Button } from "../../../../../custom-components/ui/button"
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems, } from "@headlessui/react"; 
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function MainNav() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  return (
    <div className="flex w-full items-center justify-between px-0 sm:px-2">
      <div>
      <CustomLink className="flex items-center" href="/">
        <Button variant="ghost" className="px-0">
          <Image
            src="/logo.png"
            alt="Home"
            width={40}
            height={60}
            className="py-3 px-0"
          />
        </Button>
      </CustomLink>
      </div>
       <div className="hidden sm:flex">
        <CustomLink className="flex font-bold items-center py-0 px-2 text-sm text-white" href={`../../${lang}/`}>
        {t('home')}
      </CustomLink>

      
      <CustomLink className="flex font-bold items-center py-0 px-2 text-sm text-white" href={`../../${lang}/about`}>
        {t('about')}
      </CustomLink>
      <CustomLink className="flex font-bold items-center py-0 px-2 text-sm text-white" href={`../../${lang}/pricing`}>
        {t('pricing')}
      </CustomLink>
      <CustomLink className="flex font-bold items-center py-0 px-2 text-sm text-white" href={`../../${lang}/order-form`}>
        {t('order')}
      </CustomLink>

      <CustomLink className="flex font-bold items-center py-0 px-2 text-sm text-white" href={`../../${lang}/contact`}>
        {t('contactHeaderText')}
      </CustomLink>
      </div>


      <Disclosure as="div" className="block sm:hidden">
  {({ open }) => (
    <>
      {/* BUTTON */}
      <DisclosureButton className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition">
        {open ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </DisclosureButton>

      {/* DROPDOWN */}
      <DisclosurePanel className="absolute right-4 top-16 w-48 bg-[#0B0B0B] border border-white/10 rounded-xl p-2 space-y-1 shadow-lg">
        
        <CustomLink
          href={`/${lang}`}
          className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
        >
          {t("home")}
        </CustomLink>

        <CustomLink
          href={`/${lang}/about`}
          className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
        >
          {t("about")}
        </CustomLink>

        <CustomLink
          href={`/${lang}/pricing`}
          className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
        >
          {t("pricing")}
        </CustomLink>

        <CustomLink
          href={`/${lang}/order-form`}
          className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
        >
          {t("order")}
        </CustomLink>
    
        <CustomLink
          href={`/${lang}/contact`}
          className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
        >
          {t("contactHeaderText")}
        </CustomLink>

      </DisclosurePanel>
    </>
  )}
</Disclosure>

    </div>

    
     
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
