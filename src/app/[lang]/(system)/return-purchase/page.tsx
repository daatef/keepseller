'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AppSidebar } from '@/src/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Check, ChevronsUpDown, Search, ScanBarcode } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Command, CommandInput, CommandItem, CommandList } from '@/src/components/ui/command';
import { Separator } from '@/src/components/ui/separator';
import Link from 'next/link';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/src/lib/useTranslation';
import Loader from '@/src/components/loader';
import BarcodeScannerInput from '@/src/components/BarcodeScannerInput';
import SupplierSelect from '@/src/custom-components/supplier-select';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
} from "@/src/components/ui/command";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Product {
  id: number;
  name: string;
  code: string;
  quantity_in_stock: number;
  wholesale_price: number;
  image?: string;
  description?: string;
}

export default function ReturnPurchasePage() {
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [productId, setProductId] = useState<string>('');
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [manualRefund, setManualRefund] = useState<boolean>(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);

  const { data: session, error } = useSWR('/api/session', fetcher);

  const selectedProduct = products.find(p => p.id.toString() === productId);


    const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);


  // Auto calculate refund
  useEffect(() => {
    if (autoCalculate && selectedProduct) {
      const calc = quantity * selectedProduct.wholesale_price;
      setRefundAmount(parseFloat(calc.toFixed(2)));
    }
  }, [quantity, selectedProduct, autoCalculate]);

  // Fetch products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []));
  }, []);

  // Fetch suppliers
  useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => setSuppliers(Array.isArray(data) ? data : []));
  }, []);

  // Session redirect
  useEffect(() => {
    if (session === null) router.push('/');
    else if (session && !session.user?.isSubscribed) router.push(`../${lang}/pricing`);
  }, [session, router, lang]);

  const handleSubmit = async () => {
    if (!productId || !supplierId || !quantity || !refundAmount) {
      toast.error(t('returnToast.fillRequiredFields'));
      return;
    }

    const res = await fetch('/api/return-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId),
        supplierId,
        quantity,
        refundAmount,
        reason,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success(t('returnRecordedSuccess'));
      setProductId('');
      setSupplierId(null);
      setQuantity(1);
      setRefundAmount(0);
      setManualRefund(false);
      setReason('');
    } else {
      toast.error(result.error || t('returnFailed'));
    }
  };

  const handleScan = (code: string) => {
    const found = products.find(p => p.code === code);
    if (found) {
      setProductId(found.id.toString());
      setQuantity(1);
      setManualRefund(false);
      toast.success(t('toast.productFound'));
    } else {
      toast.error(t('toast.productNotFound'));
    }
  };

  if (error) return <div>{t('returnDashboard.error')}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  return (
    <SidebarProvider className="primary-colors" style={{
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)',
    } as React.CSSProperties}>

  
      <AppSidebar
        className="fixed scrollbar-hide overflow-y-scroll top-0 z-99999 h-full w-64 primary-colors"
        variant="inset"
        user={{
          name: session.user.name || 'Guest',
          email: session.user.email || 'Not logged in',
          avatar: session.user.image || '/default-avatar.png',
        }}
      />

      <SidebarInset>
        <header className="secondary-background flex h-[var(--header-height)] shrink-0 items-center gap-2">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{t('returnPurchase')}</h1>
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
              <CardTitle>{t('return.pageTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full z-30">

              <BarcodeScannerInput onScan={handleScan} />

              {/* Product selection */}
              <div className='my-5'>
                <Label className="mb-2">{t('returnPurchase.productLabel')}</Label>
                <Popover  open={openProduct} onOpenChange={setOpenProduct}>
                  <PopoverTrigger className='primary-colors' asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProduct}
                      className="w-full justify-between secondary-background third-text"
                    >
                      {selectedProduct
                        ? `${selectedProduct.name} (${t('returnPurchase.stock')}: ${selectedProduct.quantity_in_stock})`
                        : t('returnPurchase.selectProduct')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 mx-auto z-40">
                    <Command>
                      <CommandInput placeholder={t('returnPurchase.searchProduct')} />
                      <CommandList>
                        {products.length === 0
                          ? <div>{t('returnPurchase.noProducts')}</div>
                          : products.map(product => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => {
                                  setProductId(product.id.toString());
                                  setQuantity(1);
                                  setManualRefund(false);
                                  setOpenProduct(false);
                                }}
                                className="secondary-colors rounded-none"
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${productId === product.id.toString() ? "opacity-100" : "opacity-0"}`}
                                />
                                {product.name} ({t('returnPurchase.stock')}: {product.quantity_in_stock})
                              </CommandItem>
                            ))
                        }
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Show selected product info */}
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
                    <div>{t('purchase.wholesaleprice')}: ${selectedProduct.wholesale_price}</div>
                    <div>{t('purchase.stock')}: {selectedProduct.quantity_in_stock}</div>
                  </div>
                </div>
              )}

              {/* Refund controls */}
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Label className="font-semibold">
                  {t('returnPurchase.refundQuantity')} <span className='secondary-colors rounded px-5 bold text-lg'>{quantity}</span>
                </Label>

                {selectedProduct && (
                  <div className="text-sm text-gray-500">
                    {t('returnPurchase.calculatedRefund')}: <span className='secondary-colors rounded px-5 bold text-lg'>{(selectedProduct.wholesale_price * quantity).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(prev => Math.max(0, prev - 1))}
                    className="secondary-colors px-3"
                  >-</Button>
                  <Input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="text-center flex-1 secondary-colors"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="secondary-colors px-3"
                  >+</Button>
                </div>
              </div>

              {/* Manual refund input */}
              <div>
                <Label className="mb-2">{t('refundAmount')}</Label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => {
                    setRefundAmount(Number(e.target.value));
                    setAutoCalculate(false);
                    setManualRefund(true);
                  }}
                  placeholder={t('form.placeholders.refund')}
                  className="secondary-colors"
                />
              </div>

              {/* Supplier select */}

                  <Card className="flex z-50 primary-colors mt-2 p-6 border-theme rounded-xl">
                    <div className="mt-3 w-full">
                      <label className="text-sm font-medium mb-2 block">
                        {t("selectSupplier")}
                      </label>

                      <Popover open={open} onOpenChange={setOpen}>
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

                        <PopoverContent className="w-full secondary-colors p-0 rounded-xl">
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
                                    setSelectedSupplier(s);
                                    setSupplierId(s.id);
                                    setOpen(false);
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


              {/* Reason */}
              <div>
                <Label className="mb-2">{t('reason')}</Label>
                <Input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('form.placeholders.reason')}
                  className="secondary-colors"
                />
              </div>

              <Button
                className="px-6 third-colors"
                onClick={handleSubmit}
                disabled={!productId || !quantity || !supplierId}
              >
                {t('submitReturn')}
              </Button>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}