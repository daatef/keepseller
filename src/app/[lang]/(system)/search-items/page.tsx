'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import useSWR from "swr";
import { ImageOff } from "lucide-react";

import { useParams } from 'next/navigation';
import { useTranslation } from '@/src/lib/useTranslation';
import { useRouter } from "next/navigation";
import Loader from "@/src/components/loader";
import { toast } from "react-hot-toast";
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SearchableList() {
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Expected array but got:", data);
        setProducts([]); // fallback
        toast.error(t("Failedtoloadproducts"));
      }
    })
    .catch(err => {
      console.error(err);
      setProducts([]);
      toast.error(t("Failedtoloadproducts"));
    });
}, []);

  function useDebounce(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
  }

  const debouncedQuery = useDebounce(query, 300).trim().toLowerCase();

  const filteredProducts = Array.isArray(products)
  ? products.filter((product: any) =>
      [product.name, product.wholesale_price, product.selling_price, product.data, product.mostRecentPurchase]
        .join(' ')
        .toLowerCase()
        .includes(debouncedQuery)
    )
  : [];

  const router = useRouter();
  const { data: session, error } = useSWR("/api/session", fetcher);

  useEffect(() => {
    if (session === null) {
      router.push("/");
    } else if (session && !session.user?.isSubscribed) {
      router.push(`../${lang}/pricing`);
    }
  }, [session, router]);

  if (error) return <div>{t("dashboard.error")}</div>;
  if (session === undefined) return <Loader />;  
  if (!session || !session.user?.isSubscribed) return null;
  
    const deleteProduct = (id: number) => {
        toast((t) => (
          <div className="flex flex-col gap-3">
            <span className="font-medium">Delete this product?</span>

            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-1 text-xs bg-gray-200 rounded"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                onClick={async () => {
                  toast.dismiss(t.id);

                  const res = await fetch("/api/products", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                  });

                  if (res.ok) {
                    setProducts((prev: any) =>
                      prev.filter((p: any) => p.id !== id)
                    );
                    toast.success(t("productDeleted"));
                  } else {
                    toast.error(t("Failedtodeleteproduct"));
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ), { duration: 6000 });
      };

  return (
    <SidebarProvider
      className="primary-colors"
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
        className="fixed top-0 z-99999 h-full w-64 primary-colors transition-all duration-300 ease-in-out ltr:left-0 rtl:right-0 group-data-[collapsible=offcanvas]:ltr:-left-64 group-data-[collapsible=offcanvas]:rtl:-right-64"
        variant="inset"
        user={{
          name: session.user.name || "Guest",
          email: session.user.email || "Not logged in",
          avatar: session.user.image || "/default-avatar.png",
        }}
      />

      <SidebarInset>
        <header className="z-30 secondary-background flex h-[var(--header-height)] shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <h1 className="text-base font-medium">{t('searchHeader')}</h1>
          </div>
        </header>

        <div className="secondary-colors flex flex-1 flex-col p-6 gap-4">

              {/* ⚫ Grid */}
                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          


          <div className="w-full z-30">
            <Input 
              type="text"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="z-30 text-base secondary-colors"
            />
          </div>

          <div className="z-30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product: any) => (
             <Card
                    key={product.id}
                    className={`relative cursor-pointer transition primary-colors hover:border py-4 rounded ${
                      product.quantity_in_stock === 0
                        ? "card-search-zero rounded"
                        : ""
                    }`}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-50 h-auto mx-auto rounded"
                      />
                    ) : (
                    <ImageOff className="mx-auto opacity-50" size="150" />
                      
                    )}
                    
                    <CardHeader className="flex justify-between items-center">
                      
                      
                      <CardTitle className="text-lg w-full">{product.name}</CardTitle>

                      {product.quantity_in_stock === 0 && (
                        <div className="flex items-center gap-2">

                          <span className="text-[10px] px-2 py-1 rounded bg-red-100 text-red-600 font-semibold">
                            OUT
                          </span>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            🗑
                          </button>

                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="text-sm space-y-1 w-full">
                      <div>
                        <span className="font-medium">{t('wholesale')}:</span>{" "}
                        ${product.wholesale_price}
                      </div>

                      <div>
                        <span className="font-medium">{t('sellingPrice')}:</span>{" "}
                        ${product.selling_price}
                      </div>

                      <div>
                        <span className="font-medium">{t('quantityInStock')}:</span>{" "}
                        <span
                          className={
                            product.quantity_in_stock === 0
                              ? "text-red-600 font-semibold"
                              : ""
                          }
                        >
                          {product.quantity_in_stock}
                        </span>
                      </div>

                      <div>
                        {product.mostRecentPurchase ? (
                          <div>{new Date(product.mostRecentPurchase).toLocaleString()}</div>
                        ) : (
                          <div>{t('noPurchases')}</div>
                        )}
                      </div>

                      <div>
                        <span className="font-medium">{t('minimumAlertLevelNum')}:</span>{" "}
                        {product.minimumAlertLevel}
                      </div>

                      <div className="text-xs font-medium">
                        <b>{t('profit')}:</b>{" "}
                        {(
                          ((product.selling_price - product.wholesale_price) * 100) /
                          product.wholesale_price
                        ).toFixed(2)}
                        %
                      </div>

                      <div className="text-xs opacity-70">
                        {t('code')}: {product.code}
                      </div>
                    </CardContent>
                  </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
