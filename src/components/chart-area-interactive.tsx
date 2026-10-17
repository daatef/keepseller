"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis
} from "recharts";
import { useIsMobile } from "@/src/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/src/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/src/components/ui/toggle-group";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";

interface Winning {
  id: number;
  winQuantity: number;
  quantityOfProducts: number;
  createdAt: string;
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  quantity: number;
}

export function ChartWinningsInteractive() {
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");
  const direction = (lang as string) === "ar" ? "rtl" : "ltr";

  const chartConfig: ChartConfig = {
    revenue: {
      label: t("winningsChart.revenueLabel"),
      color: "var(--primary-chart-color)"
    },
    quantity: {
      label: t("winningsChart.quantityLabel"),
      color: "var(--secondary-chart-color)"
    }
  };

  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("90d");
  const [winningsData, setWinningsData] = React.useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/winning");
        const data: Winning[] = await res.json();

        const formatted: ChartDataPoint[] = data.map((item) => ({
          date: item.createdAt.split("T")[0],
          revenue: parseFloat(item.winQuantity.toString()),
          quantity: item.quantityOfProducts
        }));

        setWinningsData(formatted);
      } catch (err) {
        console.error("Failed to fetch winnings data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date();
    let days = 90;
    if (timeRange === "30d") days = 30;
    if (timeRange === "7d") days = 7;

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - days);

    return winningsData.filter((item) => new Date(item.date) >= startDate);
  }, [winningsData, timeRange]);

  return (
    <div dir={direction}>
      <div className="mb-5 p-0">
        <CardTitle>{t("winningsChart.title")}</CardTitle>
        <CardDescription>{t("winningsChart.description")}</CardDescription>
      </div>

      <Card className="@container/card border-theme card-gradient z-20">
        <CardHeader className={`${direction === "rtl" ? "text-right" : "text-left"}`}>
          <CardTitle>{t("winningsChart.title")}</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              {t("winningsChart.rangeFull")}
            </span>
            <span className="@[540px]/card:hidden">
              {t("winningsChart.rangeShort")}
            </span>
          </CardDescription>

          <CardAction className="card-gradient">
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(val) => val && setTimeRange(val as "90d" | "30d" | "7d")}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d">{t("winningsChart.last90Days")}</ToggleGroupItem>
              <ToggleGroupItem value="30d">{t("winningsChart.last30Days")}</ToggleGroupItem>
              <ToggleGroupItem value="7d">{t("winningsChart.last7Days")}</ToggleGroupItem>
            </ToggleGroup>

            <Select value={timeRange} onValueChange={(val) => setTimeRange(val as "90d" | "30d" | "7d")}>
              <SelectTrigger className="flex w-40 @[767px]/card:hidden" aria-label="Select a value">
                <SelectValue placeholder={t("winningsChart.last90Days")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl w-max primary-colors">
                <SelectItem value="90d" className="rounded-lg">
                  {t("winningsChart.last90Days")}
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  {t("winningsChart.last30Days")}
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  {t("winningsChart.last7Days")}
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>

        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div dir={direction}>
            <ChartContainer
              config={chartConfig}
              className={`aspect-auto h-[250px] w-full ${direction === "rtl" ? "rtl-chart" : ""}`}
            >
              <AreaChart data={filteredData}>
                <defs className="primary-text">
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-chart-color)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--primary-chart-color)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillQuantity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary-chart-color)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--secondary-chart-color)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <CartesianGrid className="primary-colors" vertical={false} />

                <XAxis
                  dataKey="date"
                  className="primary-colors"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(lang as string, {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className="primary-text"
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString(lang as string, {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      indicator="dot"
                    />
                  }
                />

                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--primary-chart-color)"
                  stackId="a"
                />
                <Area
                  dataKey="quantity"
                  type="monotone"
                  fill="url(#fillQuantity)"
                  stroke="var(--secondary-chart-color)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
