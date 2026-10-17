"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslation } from "@/src/lib/useTranslation"

export function SectionCards() {
  const { lang } = useParams()
  const t = useTranslation((lang as "en" | "ar") || "en")

  interface Winning {
    id: number
    winQuantity: number
    quantityOfProducts: number
    createdAt: string
  }

  interface Product {
  id: number;
  name: string;
  quantity_in_stock: number;
  wholesale_price: number;
  percentage_of_win: number;
  selling_price: number;
  image?: string; // <-- add optional image URL
}

  interface Pocket {
    moneyOnHand: number
  }

  interface Income {
    amount: number
  }

  interface Expense {
    amount: number
  }

  const [winnings, setWinnings] = useState<Winning[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [pocket, setPocket] = useState<Pocket | null>(null)
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const fetchWinnings = async () => {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      try {
        const res = await fetch(`/api/winning?${params.toString()}`)
        const data = await res.json()
        setWinnings(data)
      } catch (err) {
        console.error("Error fetching winnings:", err)
      }
    }

    fetchWinnings()
  }, [startDate, endDate])

  useEffect(() => {
    fetch("/api/products").then((res) => res.json()).then(setProducts)
    fetch("/api/pocket").then((res) => res.json()).then(setPocket)
    fetch("/api/income").then((res) => res.json()).then(setIncomes)
    fetch("/api/expense").then((res) => res.json()).then(setExpenses)
  }, [])

  const totalWinnings = winnings.reduce((acc, w) => acc + w.winQuantity, 0)
  const totalProducts = winnings.reduce((acc, w) => acc + w.quantityOfProducts, 0)
  const totalQuantityProductsOnStore = products.reduce(
    (acc, product) => acc + (product.quantity_in_stock || 0),
    0
  )
  const growthRate =
    totalQuantityProductsOnStore > 0
      ? (totalProducts / (totalProducts + totalQuantityProductsOnStore)) * 100
      : 0

  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0)
  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const moneyOnHand = pocket?.moneyOnHand ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-4 @5xl/main:grid-cols-4">
      <Card className="secondary-colors border-theme card-gradient z-20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums break-all w-full">
            {totalWinnings}
          </CardTitle>
          <CardDescription className="font-bold">{t("sectionCards.totalRevenue")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {t("sectionCards.totalRevenueExtra")}
        </div>
      </Card>

      <Card className="secondary-colors border-theme card-gradient z-20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums break-all w-full">
            {totalProducts}
          </CardTitle>
          <CardDescription className="font-bold">{t("sectionCards.totalSoldProducts")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {t("sectionCards.totalSoldProductsExtra")}
        </div>
      </Card>

      <Card className="secondary-colors border-theme card-gradient z-20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums break-all w-full">
            {totalQuantityProductsOnStore}
          </CardTitle>
          <CardDescription className="font-bold">{t("sectionCards.totalProductsInStore")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {t("sectionCards.totalProductsInStoreExtra")}
        </div>
      </Card>

      <Card className="secondary-colors border-theme card-gradient z-20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums break-all w-full">
            {growthRate.toFixed(2)}%
          </CardTitle>
          <CardDescription className="font-bold">{t("sectionCards.growthRate")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {t("sectionCards.growthRateExtra")}
        </div>
      </Card>

      <Card className="secondary-colors border-theme card-gradient z-20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums break-all w-full">
            ${Number(moneyOnHand).toFixed(2)}
          </CardTitle>
          <CardDescription className="font-bold">{t("sectionCards.moneyOnHand")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {t("sectionCards.moneyOnHandExtra")}
        </div>
      </Card>

      <Card className="secondary-colors border-theme card-gradient z-20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums break-all w-full">
            ${Number(totalIncome).toFixed(2)}
          </CardTitle>
          <CardDescription className="font-bold">{t("sectionCards.totalIncome")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {t("sectionCards.totalIncomeExtra")}
        </div>
      </Card>

      <Card className="secondary-colors border-theme card-gradient z-20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums break-words">
            ${Number(totalExpense).toFixed(2)}
          </CardTitle>
          <CardDescription className="font-bold">{t("sectionCards.totalExpenses")}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4 text-sm text-muted-foreground">
          {t("sectionCards.totalExpensesExtra")}
        </div>
      </Card>
    </div>
  )
}
