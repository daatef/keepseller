'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { AppSidebar } from '@/src/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar';
import { Separator } from '@/src/components/ui/separator';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Loader from '@/src/components/loader';
import { useTranslation } from '@/src/lib/useTranslation';
import { ImageOff } from "lucide-react";
import { motion } from 'framer-motion';
import { ShoppingCart } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReturnSalePage() {
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const router = useRouter();
  const { data: session, error } = useSWR('/api/session', fetcher);

  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  useEffect(() => {
    if (session === null) {
      router.push('/');
    } else if (session && !session.user?.isSubscribed) {
      router.push(`../${lang}/pricing`);
    }
  }, [session, router]);

  const debouncedQuery = query.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(debouncedQuery)
  );

  if (error) return <div>{t('returnDashboard.error')}</div>;
  if (session === undefined) return <Loader />;
  if (!session || !session.user?.isSubscribed) return null;

  const handleSubmit = async () => {
    if (!productId || !quantity || !refundAmount) {
      toast.error(t('returnToast.fillRequiredFields'));
      return;
    }

    const res = await fetch('/api/return-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId),
        quantity: Number(quantity),
        refundAmount: Number(refundAmount),
        reason,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success(t('returnRecordedSuccess'));
      setProductId('');
      setQuantity('');
      setRefundAmount('');
      setReason('');
    } else {
      toast.error(result.error || t('returnFailed'));
    }
  };

  return (
    <SidebarProvider
      className="primary-colors"
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
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
      ></motion.div><AppSidebar
        className="fixed top-0 z-9999999 h-full w-64 primary-colors transition-all duration-300 ease-in-out ltr:left-0 rtl:right-0 group-data-[collapsible=offcanvas]:ltr:-left-64 group-data-[collapsible=offcanvas]:rtl:-right-64"
        variant="inset"
        user={{
          name: session.user.name || 'Guest',
          email: session.user.email || 'Not logged in',
          avatar: session.user.image || '/default-avatar.png',
        }}
      />
      <SidebarInset>
        <header className="z-9 primary-colors flex h-[var(--header-height)] shrink-0 items-center gap-2">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{t('returnSale')}</h1>
            <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
              <Link className="flex items-center z-20" href={`/${lang}/search-items`}>
                <Search className="h-4 w-4 ml-2 primary-colors" />
              </Link>
            </div>
          </div>
        </header> 
        <div className="secondary-colors p-6">

        
    {/* ⚫ Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* 🟡 Yellow Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>


  <Button
  onClick={() => {
    document.getElementById("returnCart")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
  className="fixed bottom-6 right-6 z-99999 bg-yellow-400 text-black shadow-lg hover:bg-yellow-300 px-5 py-3 rounded-full flex items-center gap-2"
>
  <ShoppingCart size={18} />
  {t('ReturnCart')}
</Button>







        <div className="relative z-50 rounded-xl flex flex-1 flex-col p-6 gap-4">
          <div className="w-full z-9">
            <Input
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='secondary-colors'
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                onClick={() => setProductId(product.id.toString())}
                className={`cursor-pointer border border-theme z-9 transition primary-colors ${
                  productId === product.id.toString()
                    ? 'card-after-hover card-text-after-hover'
                    : 'hover:border'
                }`}
              >

                  {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-40 h-auto mx-auto rounded"
                      />
                    ) : (
                    <ImageOff className="mx-auto opacity-50" size="150" />

                    )}

                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-0">
                  <div>
                    <b>{t('returnPurchase.stock')}:</b> {product.quantity_in_stock}
                  </div>
                  <div>
                    <b>{t('refundAmount')}:</b> ${product.selling_price}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {productId && (
            <div id='returnCart' className="max-w-md border-theme z-9 w-full p-6 rounded-lg shadow-sm primary-colors">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t('returnPurchase.quantityPlaceholder')}
                className="secondary-colors my-1 px-3"
              />
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={t('refundAmount')}
                className="secondary-colors my-1 px-3"
              />
              <Input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('reason')}
                className="secondary-colors my-1 px-3"
              />
              <Button onClick={handleSubmit} className="third-colors my-1">
                {t('submitReturn')}
              </Button>
            </div>
          )}
        </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
