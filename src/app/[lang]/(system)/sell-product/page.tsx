'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AppSidebar } from '@/src/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/src/components/ui/sidebar';
import { Separator } from '@/src/components/ui/separator';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Search, ScanBarcode, Trash2, ShoppingCart, ImageOff } from "lucide-react";
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/src/lib/useTranslation';
import Loader from '@/src/components/loader';
import BarcodeScannerInput from '@/src/components/BarcodeScannerInput';
import Image from 'next/image';
import { motion } from 'framer-motion';




const fetcher = (url: string) => fetch(url).then(res => res.json());

type Outlet = {
  id: number;
  name: string;
  location?: string | null;
};

type Product = {
  id: number;
  name: string;
  wholesale_price: number;
  selling_price: number;
  quantity_in_stock: number;
  code: string;
  image?: string;
};

type CartItem = Product & { quantity: number };

export default function MultiSellPage() {
  const { lang } = useParams();
const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [outletQuery, setOutletQuery] = useState('');
  const [outletId, setOutletId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannerActive, setScannerActive] = useState(false);

  const { data: outlets = [] } = useSWR<Outlet[]>('/api/outlets', fetcher);
  const { data: session, error: sessionError } = useSWR('/api/session', fetcher);




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
      
const [businessName, setBusinessName] = useState("");
const [logoUrl, setLogoUrl] = useState("");
const [businessCode, setBusinessCode] = useState("");
const [theme, setTheme] = useState("");
const [language, setLanguage] = useState("");






  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(() => toast.error('Failed to load products'));
  }, []);

  useEffect(() => {
    if (session === null) router.push('/');
    else if (session && !session.user?.isSubscribed) router.push(`../${lang}/pricing`);
  }, [session, router]);

  const filteredProducts = products.filter(product =>
    [product.name, product.wholesale_price, product.selling_price]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase().trim())
  );

  const filteredOutlets = outlets.filter(outlet => {
    const queryMatch = [outlet.name, outlet.location || '']
      .join(' ')
      .toLowerCase()
      .includes(outletQuery.toLowerCase().trim());

    const isSelected = outletId === outlet.id.toString();

    // Include outlet if it matches query OR is selected
    return queryMatch || isSelected;
  });

  // Add product to cart
  const toggleCart = (product: Product) => {
  const exists = cart.find(item => item.id === product.id);

  if (exists) {
    // ❌ remove
    setCart(cart.filter(item => item.id !== product.id));
    toast.success(t('sale.removedFromCart'));
  } else {
    // ✅ add
    setCart([...cart, { ...product, quantity: 1 }]);
    toast.success(t('sale.addedToCart'));
  }
};

  


