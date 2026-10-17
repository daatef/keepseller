// src/components/language-switcher.tsx
'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { languages } from "@/src/data/languages"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/src/components/ui/dialog"
import { Globe, ChevronDown } from "lucide-react"
import clsx from "clsx"
import { useTranslation } from "@/src/lib/useTranslation";

export default function DashboardLanguageSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const changeLanguage = (newLang: string) => {
    const path = window.location.pathname
    const segments = path.split("/")
    segments[1] = newLang // replace /en or /ar
    router.push(segments.join("/"))
    setOpen(false)
  }

  const selectedLang = languages.find(l => l.code === lang) || languages[0]

  return (
    <div className="flex flex-col md:flex-row md:items-center mt-2 md:gap-6 gap-3">

      <label className="w-60 font-semibold flex items-center gap-2">
       <Globe className="w-5 h-5" />
        {t("settings.language")}
      </label>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* Trigger Button */}
       
        <DialogTrigger asChild>
          
          <Button className="flex w-max items-center gap-2 px-4 py-2 primary-colors border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-semibold">
            <span>{t("settings.selectLanguage")}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DialogTrigger>

        {/* Dialog Content */}
        <DialogContent className="w-max z-99 p-6 h-auto primary-colors rounded-xl shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-center">{t("settings.chooseLanguage")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-transform duration-200 transform hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg",
                  l.code === lang
                    ? "third-colors shadow-xl"
                    : "secondary-colors hover:bg-[var(--third-background-color)]"
                )}
              >
                <span className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 text-xl">
                  {l.flag}
                </span>
                <span className="font-medium">{l.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}