'use client';
import React, { useEffect, useState } from 'react';
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Search, ScanBarcode, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "@/src/components/ui/command";
import toast from 'react-hot-toast';
import { Separator } from "@/src/components/ui/separator";
import Link from "next/link";
import useSWR from "swr";
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/src/lib/useTranslation';
import Loader from "@/src/components/loader";
import BarcodeScannerInput from "@/src/components/BarcodeScannerInput";
import SupplierSelect from "@/src/custom-components/supplier-select";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup
} from "@/src/components/ui/command";


const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Product {
  id: number;
  name: string;
  code: string;
  quantity_in_stock: number;
  wholesale_price: number; // سعر المنتج
  image?: string;
  description?: string;
}

export default function PurchaseProductPage() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
const [supplierOpen, setSupplierOpen] = useState(false);
  const { data: session, error } = useSWR("/api/session", fetcher);


  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      } catch (err) {
        console.error(err);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/suppliers");
        const data = await res.json();
        if (Array.isArray(data)) setSuppliers(data);
        else setSuppliers(data.suppliers || []);
      } catch (err) {
        console.error(err);
        setSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  // Session redirect
  useEffect(() => {
    if (session === null) router.push("/");
    else if (session && !session.user?.isSubscribed) router.push(`../${lang}/pricing`);
  }, [session, router]);

  const selectedProduct = products.find(p => p.id.toString() === productId);

  const handlePurchase = async () => {
    if (!productId || !quantity || !supplierId) {
      toast.error(t('toast.selectProductQuantity') || "Select product, quantity and supplier");
      return;
    }

    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId),
        quantity: Number(quantity),
        supplierId: supplierId,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(t('toast.purchaseSuccess'));
      setProductId('');
      setQuantity(1);
      setSupplierId(null);
    } else {
      toast.error(data.error || t('toast.purchaseFailed'));
    }
  };

  const handleScan = (code: string) => {
    setScannerActive(true);
    setTimeout(() => setScannerActive(false), 2000);
    const found = products.find(p => p.code === code);
    if (found) {
      setProductId(found.id.toString());
      toast.success(t("toast.productFound"));
    } else {
      toast.error(t("toast.productNotFound"));
    }
  };

  if (error) return <div>{t("dashboard.error")}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <SidebarProvider className="primary-colors" style={{
      "--sidebar-width": "calc(var(--spacing) * 72)",
      "--header-height": "calc(var(--spacing) * 12)",
    } as React.CSSProperties}>

    
      <AppSidebar
        className="fixed scrollbar-hide overflow-y-scroll top-0 z-99999 h-full w-64 primary-colors transition-all duration-300 ease-in-out ltr:left-0 rtl:right-0 group-data-[collapsible=offcanvas]:ltr:-left-64 group-data-[collapsible=offcanvas]:rtl:-right-64"
        variant="inset"
        user={{
          name: session.user.name || "Guest",
          email: session.user.email || "Not logged in",
          avatar: session.user.image || "/default-avatar.png",
        }}
      />

      <SidebarInset>
        <header className="primary-colors flex h-[var(--header-height)] shrink-0 items-center gap-2">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{t('purchase.title')}</h1>
            <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
              <ScanBarcode className="h-5 w-5 text-[var(--primary-text-color)] animate-pulse" />
              <Link className="flex items-center z-30" href={`/${lang}/search-items`}>
                <Search className="h-4 w-4 ml-2 primary-text" />
              </Link>
            </div>
          </div>
        </header>

        <main className="secondary-colors flex flex-1 p-6">

              {/* ⚫ Grid */}
                <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
                {/* 🟡 Yellow Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>
          


          <Card className="w-full h-max primary-colors border-theme">
            <CardHeader>
              <CardTitle>{t('purchase.pageTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full z-30">
              <BarcodeScannerInput onScan={handleScan} />

              {/* Product select */}
              <div>
                <Label className='mb-2'>{t('purchase.productLabel')}</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between primary-colors"
                    >
                      {selectedProduct
                        ? `${selectedProduct.name} (${t('purchase.stock')}: ${selectedProduct.quantity_in_stock})`
                        : t('purchase.selectProduct')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 mx-auto z-40">
                    <Command>
                      <CommandInput placeholder={t('purchase.searchProduct')} />
                      <CommandList>
                        {products.length === 0
                          ? <div>{t('purchase.noProducts')}</div>
                          : products.map(product => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => {
                                  setProductId(product.id.toString());
                                  setOpen(false);
                                  setQuantity(1); // reset quantity عند تغيير المنتج
                                }}
                                className="secondary-colors rounded-none"
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${productId === product.id.toString() ? "opacity-100" : "opacity-0"}`}
                                />
                                {product.name} ({t('purchase.stock')}: {product.quantity_in_stock})
                              </CommandItem>
                            ))
                        }
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Show product info */}
              {selectedProduct && (
                <div className="flex gap-4 items-center mt-2 p-2 border border-gray-300 rounded">
                  {selectedProduct.image && (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{selectedProduct.name}</div>
                    <div>${t('purchaseWholesaleprice')}: {selectedProduct.wholesale_price} </div>
                    <div>{t('purchaseStock')}: {selectedProduct.quantity_in_stock}</div>
                  </div>
                </div>
              )}

              {/* Quantity & total */}

                <div className="flex flex-col gap-2 w-full">
                
                <div className="flex items-center gap-2 w-full max-w-xs">
                  {/* زر نقص */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 secondary-colors"
                  >
                    -
                  </Button>

                  {/* حقل الرقم */}
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && val > 0) setQuantity(val);
                    }}
                    className="text-center flex-1 secondary-colors"
                    placeholder={t('purchase.quantityPlaceholder')}
                  />

                  {/* زر زيادة */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3 secondary-colors"
                  >
                    +
                  </Button>
                </div>



                {/* Live total */}
                  {selectedProduct && (
                    <div className="font-bold mt-2">
                      ${t('wholesale.price.purchase.total')}: {(Number(selectedProduct.wholesale_price || 0) * Number(quantity || 0)).toLocaleString()} 
                    </div>
                  )}
              </div>

              {/* Supplier select */}

{/* Supplier select */}
<Card className="flex z-50 primary-colors mt-2 p-6 border-theme rounded-xl">
  <div className="mt-3 w-full">
    <label className="text-sm font-medium mb-2 block">
      {t("selectSupplier")}
    </label>

    <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full secondary-colors justify-between h-12 rounded-lg border-theme shadow-sm hover:shadow-md transition"
        >
          {selectedSupplier ? (
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">
                {selectedSupplier.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedSupplier.phone} • {selectedSupplier.email}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {t("select")}...
            </span>
          )}

          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full secondary-colors p-0 rounded-xl z-50">
        <Command>
          <CommandInput placeholder={t("searchSupplier")} />

          <CommandEmpty>
            {t("noSupplierFound")}
          </CommandEmpty>

          <CommandGroup className="max-h-60 overflow-auto">
            {suppliers.map((s: any) => (
              <CommandItem
                key={s.id}
                value={`${s.name} ${s.phone} ${s.email}`}
                onSelect={() => {
                  // ✅ toggle select
                  if (selectedSupplier?.id === s.id) {
                    setSelectedSupplier(null);
                    setSupplierId(null);
                  } else {
                    setSelectedSupplier(s);
                    setSupplierId(s.id);
                  }
                  setSupplierOpen(false);
                }}
                className="flex items-center justify-between p-3 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.phone} • {s.email}
                  </span>
                </div>

                <Check
                  className={cn(
                    "h-4 w-4",
                    selectedSupplier?.id === s.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</Card>


              {/* Submit */}
              <Button
                className="px-6 third-colors"
                onClick={handlePurchase}
                disabled={!productId || !quantity || !supplierId}
              >
                {t('purchase.submitButton')}
              </Button>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}