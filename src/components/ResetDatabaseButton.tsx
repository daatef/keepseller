'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";

export function ResetDatabaseButton() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const confirmation = prompt(t("reset.confirmMessage"));

    if (confirmation !== 'RESET') {
      toast.error(t("reset.confirmFailed"));
      return;
    }

    setLoading(true);
    const toastId = toast.loading(t("reset.loading"));

    try {
      const res = await fetch('/api/reset-db', {
        method: 'POST',
      });

      if (!res.ok) throw new Error();

      toast.success(t("reset.success"), { id: toastId });

      // Refresh after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Reset error:', error);
      toast.error(t("reset.failed"), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="z-20 text-md text-red-500 underline font-bold px-2 py-2 transition"
    >
      {loading ? t("reset.loadingButton") : t("reset.button")}
    </button>
  );
}
