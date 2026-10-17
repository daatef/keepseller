// src/components/language-switcher.tsx
'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { languages } from "@/src/data/languages"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/src/components/ui/dialog"
import { Divide, Earth } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang } = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const changeLanguage = (newLang: string) => {
    const path = window.location.pathname
    const segments = path.split("/")
    segments[1] = newLang // replace /en or /ar etc.
    router.push(segments.join("/"))
    setOpen(false)
  }

  return (
    <div className="p-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="font-bold text-[var(--web-primary-text-color)] mr-2 text-xs">
            <Earth size="20" />
          </Button>
        </DialogTrigger>

        <DialogContent className="w-max p-6 h-auto overflow-y-auto bg-[var(--web-secondary-background-color)] text-[var(--web-secondary-text-color)]">
          <h2 className="text-lg font-bold mb-0 text-center">Select Your Language</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {languages.map((l) => (
              <Button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className={`flex items-center justify-center gap-2 p-2 text-base font-medium rounded-lg shadow 
                  ${lang === l.code ? 'bg-[var(--web-primary-background-color)] text-[var(--web-primary-text-color)]' : 'bg-muted'}
                `}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
