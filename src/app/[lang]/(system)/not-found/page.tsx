"use client";

import { Button } from "@/src/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { Ghost } from "lucide-react";
import { useTranslation } from "@/src/lib/useTranslation";

export default function NotFoundPage() {
  const router = useRouter();
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  return (
    <div className="flex h-screen w-full flex-col items-center primary-colors justify-center text-center px-6">
      <Ghost className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold mt-4">{t("notFoundTitle")}</h1>
      <p className="text-muted-foreground mt-2">{t("notFoundDescription")}</p>
      <Button
        variant="default"
        className="mt-6"
        onClick={() => router.push(`/${lang || "en"}`)}
      >
        {t("goBackHome")}
      </Button>
    </div>
  );
}
