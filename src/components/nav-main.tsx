"use client";

import { IconCirclePlusFilled } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";
import { NavItem } from "@/types/nav";

export function NavMain({ items }: { items: NavItem[] }) {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <a href={`/${lang}/sell-product`}>
              <div className="quick-sell-btn w-max flex items-center third-colors px-4 py-2 rounded rtl:flex-row-reverse">
                <IconCirclePlusFilled className="third-text mr-2 rtl:mr-2 rtl:ml-0" />
                <span className="third-text font-bold">
                  {t("quicksellbutton")}
                </span>
              </div>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