const handlePriceChange = (id: number, price: number) => {
  setCart((prev) =>
    prev.map((item) =>
      item.id === id
        ? { ...item, selling_price: price }
        : item
    )
  );
};


  const updateQuantity = (id: number, qty: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };



  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleScan = (code: string) => {
    setScannerActive(true);
    setTimeout(() => setScannerActive(false), 2000);

    const found = products.find(p => p.code === code);
    if (found) {
      addToCart(found);
      toast.success(t('toast.productFound'));
    } else {
      toast.error(t('toast.productNotFound'));
    }
  };

  const submitSale = async () => {
  if (!cart.length) {
    toast.error(t('sale.emptyCart'));
    return;
  }


  
  // Capture outlet BEFORE clearing state
const trimmedId = outletId?.trim();
const selectedOutlet = outlets.find(o => String(o.id) === trimmedId);

const outletInfo = selectedOutlet
  ? `${selectedOutlet.name}${selectedOutlet.location ? ` - ${selectedOutlet.location}` : ''}`
  : t('sale.noOutlet');




  try {
    const res = await fetch('/api/sell/multi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outletId: selectedOutlet ? selectedOutlet.id : null,
        items: cart.map(({ id, quantity }) => ({ productId: id, quantity }))
      })
    });

    if (res.ok) {
      const date = new Date().toLocaleString();

      // Build receipt
      // Business state
// Build receipt HTML as a string
const billContent = `
<div style="
  font-family: 'Courier New', monospace;
  width: 300px;
  padding: 15px;
  border: 1px solid #000;
  text-align: left;
">
  <!-- Business Logo & Name -->
  <div style="text-align: center; margin-bottom: 10px;">
    ${logoUrl ? `<img src="${logoUrl}" alt="logo" style="max-width: 80px; margin-bottom: 5px;" />` : ""}
    <h2 style="margin: 0; font-size: 18px;">${businessName}</h2>
  </div>

  <hr style="border-top: 1px dashed #000;" />

  <!-- Sale Info -->
  <div style="font-size: 12px; margin-bottom: 10px;">
    <p style="margin: 2px 0; font-weight: bold;">Sale Receipt</p>
    <p style="margin: 2px 0;"><strong>Date:</strong> ${date}</p>
    <p style="margin: 2px 0;"><strong>Outlet:</strong> ${outletInfo}</p>
  </div>

  <hr style="border-top: 1px dashed #000;" />

  <!-- Items Table -->
  <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
    <thead>
      <tr>
        <th align="left">Product</th>
        <th align="right">Qty</th>
        <th align="right">Price</th>
        <th align="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${cart
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td align="right">${item.quantity}</td>
          <td align="right">$${item.selling_price.toFixed(2)}</td>
          <td align="right">$${(item.selling_price * item.quantity).toFixed(2)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <hr style="border-top: 1px dashed #000;" />

  <!-- Total -->
  <p style="text-align: right; font-weight: bold; font-size: 14px; margin: 5px 0;">
    Total: $${total.toFixed(2)}
  </p>

  <!-- Footer -->
  <div style="text-align: center; font-size: 12px; margin-top: 10px;">
    <p>Thank you for your purchase!</p>
    ${businessCode ? `<p style="margin-top: 5px; font-size: 10px;">${businessCode}</p>` : ""}
  </div>
</div>
`;

      // Print in new window
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>${t('sale.saleReceipt')}</title></head>
            <body onload="window.print();">${billContent}</body>
          </html>
        `);
        printWindow.document.close();
      }

      toast.success(t('sale.saleRecordedSuccess'));
      toast.success(t('sale.billPrintedSuccess'));

      // Clear cart and outlet AFTER printing
      setCart([]);
      setOutletId('');
      setOutletQuery('');
    } else {
      const error = await res.json();
      toast.error(error.error || t('sale.saleRecordFailed'));
    }
  } catch (err) {
    console.error(err);
    toast.error(t('sale.genericError'));
  }
};

  const containerRef = useRef<HTMLDivElement>(null);
  // Clear selection when clicking outside
  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setOutletQuery(""); // only clear the dropdown suggestions
      // ✅ DO NOT clear outletId here
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  if (sessionError) return <div>{t('sale.dashboard.error')}</div>;
  if (!session) return <Loader />;
  if (!session.user?.isSubscribed) return null;

  const total = cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
  const isInCart = (id: number) => {
  return cart.some(item => item.id === id);
};
  return (
    <SidebarProvider className="primary-colors" style={{
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 12)'
    } as React.CSSProperties}>




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
        variant="inset"
        className="fixed scrollbar-hide overflow-y-scrolltop-0 z-99999 h-full w-64 ltr:left-0 rtl:right-0"
        user={{
          name: session.user.name || 'Guest',
          email: session.user.email || 'Not logged in',
          avatar: session.user.image || '/default-avatar.png'
        }}
      />

      <SidebarInset>
        <header className="primary-colors z-30 flex h-[var(--header-height)] items-center px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h1 className="text-base font-medium">{t('sale.multiSellProducts')}</h1>
          <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
            <ScanBarcode className="h-5 w-5 text-[var(--primary-text-color)] animate-pulse" />
            <Link href={`/${lang}/search-items`}>
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <BarcodeScannerInput onScan={handleScan} />
<div className="secondary-colors p-6">

      {/* ⚫ Grid */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>
  
        {/* 🟡 Yellow Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>

        <Button
  onClick={() => {
    document.getElementById("cart")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
  className="fixed bottom-6 right-6 z-99999 bg-yellow-400 text-black shadow-lg hover:bg-yellow-300 px-5 py-3 rounded-full flex items-center gap-2"
>
  <ShoppingCart size={18} />
  Cart ({cart.length})
</Button>

        <div className="primary-colors border-theme p-6 flex gap-6 z-50 relative rounded-xl">
          {/* Products List */}
          <div className="w-full">
            <Input
              placeholder={t('sale.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full my-6 secondary-colors py-3"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 space-y-4 lg:grid-cols-3 gap-4 my-2 mx-0">
              {filteredProducts.map((product: any) => (
                <Card key={product.id}
                  
                    onClick={() => toggleCart(product)}
                className={`
                  my-0 cursor-pointer transition rounded-xl border
                  ${isInCart(product.id)
                    ? "third-colors text-black border-yellow-400 scale-[1.02] shadow-xl"
                    : "primary-colors border-white/10 hover:border-yellow-400 hover:scale-[1.01]"
                  }
                `}
                                
                  
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
                 
                 
                  <CardHeader className='flex justify-between'>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="text-sm">
                    <div>
                      <span className="font-medium">{t('wholesale')}:</span>{' '}
                      ${product.wholesale_price}
                    </div>
                    <div>
                      <span className="font-medium">{t('sellingPrice')}:</span>{' '}
                      ${product.selling_price}
                    </div>
                    <div>
                      <span className="font-medium">{t('quantityInStock')}:</span>{' '}
                      {product.quantity_in_stock}
                    </div>

                    <div className="mt-0">
                      {product.mostRecentPurchase ? (
                        <div>{new Date(product.mostRecentPurchase).toLocaleString()}</div>
                      ) : (
                        <div>{t('noPurchases')}</div>
                      )}
                    </div>

                    <div>
                      <span className="font-medium">{t('minimumAlertLevelNum')}:</span>{' '}
                      {product.minimumAlertLevel}
                    </div>

                    <div className="py-0 rounded text-xs font-semibold third-text w-max">
                      <b>{t('profit')}:</b>{' '}
                      {(((product.selling_price - product.wholesale_price) * 100) / product.wholesale_price).toFixed(2)}%
                    </div>
                    <div>
                      <span className="small w-max">{t('code')}:{product.code}</span>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
</div>
        <div className='mx-6 z-30 grid grid-cols-1 lg:grid-cols-1 gap-3'>
          {/* Cart */}
          <div className="space-y-0 " id="cart">
            <h2 className="font-bold text-lg my-6">{t('sale.cart')}</h2>
            {cart.length === 0 && <p>{t('sale.emptyCart')}</p>}

            {cart.length === 0 &&
              <div className='py-2'>
                <ShoppingCart size="70" className='opacity-50' />

              </div>
            }

            <div className='grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6'>
              {cart.map(item => (
                <div key={item.id} className="p-3 border primary-colors rounded-md">
                  <div>

                    <p className="font-semibold">{item.name}</p>


                    

                    <input
                      type="number"
                      value={item.selling_price}
                      onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                      className="border p-1 w-20 text-sm"
                    />
                    <span className="text-sm"> x {item.quantity}</span>


                    <p className="text-sm">{t('sale.subtotal')}: ${(item.selling_price * item.quantity).toFixed(2)}</p>

                    
                  </div>
                  <div className="flex items-center py-3">
                    <Input
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      className="w-16 secondary-colors"
                    />
                    <Button className='mx-4 secondary-colors' variant="destructive" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <>
                <Input
                  placeholder={t('sale.searchOutlet')}
                  value={outletQuery}
                  onChange={(e) => setOutletQuery(e.target.value)}
                  className="w-full my-6 primary-colors py-3"
                />
                <div ref={containerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {filteredOutlets.map((outlet) => {
                    const isSelected = outletId === outlet.id.toString();
                    return (
                      <Card
                        key={outlet.id}
                        onClick={() => {
                          setOutletId(outlet.id.toString());
                          setOutletQuery(outlet.name);
                        }}
                        className={`border cursor-pointer p-3 rounded-md ${isSelected ? "secondary-colors" : "hover:shadow-md"}`}
                      >
                        <CardTitle className="text-sm font-semibold">{outlet.name}</CardTitle>
                        {outlet.location && <p className="text-xs">{outlet.location}</p>}
                      </Card>
                    );
                  })}
                </div>

                <h3 className="font-bold my-6">{t('sale.total')}: ${total.toFixed(2)}</h3>
                <Button onClick={submitSale} className="third-colors my-2">
                  {t('sale.completeSale')}
                </Button>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
