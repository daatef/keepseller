"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart"
import { useParams } from "next/navigation"
import { useTranslation } from "@/src/lib/useTranslation"

interface MonthlyWinnings {
  month: string // e.g. "2024-06"
  totalWinning: number
}

export function ChartBarLabel() {
  const [data, setData] = useState<MonthlyWinnings[]>([])

  const { lang } = useParams()
  const t = useTranslation((lang as "en" | "ar") || "en")
  const direction = (lang as string) === "ar" ? "rtl" : "ltr"

  const chartConfig: ChartConfig = {
    totalWinning: {
      label: t("barChart.label"),
      color: "var(--primary-chart-bar-color)",
    },
  }

  useEffect(() => {
    async function fetchWinnings() {
      const res = await fetch("/api/winning/monthly")
      const json = await res.json()
      setData(json)
    }
    fetchWinnings()
  }, [])

  return (
    <Card className="card-gradient border-theme" dir={direction}>
      <CardHeader>
        <CardTitle>{t("barChart.title")}</CardTitle>
        <CardDescription>{t("barChart.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            margin={{ top: 20 }}
            width={500}
            height={300}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(`${value}-01`)
                return date.toLocaleDateString(lang as string, {
                  month: "short",
                  year: "2-digit",
                })
              }}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Bar
              dataKey="totalWinning"
              fill="var(--primary-chart-bar-color)"
              radius={8}
            >
              <LabelList
                dataKey="totalWinning"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {t("barChart.trend")} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {t("barChart.footer")}
        </div>
      </CardFooter>
    </Card>
  )
}
