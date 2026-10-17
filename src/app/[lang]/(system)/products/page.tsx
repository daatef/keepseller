'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { AppSidebar } from "@/src/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { SidebarTrigger } from "@/src/components/ui/sidebar";
import Link from "next/link";
import { Search } from "lucide-react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { useRouter } from "next/navigation";
import Loader from "@/src/components/loader";
import  SettingsPage from "@/src/custom-components/settings";
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductPage() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  const [image, setImage] = useState<File | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [wholesale, setWholesale] = useState('');
  const [sellingprice, setSellingPrice] = useState('');
  const [percentagewin, setPercentagewin] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minimumAlertLevel, setMinimumAlertLevel] = useState('');
  const [trackInventory, setTrackInventory] = useState(true);
  const [products, setProducts] = useState([]);
  const [lastChangedField, setLastChangedField] = useState<'percentage' | 'selling' | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const submit = async () => {
  const parsedWholesale = Number(wholesale);
  const parsedSellingPrice = Number(sellingprice);
  const parsedPercentagewin = Number(percentagewin);
  const parsedQuantity = Number(quantity);
  const parsedMinimumAlertLevel = Number(minimumAlertLevel);

  if (!name || isNaN(parsedWholesale) || isNaN(parsedSellingPrice)) {
    toast.error(t('toast.fillRequiredFields'));
    return;
  }

  let imageUrl: string | null = null;

  // 1️⃣ Upload image to Cloudinary if selected
  if (image) {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', 'products');

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();
      console.log('Cloudinary response:', data);

      if (!data.secure_url) {
        toast.error('Image upload failed');
        return;
      }

      imageUrl = data.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      toast.error('Image upload failed');
      return;
    }
  }

  // 2️⃣ Submit product to API including image URL
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productname: name,
      code: code,
      wholesaleprice: parsedWholesale,
      sellingprice: parsedSellingPrice,
      percentagewin: percentagewin !== '' ? parsedPercentagewin : undefined,
      quantity: parsedQuantity,
      minimumAlertLevel: parsedMinimumAlertLevel,
      trackInventory: trackInventory,
      image: imageUrl, // <-- pass uploaded image URL
    }),
  });

  if (res.ok) {
    toast.success(t('toast.productSaved'));
    // Reset form
    setName('');
    setCode('');
    setWholesale('');
    setSellingPrice('');
    setPercentagewin('');
    setQuantity('');
    setMinimumAlertLevel('10');
    setTrackInventory(true);
    setImage(null);
    window.location.reload();
  } else {
    const data = await res.json();
    if (data.error?.includes('Unique constraint')) {
      toast.error(t('toast.duplicateCode') || 'Code must be unique.');
    } else {
      toast.error(t('toast.somethingWrong'));
    }
  }
};

  useEffect(() => {
    const wholesaleNum = parseFloat(wholesale) || 0;
    const sellingNum = parseFloat(sellingprice) || 0;
    const percentageNum = parseFloat(percentagewin) || 0;

    if (lastChangedField === 'percentage') {
      const calculated = wholesaleNum + (wholesaleNum * percentageNum) / 100;
      setSellingPrice(calculated.toFixed(2));
    } else if (lastChangedField === 'selling') {
      const profit = sellingNum - wholesaleNum;
      const percent = wholesaleNum > 0 ? (profit / wholesaleNum) * 100 : 0;
      setPercentagewin(percent.toFixed(2));
    }
  }, [wholesale, sellingprice, percentagewin, lastChangedField]);

  const router = useRouter();
  const { data: session, error } = useSWR("/api/session", fetcher);

  useEffect(() => {
    if (session === null) {
      router.push("/");
    } else if (session && !session.user?.isSubscribed) {
     router.push(`../${lang}/pricing`);
    }
  }, [session, router]);



  const updateProduct = async (id: number) => {
  const formData = new FormData();

  formData.append("id", String(id));
  formData.append("name", name);
  formData.append("code", code);
  formData.append("wholesale", wholesale);
  formData.append("selling", sellingprice);
  formData.append("percentage", percentagewin);
  formData.append("quantity", quantity);
  formData.append("minimumAlertLevel", minimumAlertLevel);
  formData.append("trackInventory", String(trackInventory));

  if (image) {
    formData.append("image", image);
  }

  const res = await fetch("/api/products/update", {
    method: "PUT",
    body: formData,
  });

  if (res.ok) {
    toast.success(t("productUpdated"));
    window.location.reload();
  } else {
    toast.error(t("Updatefailed"));
  }
};




  if (error) return <div>{t("dashboard.error")}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <SidebarProvider
      className="bg-[var(--primary-background-color)]"
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
   
            {/* Premium Blurred Glow Effects - Black, White & Yellow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        className="fixed z-0 ltr:right-[-5rem] rtl:left-[-5rem] bottom-[-5rem] w-[25rem] h-[25rem] rounded-full
                   bg-gradient-to-tr from-yellow-400/60 via-white/40 to-black/10
                   blur-[120px] opacity-80 pointer-events-none"
      ></motion.div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        className="fixed z-0 top-1/2 right-1/3 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem]
                   rounded-full bg-gradient-to-br from-black/20 via-white/30 to-yellow-400/20
                   blur-[160px] opacity-70 pointer-events-none"
      ></motion.div>
      
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        className="fixed z-0 ltr:left-[-8rem] rtl:right-[-8rem] top-[20%] w-[20rem] h-[20rem]
                   rounded-full bg-gradient-to-l from-yellow-400/40 via-white/20 to-black/10
                   blur-[100px] opacity-60 pointer-events-none"
      ></motion.div>

      <AppSidebar
        className="fixed scrollbar-hide overflow-y-scroll top-0 z-99999 h-full w-64 primary-colors
              transition-all duration-300 ease-in-out
              ltr:left-0 rtl:right-0
              group-data-[collapsible=offcanvas]:ltr:-left-64
              group-data-[collapsible=offcanvas]:rtl:-right-64"
        variant="inset"
        user={{
          name: session.user.name || "Guest",
          email: session.user.email || "Not logged in",
          avatar: session.user.image || "/default-avatar.png",
        }}
      />
      <SidebarInset>
        <header className="primary-colors z-30 flex h-(--header-height) shrink-0 items-center gap-2">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{t('initializeStorage')}</h1>
            <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
              <Link className="flex items-center z-30" href={`/${lang}/search-items`}>
                <Search className="h-4 w-4 ml-2 primary-text" />
              </Link>
            </div>
          </div>
        </header>

        <div className="secondary-colors flex flex-1 flex-col p-6 gap-6">

              {/* ⚫ Grid */}
                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          


          {/* Import Form */}
          <Card className="w-full border-theme bg-[var(--primary-background-color)] primary-text z-30 mx-2 my-2">
            <CardHeader>
              <CardTitle className="text-xl">{t('importNewProduct')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full max-w-sm">
                <label
                  htmlFor="product-image"
                  className="flex flex-col items-center justify-center w-full h-32 px-4 transition primary-colors border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--third-background-color)] transition-all duration-200"
                >
                  <svg
                    className="w-10 h-10 mb-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0-6l-3 3m3-3l3 3m-3-9v6m0 0l-3-3m3 3l3-3"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {image ? image.name : "Click or drag image to upload"}
                  </span>
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <Input
                placeholder={t('productNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='px-2 secondary-colors'
              />
              <Input
                placeholder={t('productCodePlaceholder') || "Product Code (Barcode/SKU)"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className='px-2 secondary-colors'
              />
              <Input
                type="number"
                placeholder={t('wholesalePlaceholder')}
                value={wholesale}
                onChange={(e) => {
                  setWholesale(e.target.value);
                  setLastChangedField(null);
                }}
                className='px-2 secondary-colors'
              />
              <Input
                type="number"
                placeholder={t('percentagePlaceholder')}
                value={percentagewin}
                onChange={(e) => {
                  setPercentagewin(e.target.value);
                  setLastChangedField('percentage');
                }}
                className='px-2 secondary-colors'
              />
              <Input
                type="number"
                placeholder={t('sellingPricePlaceholder')}
                value={sellingprice}
                onChange={(e) => {
                  setSellingPrice(e.target.value);
                  setLastChangedField('selling');
                }}
                className='px-2 secondary-colors'
              />
              <Input
                type="number"
                placeholder={t('ProductsQuantityPlaceholder')}
                value={0}
                onChange={(e) => setQuantity(e.target.value)}
                className='px-2 secondary-colors'
              />
              <Input
                type="number"
                placeholder={t('minimumAlertPlaceholder')}
                value={minimumAlertLevel}
                onChange={(e) => setMinimumAlertLevel(e.target.value)}
                className='px-2 secondary-colors'
              />
              <div className="px-2 flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                />
                <label>{t('trackInventory')}</label>
              </div>
              <Button className="mx-2 px-4 third-colors" onClick={submit}>
                {t('importProduct')}
              </Button>
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
