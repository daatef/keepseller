'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import { toast } from "react-hot-toast";
import { AppSidebar } from "@/src/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ShoppingCart, ImageOff } from "lucide-react";
import Loader from "@/src/components/loader";
import { useTranslation } from "@/src/lib/useTranslation";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Search, ScanBarcode, Check, ChevronsUpDown } from "lucide-react";
import { TableProperties } from 'lucide-react';

import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";

import { cn } from "@/lib/utils";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/src/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CreditSalesPage() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar") || "en");

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [outletQuery, setOutletQuery] = useState("");
  const [outletId, setOutletId] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [productId, setProductId] = useState<string>('');
  const { data: customersData, mutate: mutateCustomers } = useSWR("/api/customers", fetcher);
  const { data: productsData, mutate: mutateProducts } = useSWR("/api/products", fetcher);
  const { data: outletsData } = useSWR("/api/outlets", fetcher); // assuming you have outlets API
  const { data: session, error } = useSWR("/api/session", fetcher);


  const [open, setOpen] = React.useState(false);




const [sales, setSales] = useState<any[]>([]);
const [searchTerm, setSearchTerm] = useState("");
const [receipts, setReceipts] = useState<any[]>([]);
const [businessName, setBusinessName] = useState("");
const [logoUrl, setLogoUrl] = useState("");
const router = useRouter();
  

  useEffect(() => {
    if (customersData) setCustomers(customersData);
    if (productsData) setProducts(productsData);
  }, [customersData, productsData]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const filteredOutlets = useMemo(() => {
    if (!outletsData) return [];
    return outletsData.filter((o: any) =>
      o.name.toLowerCase().includes(outletQuery.toLowerCase())
    );
  }, [outletsData, outletQuery]);

  const handleAddCustomer = async () => {
    if (!customerForm.name) return toast.error(t("nameRequired") || "Name required");
    const res = await fetch("/api/customers", {
      method: "POST",
      body: JSON.stringify(customerForm),
    });
    if (res.ok) {
      toast.success(t("customerAdded") || "Customer added");
      setCustomerForm({ name: "", phone: "", email: "", address: "" });
      mutateCustomers();
    }
  };

  const toggleCart = (product: any) => {
  const exists = cart.find(item => item.id === product.id);

  if (exists) {
    setCart(cart.filter(item => item.id !== product.id));
    toast.success(t('removedFromCart') || "Removed");
  } else {
    if (product.quantity_in_stock <= 0) {
      return toast.error(t("noProductsInStock") || "No products in stock");
    }

    setCart([...cart, { ...product, quantity: 1 }]);
    toast.success(t('addedToCart') || "Added");
  }
};

  const isInCart = (productId: string) =>
  cart.some(c => c.id === productId);

  const total = cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);

  const updateQuantity = (productId: string, quantity: number) => {
  setCart(cart.map(c =>
    c.id === productId ? { ...c, quantity } : c
  ));
};

  const handlePriceChange = (productId: string, price: number) => {
  setCart(cart.map(c =>
    c.id === productId ? { ...c, selling_price: price } : c
  ));
};
const removeFromCart = (productId: string) => {
  setCart(cart.filter(c => c.id !== productId));
};

  const printInvoice = () => {
    if (!cart.length) return toast.error(t("noProductsInCart") || "No products in cart");
    const date = new Date().toLocaleString();
    const billContent = `
      <div style="font-family: 'Courier New', monospace; width: 300px; padding: 15px; border: 1px solid #000; text-align: left;">
        <h2 style="text-align:center">${t("creditSaleInvoice")}</h2>
        <p><strong>${t("customer")}:</strong> ${selectedCustomer?.name || t("noCustomer")}</p>
        <p><strong>${t("date")}:</strong> ${date}</p>
        <hr/>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th align="left">${t("product")}</th>
              <th align="right">${t("qty")}</th>
              <th align="right">${t("price")}</th>
              <th align="right">${t("total")}</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map(item => `
              <tr>
                <td>${item.name}</td>
                <td align="right">${item.quantity}</td>
                <td align="right">$${item.selling_price.toFixed(2)}</td>
                <td align="right">$${(item.selling_price * item.quantity).toFixed(2)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
        <hr/>
        <p style="text-align:right;"><strong>${t("total")}:</strong> $${total.toFixed(2)}</p>
      </div>
    `;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`<html><body onload="window.print();">${billContent}</body></html>`);
      printWindow.document.close();
    }
  };

  const handleCreditSale = async () => {
  if (!selectedCustomer) return toast.error(t("selectCustomer"));

  if (!cart.length) return toast.error(t("noProductsInCart"));

  // ✅ check stock
  const invalid = cart.find(item => item.quantity > item.quantity_in_stock);
  if (invalid) {
    return toast.error(`${invalid.name} ${t("notEnoughStock") || "not enough stock"}`);
  }

const items = cart.map(item => ({
  productId: item.id,
  quantity: Number(item.quantity),
  price: Number(item.selling_price)
}));
  
  const res = await fetch("/api/credit-sales", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        customerId: selectedCustomer.id,
        items,
        outletId
    }),
});

  if (res.ok) {
    toast.success(t("creditSaleAdded"));
    printInvoice();
    setCart([]);
    mutateProducts();
  } else {
    const data = await res.json();
    toast.error(data.error);
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




  {/* From Credit Transaction */}
  
  
    useEffect(() => {
      if (session === null) router.push("/");
      else if (session && !session.user?.isSubscribed)
        router.push(`../${lang}/pricing`);
    }, [session, router, lang]);
  
    useEffect(() => {
      fetch("/api/credit-sales")
        .then(res => res.json())
        .then(data => setSales(data || []));
    }, []);
  
    const filteredSales = sales.filter((s) =>
      s.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.totalAmount).includes(searchTerm) ||
      s.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const markAsPaid = async (id: number) => {
      await fetch(`/api/credit-sales/pay/${id}`, { method: "PATCH" });
  
      setSales(prev =>
        prev.map(s =>
          s.id === id ? { ...s, status: "paid", remaining: 0 } : s
        )
      );
    };
  
  
    // Fetch receipts
      useEffect(() => {
        fetch("/api/receipts")
          .then(res => res.json())
          .then(data => setReceipts(data));
      }, []);
    
      // Fetch settings
      useEffect(() => {
        fetch("/api/settings")
          .then(res => res.json())
          .then(data => {
            setBusinessName(data.businessName || "My Business");
            setLogoUrl(data.businessLogoUrl || "");
          });
      }, []);
  
    // ✅ PRINT
    const printReceipt = (receipt: any) => {
    const date = new Date(receipt.createdAt).toLocaleString();
    const outletInfo = receipt.outlet?.name || t("outlet");
  
    // ✅ FIX: support both shapes safely
    const cart = receipt.items || receipt.sales || [];
  
    const total = Number(receipt.totalAmount || receipt.total || 0);
  
    const billContent = `
    <div style="font-family: 'Courier New', monospace; width: 300px; padding: 15px;">
      
      <div style="text-align: center;">
        ${logoUrl ? `<img src="${logoUrl}" style="max-width: 80px;" />` : ""}
        <h2>${businessName}</h2>
      </div>
  
      <hr/>
  
      <p><strong>${t("saleReceipt")}</strong></p>
      <p>${t("date")}: ${date}</p>
      <p>${t("outlet")}: ${outletInfo}</p>
  
      <hr/>
  
      <table style="width:100%; font-size:12px;">
        <thead>
          <tr>
            <th>${t("product")}</th>
            <th>${t("quantity")}</th>
            <th>${t("price")}</th>
            <th>${t("total")}</th>
          </tr>
        </thead>
  
        <tbody>
          ${cart.map((item: any) => {
            const name =
              item.product?.name ||
              item.productName ||
              "Unknown";
  
            const qty = Number(item.quantity || 0);
  
            const price = Number(
              item.price ||
              item.product?.selling_price ||
              0
            );
  
            const rowTotal = price * qty;
  
            return `
              <tr>
                <td>${name}</td>
                <td>${qty}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${rowTotal.toFixed(2)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
  
      <hr/>
  
      <p style="text-align:right;">
        <strong>${t("total")}: $${total.toFixed(2)}</strong>
      </p>
  
      <p style="text-align:center;">${t("thankYou")}</p>
    </div>
    `;
  
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Enable popups");
      return;
    }
  
    printWindow.document.write(`
      <html>
        <head>
          <title>${t("print")}</title>
        </head>
        <body onload="window.print(); window.close();">
          ${billContent}
        </body>
      </html>
    `);
  
    printWindow.document.close();
  };
  
  {/* End from credit Transaction */}




  if (!customers || !products) return <Loader />;
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
        <header className="primary-colors z-99999 flex h-[var(--header-height)] shrink-0 items-center gap-2">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1 rtl:-mr-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{t('creditSales')}</h1>
            <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-2">
              <ScanBarcode className="h-5 w-5 text-[var(--primary-text-color)] animate-pulse" />
              <Link className="flex items-center z-99" href={`/${lang}/search-items`}>
                <Search className="h-4 w-4 ml-2 primary-text" />
              </Link>
            </div>
          </div>
        </header>

        
        {/* ⚫ Grid */}
        <div className="absolute z-10 inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* 🟡 Yellow Glow */}
        <div className="absolute z-10 inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent blur-3xl"></div>



        <div className="space-y-6 p-6 z-99 relative">


            {/* Cart Button */}
            <Button
            onClick={() => {
            document.getElementById("goToCart")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            }}
            className="fixed bottom-6 right-6 z-99999 bg-yellow-400 text-black shadow-lg hover:bg-yellow-300 px-5 py-3 rounded-full flex items-center gap-2"
        >
            <ShoppingCart size={18} />
            Cart ({cart.length})
        </Button>

        {/* Table Button */}
            <Button
            onClick={() => {
            document.getElementById("goToTable")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            }}
            className="fixed bottom-20 right-6 z-99999 bg-gray-400 text-black shadow-lg hover:bg-black-300 px-5 py-3 rounded-full flex items-center gap-2"
        >
            <TableProperties size={18} />
            Table
        </Button>

        
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            className="z-99 absolute ltr:right-[-5rem] rtl:left-[-5rem] bottom-[-5rem] w-[25rem] h-[25rem] rounded-full bg-gradient-to-tr from-yellow-400/60 via-white/40 to-black/10 blur-[120px] opacity-80 pointer-events-none"
          />

          {/* ADD CUSTOMER */}
          <Card className="z-50 w-full h-max primary-colors border-theme">
            <CardHeader><CardTitle>{t("addCustomer")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["name", "phone", "email", "address"].map(f => (
                <Input
                  key={f}
                  className="secondary-colors"
                  placeholder={t(f)}
                  value={(customerForm as any)[f]}
                  onChange={(e) => setCustomerForm({ ...customerForm, [f]: e.target.value })}
                />
              ))}
              <Button className="px-6 third-colors" onClick={handleAddCustomer}>{t("add")}</Button>
            </CardContent>
          </Card>

          {/* SELECT CUSTOMER */}
          <Card className="flex z-99 primary-colors mt-2 p-6 border-theme rounded-xl">
            <div className="mt-3 z-99">
                <label className="text-sm font-medium mb-2 block">
                    {t("selectCustomer")}
                </label>

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-full secondary-colors z-99 justify-between h-12 rounded-lg border-theme shadow-sm hover:shadow-md transition"
                    >
                        {selectedCustomer ? (
                        <div className="flex secondary-colors flex-col items-start text-left">
                            <span className="font-medium">
                            {selectedCustomer.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                            {selectedCustomer.phone} • {selectedCustomer.email}
                            </span>
                        </div>
                        ) : (
                        <span className="secondary-colors text-muted-foreground">
                            {t("select")}...
                        </span>
                        )}

                        <ChevronsUpDown className="ml-2 secondary-colors h-4 w-4 opacity-50" />
                    </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full secondary-colors z-99 p-0 rounded-xl">
                    <Command>
                        <CommandInput placeholder={t("Search customer")}/>

                        <CommandEmpty>
                        {t("noCustomerFound")}
                        </CommandEmpty>

                        <CommandGroup className="max-h-60 secondary-colors overflow-auto">
                        {customers.map((c: any) => (
                            <CommandItem
                            key={c.id}
                            value={`${c.name} ${c.phone} ${c.email}`}
                            onSelect={() => {
                                setSelectedCustomer(c);
                                setOpen(false);
                            }}
                            className="flex items-center secondary-colors justify-between p-3 cursor-pointer"
                            >
                            <div className="flex flex-col">
                                <span className="font-medium">{c.name}</span>
                                <span className="text-xs text-muted-foreground">
                                {c.phone} • {c.email}
                                </span>
                            </div>

                            <Check
                                className={cn(
                                "h-4 w-4",
                                selectedCustomer?.id === c.id
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




          {/* PRODUCTS GRID */}
          <Card className="z-99 primary-colors border-theme">
            <CardHeader><CardTitle>{t("products")}</CardTitle></CardHeader>
            <CardContent>
              <Input
              className="secondary-colors p-2 mb-3"
                placeholder={t("searchProduct")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="grid primary-colors grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-2">
                {filteredProducts.map((product: any) => (
                  <Card key={product.id} onClick={() => toggleCart(product)}
                    className={`my-0 cursor-pointer primary-colors transition rounded-xl border
                      ${isInCart(product.id)
                        ? "third-colors text-black border-yellow-400 scale-[1.02] shadow-xl"
                        : "primary-colors border-white/10 hover:border-yellow-400 hover:scale-[1.01]"}`
                    }
                  >
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-40 h-auto mx-auto rounded" />
                    ) : (
                      <ImageOff className="mx-auto opacity-50" size={150} />
                    )}

                    <CardHeader className='flex justify-between'>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>

                    <CardContent className="text-sm">
                      <div><b>{t('wholesale')}:</b> ${product.wholesale_price}</div>
                      <div><b>{t('sellingPrice')}:</b> ${product.selling_price}</div>
                      <div><b>{t('quantityInStock')}:</b> {product.quantity_in_stock}</div>
                      <div>{product.mostRecentPurchase ? new Date(product.mostRecentPurchase).toLocaleString() : t('noPurchases')}</div>
                      <div><b>{t('minimumAlertLevelNum')}:</b> {product.minimumAlertLevel}</div>
                      <div className="py-0 rounded text-xs font-semibold third-text w-max">
                        <b>{t('profit')}:</b> {(((product.selling_price - product.wholesale_price) * 100) / product.wholesale_price).toFixed(2)}%
                      </div>
                      <div><span className="small w-max">{t('code')}:{product.code}</span></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CART WITH OUTLETS */}
          <div id="goToCart" className='p-6 border-theme rounded z-99 secondary-colors grid grid-cols-1 lg:grid-cols-1 gap-3'>
            <h2 className="font-bold text-lg my-6">{t('sale.cart')}</h2>
            {cart.length === 0 && (
              <div className="py-2">
                <ShoppingCart size="70" className='opacity-50 my-4' />
                <p>{t('sale.emptyCart')}</p>
              </div>
            )}

            <div className="grid z-99 md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6">
                {cart.map((item) => {
                    const maxStock = item.quantity_in_stock ?? 0;

                    return (
                    <div
                        key={item.id}
                        className="p-4 border primary-colors rounded-xl shadow-sm hover:shadow-md transition"
                    >
                        {/* 🔹 اسم المنتج */}
                        <p className="font-semibold text-base">{item.name}</p>

                        {/* 🔹 السعر */}
                        <div className="flex items-center py-2 gap-2">
                        <Input
                            type="number"
                            min={0}
                            value={item.selling_price}
                            onChange={(e) => {
                            const value = Math.max(0, Number(e.target.value));
                            handlePriceChange(item.id, value);
                            }}
                            className="w-24 text-sm"
                        />

                        <span className="text-sm opacity-70">
                            x {item.quantity}
                        </span>
                        </div>

                        {/* 🔹 subtotal */}
                        <p className="text-sm font-medium">
                        {t("sale.subtotal")}:{" "}
                        <span className="font-bold">
                            ${(item.selling_price * item.quantity).toFixed(2)}
                        </span>
                        </p>

                        {/* 🔹 stock warning */}
                        {item.quantity > maxStock && (
                        <p className="text-red-500 text-xs mt-1">
                            {t("notEnoughStock") || "Not enough stock"}
                        </p>
                        )}

                        {/* 🔹 التحكم في الكمية */}
                        <div className="flex z-99 items-center py-3 gap-2">
                        <Input
                            type="number"
                            min={1}
                            max={maxStock}
                            value={item.quantity}
                            onChange={(e) => {
                            let value = Number(e.target.value);

                            if (value < 1) value = 1;
                            if (value > maxStock) value = maxStock;

                            updateQuantity(item.id, value);
                            }}
                            className="w-20 secondary-colors"
                        />

                        {/* ❌ delete */}
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                        >
                            <Trash2 size={14} />
                        </Button>
                        </div>

                        {/* 🔹 available stock */}
                        <p className="text-xs opacity-60">
                        {t("available") || "Available"}: {maxStock}
                        </p>
                    </div>
                    );
                })}
                </div>
            {cart.length > 0 && (
              <div className="z-99">
                <Input placeholder={t('sale.searchOutlet')} value={outletQuery} onChange={(e) => setOutletQuery(e.target.value)} className="w-full my-6 primary-colors py-3" />
                <div
                      ref={containerRef}
                      className="grid secondary-colors grid-cols-2 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto"
                    >
                      {filteredOutlets.map((outlet) => {
                        const isSelected = outletId === outlet.id;

                        return (
                          <Card
                            key={outlet.id}
                            onClick={() => {
                              if (outletId === outlet.id) {
                                setOutletId(null);
                                setOutletQuery("");
                              } else {
                                setOutletId(outlet.id);
                                setOutletQuery(outlet.name);
                              }
                            }}
                            className={`border cursor-pointer p-3 rounded-md ${
                              isSelected ? "third-colors" : "hover:shadow-md"
                            }`}
                          >
                            <CardTitle className="text-sm font-semibold">
                              {outlet.name}
                            </CardTitle>
                            {outlet.location && (
                              <p className="text-xs">{outlet.location}</p>
                            )}
                          </Card>
                        );
                      })}
                    </div>

                <h3 className="font-bold my-6">{t('sale.total')}: ${total.toFixed(2)}</h3>
                <Button onClick={handleCreditSale} className="third-colors w-max my-2">{t('sale.completeSale')}</Button>
              </div>
            )}
          </div>







            {/* History Table */}


          <Card id="goToTable" className="z-99 primary-colors mt-2 border-theme rounded">
                      <CardContent>
        
          
                        <Table className="border-theme my-2">
                          <TableHeader className="secondary-colors">
                            <TableRow>
                              <TableHead>{t("customer")}</TableHead>
                              <TableHead>{t("products")}</TableHead>
                              <TableHead>{t("total")}</TableHead>
                              <TableHead>{t("status")}</TableHead>
                              <TableHead>{t("date")}</TableHead>
                              <TableHead>{t("actions")}</TableHead>
                            </TableRow>
                          </TableHeader>
          
                          <TableBody>
                            {filteredSales.map((sale) => (
                              <TableRow key={sale.id}>
          
                                <TableCell>{sale.customerName}</TableCell>
          
                                <TableCell>
                                  {(sale.items || []).map((item: any, i: number) => (
                                    <div key={i}>
                                      {item?.product?.name || item?.productName || "Unknown"} × {item?.quantity ?? 0}
                                    </div>
                                  ))}
                                </TableCell>
          
                                <TableCell>${sale.totalAmount}</TableCell>
          
                                <TableCell>
                                  {sale.status === "pending" ? (
                                      <Badge className="bg-yellow-500">{t("pending")}</Badge>
                                    ) : (
                                      <Badge className="bg-green-600">{t("paid")}</Badge>
                                    )}
                                </TableCell>
          
                                <TableCell>
                                  {new Date(sale.createdAt).toLocaleString()}
                                </TableCell>
          
                                <TableCell className="flex gap-2">
          
                                  {sale.status === "pending" && (
                                    <Button
                                      onClick={() => markAsPaid(sale.id)}
                                      className="bg-green-600"
                                    >
                                      {t('pay')} ✔ 
                                    </Button>
                                  )}
          
                                  <Button className="secondary-colors" onClick={() => printReceipt(sale)}>
                                    🖨️ {t('print')}
                                  </Button>
          
                                </TableCell>
          
                              </TableRow>
                            ))}
          
                            {filteredSales.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                  {t('No data')}
                                </TableCell>
                              </TableRow>
                            )}
          
                          </TableBody>
                        </Table>
          
                      </CardContent>
                    </Card>



                    
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}