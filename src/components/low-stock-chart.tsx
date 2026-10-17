"use client"
import { useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export function LowStockChart({ products }: { products: any[] }) {

const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const direction = (lang as string) === "ar" ? "rtl" : "ltr";
  
  
  if (!products || products.length === 0) {
  return null;
}
  const data = products.map((p) => ({
    name: p.name,
    stock: p.quantity_in_stock,
    minimum: p.minimumAlertLevel,
  }))



  return (
        <Card className="primary-colors border-theme mb-6">
          <div dir={direction}>
      <CardHeader>
        <CardTitle className="secondary-colors">{t("lowStockAlertChart")}</CardTitle>
      </CardHeader>
          </div>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
        dataKey="name"
        tickLine={false}
        axisLine={false}
        tick={{ fill: 'var(--third-text-color)', fontSize: 12 }} // dark text
      />

      {/* Y Axis */}
      <YAxis
        tick={{ fill: 'var(--third-text-color)', fontSize: 12 }}
        tickLine={false}
        axisLine={false}
      />

      {/* Tooltip */}
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
        }}
        labelStyle={{ color: 'var(--third-text-color)', fontWeight: 600 }}
        itemStyle={{ color: 'var(--third-text-color)' }}
        cursor={{ fill: 'var(--third-text-color)' }}
      />

            <Bar
              dataKey="stock"
              name={t("dashboardStock")}
              fill="var(--third-background-color)"
              radius={4}
            />

            <Bar
              dataKey="minimum"
              name={t("dashboardMinimum")}
              fill="var(--third-background-color)"
              radius={4}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
    
  )
}
