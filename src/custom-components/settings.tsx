'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Upload, User, Settings, Globe, RefreshCcw } from "lucide-react"
import { ChevronDown } from "lucide-react"
import toast from "react-hot-toast"
import { ResetDatabaseButton } from "@/src/components/ResetDatabaseButton"
import { languages } from "@/src/data/languages"
import { useTheme } from "@/src/context/theme-provider"
import DashboardLanguageSwitcher from "@/src/components/DashboardLanguageSwitcher"
import { Dialog, DialogContent, DialogTrigger } from "@/src/components/ui/dialog"
import clsx from "clsx"
import { useTranslation } from "@/src/lib/useTranslation";
import { useRouter } from "next/navigation";
import SubscriptionInfo from '@/src/custom-components/subscription-info';

export default function SettingsPage() {

    const { lang } = useParams();
    const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    const router = useRouter();

  const [businessName, setBusinessName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [language, setLanguage] = useState(lang || "en")
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const currentLang = languages.find(l => l.code === language) || languages[0]

  // 1️⃣ Load settings from API on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) throw new Error("Failed to fetch settings")
        const data = await res.json()
        setBusinessName(data.businessName)
        setLogoUrl(data.businessLogoUrl)
        setTheme(data.theme)
        setLanguage(data.language)
      } catch (err) {
        console.error(err)
      toast.error(t("settings.errors.load"))
      }
    }
    fetchSettings()
  }, [])

  // 2️⃣ Upload logo to Cloudinary
  const handleUpload = async (): Promise<string | null> => {
    if (!logoFile) return logoUrl // no new file

    const formData = new FormData()
    formData.append("file", logoFile)
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    formData.append("folder", "business_logos")

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      )
      const data = await res.json()
      if (!data.secure_url) {
        toast.error(t("Imageuploadfailed"))
        return null
      }
      toast.success(t("Logouploadedsuccessfully"))
      return data.secure_url
    } catch (err) {
      console.error("Cloudinary upload error:", err)
      toast.error(t("Imageuploadfailed"))
      return null
    }
  }

  // 3️⃣ Save settings to API
  const handleSave = async () => {
  let uploadedLogoUrl = logoUrl // default to current

  // Only upload if user selected a new file
  if (logoFile) {
    const formData = new FormData()
    formData.append("file", logoFile)
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
    formData.append("folder", "business_logos")

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      )
      const data = await res.json()

      if (!data.secure_url) {
      toast.error(t("settings.errors.upload"))
        return
      }

      uploadedLogoUrl = data.secure_url
      setLogoUrl(data.secure_url)
      toast.success(t("settings.success.upload"))

    } catch (err) {
      console.error(err)
      toast.error(t("Imageuploadfailed"))
      return
    }
  }
  

  // Save settings to API
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName,
        theme,
        language,
        businessLogoUrl: uploadedLogoUrl,
      }),
    })
    if (!res.ok) throw new Error("Failed to save settings")
    toast.success(t("settings.success.save"))
  // ✅ refresh data (re-fetch server + client data)
  window.location.reload();
  } catch (err) {
    console.error(err)
    toast.error(t("settings.errors.save"))
  }
}

const [user, setUser] = useState(null);

useEffect(() => {
  fetch('/api/user')
    .then(res => res.json())
    .then(setUser);
}, []);


  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    setLangDropdownOpen(false)
  }

  const [themeOpen, setThemeOpen] = useState(false)

  return (
    
    <div dir={lang === "ar" ? "rtl" : "ltr"}>

    <div className="flex flex-col z-30 secondary-colors relative items-center justify-start w-full min-h-screen p-6">
      
      {/* ⚫ Grid */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
  
        {/* 🟡 Yellow Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
  

      <Card className="w-full z-30 rounded-2xl shadow-xl primary-colors border-theme">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 primary-colors" />
            {t("settings.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 p-6 primary-colors">
          {/* Business Name */}
          <div className="flex flex-col relative md:flex-row md:items-center md:gap-6 gap-3">
            <label className="w-60 font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("settings.businessName")}
            </label>
            
            <div className="relative">
            <Input
              placeholder={t("settings.businessNamePlaceholder")}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="flex-1"
            />
            <button
              onClick={() => {
                setBusinessName("")
              }}
              className="absolute top-[-4] left-[-10] bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition"
            >
              ✕
            </button>
            </div>
          </div>

          {/* Business Logo Upload */}
         <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-3">
            <label className="w-60 font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5" /> {t("settings.businessLogo")}
            </label>

            {/* Upload Input */}
            <label className="border p-2 rounded-md w-max md:w-auto cursor-pointer flex items-center justify-between">

              <span>
                {logoFile ? logoFile.name : t("settings.logoPlaceholder")}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="hidden w-max"
              />
            </label>

            {/* Preview + Delete */}
            {logoUrl && (
              <div className="relative mt-2 md:mt-0">
                <img
                  src={logoUrl}
                  alt="Business Logo"
                  className="h-16 w-16 w-max object-contain rounded-md border"
                />

                {/* ❌ Delete Button */}
                <button
                  onClick={() => {
                    setLogoUrl("")
                    setLogoFile(null)
                  }}
                  className="absolute top-[-4] bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            )}
          </div>













          {/* Theme Selector */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-3 z-99">
            <label className="w-60 font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t("settings.theme")}
            </label>

            <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
              {/* Trigger Button */}
              <DialogTrigger asChild>
                <Button className="flex w-max border items-center gap-2 px-4 py-2 primary-colors rounded-lg  hover:shadow-md transition-all duration-200 text-sm font-semibold">
                  <span>{theme === "light" ? t("settings.light") : t("settings.dark")}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DialogTrigger>

              {/* Dialog Content */}
              <DialogContent className="w-max z-99 p-6 h-auto primary-colors rounded-xl shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-center">{t("settings.chooseTheme")}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {["light", "dark"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTheme(mode as "light" | "dark")}
                      className={clsx(
                        "flex items-center justify-center p-3 rounded-xl transition-transform duration-200 transform hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg",
                        theme === mode
                          ? "third-colors shadow-xl"
                          : "secondary-colors hover:bg-[var(--third-background-color)]"
                      )}
                    >
                      <span className="font-medium capitalize">{t(`settings.${mode}`)}</span>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>




          {/* Language Selector */}
          <DashboardLanguageSwitcher />




          {/* Subscription Info */}
          <SubscriptionInfo />






          {/* Reset Database */}
          <div className="flex z-99 flex-col md:flex-row md:items-center md:gap-6 gap-3">
            <label className="w-60 font-semibold flex items-center gap-2">
              <RefreshCcw className="w-5 h-5" />
              {t("settings.resetDatabase")}
            </label>
            <ResetDatabaseButton />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="third-colors w-max px-8 py-3 rounded-md shadow-lg"
            >
              {t("settings.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
</div>
    </div>
  )
}