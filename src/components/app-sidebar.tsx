"use client";

import * as React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Undo2,
  PackagePlus,
  PackageX,
  Search,
  AlertCircle,
  BookmarkPlus,
  Receipt,
  Building2,
  Wallet,
  HandCoins,
  Banknote,
  History,
  UserPlus,
  Settings,
  DnaOff,
  BanknoteArrowUp,
  SquareUserRound
} from "lucide-react";
import { NavDocuments } from "@/src/components/nav-documents";
import { NavMain } from "@/src/components/nav-main";
import { NavSecondary } from "@/src/components/nav-secondary";
import { NavUser } from "@/src/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";

import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";

import { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";

export type NavItem = {
  title?: string;
  name?: string;
  url: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { lang } = useParams();
  const locale = lang === "en" || lang === "ar" || lang === "fr" || lang === "de" ? lang : "en";
  const t = useTranslation(locale);

  const navMain: NavItem[] = [
    {
      title: t("navDashboard"),
      url: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
  ];

  const navSecondary: NavItem[] = [
    {
      title: t("navImportProducts"),
      url: `/${locale}/products`,
      icon: Boxes,
    },
    {
      title: t("navSellProduct"),
      url: `/${locale}/sell-product`,
      icon: ShoppingCart,
    },
    {
      title: t("navReturnSellProduct"),
      url: `/${locale}/return-sale`,
      icon: Undo2,
    },
    {
      title: t("navPurchaseProduct"),
      url: `/${locale}/purchase-product`,
      icon: PackagePlus,
    },
    {
      title: t("navReturnPurchaseProduct"),
      url: `/${locale}/return-purchase`,
      icon: PackageX,
    },
    
    {
      title: t("creditSales"),
      url: `/${locale}/credit-sales`,
      icon: DnaOff,
    },
    
    {
      title: t("creditCustomers"),
      url: `/${locale}/credit-customers`,
      icon: SquareUserRound,
    },
    {
      title: t("creditTransactions"),
      url: `/${locale}/credit-transactions`,
      icon: BanknoteArrowUp,
    },
    {
      title: t("navSearchProducts"),
      url: `/${locale}/search-items`,
      icon: Search,
    },
    {
      title: t("navLowStock"),
      url: `/${locale}/low-stock`,
      icon: AlertCircle,
    },
    {
      title: t("navBookingProduct"),
      url: `/${locale}/book-product`,
      icon: BookmarkPlus,
    },
    {
      title: t("ReceiptHistory"),
      url: `/${locale}/receipt-history`,
      icon: Receipt ,
    },
  ];

  const navDocs: NavItem[] = [
     {
       name: t("navAddSupplier"),
       url: `/${locale}/suppliers`,
      icon: UserPlus,
    },
    {
      name: t("navAddOutlets"),
      url: `/${locale}/add-outlet`,
      icon: Building2,
    },
    {
      name: t("navIncomeAndExpense"),
      url: `/${locale}/income-expense`,
      icon: Wallet,
    },
    {
      name: t("navMoneyOnHand"),
      url: `/${locale}/pocket-page`,
      icon: HandCoins,
    },
    {
      name: t("navWinnings"),
      url: `/${locale}/winnings-page`,
      icon: Banknote,
    },
    {
      name: t("navTransactionHistory"),
      url: `/${locale}/history`,
      icon: History,
    },
    {
      name: t("sidebarSettingsPage"),
      url: `/${locale}/sidebar-settings-page`,
      icon: Settings,
    }
  ];




interface Setting {
  businessName: string;
  businessLogoUrl: string;
  theme: string;
  language: string;
}
const [setting, setSetting] = useState<Setting | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setSetting(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  if (!setting) return null;

 



  return (

    <Sidebar className="relative app-sidebar primary-colors z-999999" collapsible="offcanvas" {...props}>
      <SidebarHeader className="sidebar-header primary-colors">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="third-colors data-[slot=sidebar-menu-button]:!p-1.5 h-max"
            >
              <a href={`/${locale}`} className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Logo"
                  width={50}
                  height={100}
                />
                
                
                <span className="text-xs font-semibold leading-tight logo-title-font rtl:text-right ltr:text-left">
                  KeepSeller
                  <br />
                  POS and
                  <br />
                  Management
                  <br />
                  System
                </span>
              </a>
            </SidebarMenuButton>

          </SidebarMenuItem>
         <div className="flex flex-col text-center mx-auto p-5 rounded-xl secondary-colors">
          {/* Logo */}
          {setting?.businessLogoUrl && (
            <img
              src={setting.businessLogoUrl}
              alt="Logo"
              width={70}
              height={160}
              className="mx-auto"
            />
          )}

          {/* Business Name */}
          {setting?.businessName && (
            <span className="text-md font-semibold mt-2 font-bold leading-tight rtl:text-right ltr:text-left">
              {setting.businessName}
            </span>
          )}
        </div>

        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="primary-colors">
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mb-auto" />
        <NavDocuments items={navDocs} />
      </SidebarContent>

      <SidebarFooter className="primary-colors">
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
