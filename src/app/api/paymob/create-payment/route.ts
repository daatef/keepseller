import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY!;
const CARD_INTEGRATION_ID = Number(process.env.PAYMOB_INTEGRATION_ID_CARD!);
const WALLET_INTEGRATION_ID = Number(process.env.PAYMOB_INTEGRATION_ID_WALLET!);
const IFRAME_ID = process.env.PAYMOB_IFRAME_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userId,
      plan,
      email,
      firstName,
      lastName,
      paymentMethod,
    } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 💰 Prices
    const prices: Record<string, number> = {
      monthly: 19900,
      yearly: 89900,
      lifetime: 200000,
    };

    const amount = prices[plan];

    if (!amount) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // 1️⃣ Save payment in DB
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: amount / 100,
        plan,
        status: "pending",
      },
    });

    // 2️⃣ Auth token
    const authRes = await fetch(
      "https://accept.paymob.com/api/auth/tokens",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
      }
    );

    const authData = await authRes.json();

    if (!authData?.token) {
      throw new Error("Auth failed");
    }

    // 3️⃣ Create order
    const orderRes = await fetch(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: authData.token,
          delivery_needed: false,
          amount_cents: amount,
          currency: "EGP",
          items: [],
        }),
      }
    );

    const orderData = await orderRes.json();

    if (!orderData?.id) {
      throw new Error("Order creation failed");
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymobId: String(orderData.id),
      },
    });

    // 4️⃣ Billing data
    const billing_data = {
      first_name: firstName || "User",
      last_name: lastName || "User",
      email: email || "test@test.com",
      phone_number: "01000000000",
      city: "Cairo",
      country: "EG",
      apartment: "NA",
      floor: "NA",
      street: "NA",
      building: "NA",
    };

    // 5️⃣ Payment key
    const paymentKeyRes = await fetch(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: authData.token,
          amount_cents: amount,
          expiration: 3600,
          order_id: orderData.id,
          billing_data,
          currency: "EGP",
          integration_id:
            paymentMethod === "wallet"
              ? WALLET_INTEGRATION_ID
              : CARD_INTEGRATION_ID,
        }),
      }
    );

    const paymentKeyData = await paymentKeyRes.json();

    if (!paymentKeyData?.token) {
      console.error(paymentKeyData);
      throw new Error("Payment key failed");
    }

    // =========================
    // 💳 CARD FLOW
    // =========================
    if (paymentMethod === "card") {
      return NextResponse.json({
        success: true,
        type: "card",
        iframeURL: `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentKeyData.token}`,
      });
    }

    // =========================
    // 📱 WALLET FLOW (FIXED)
    // =========================
    return NextResponse.json({
      success: true,
      type: "wallet",
      iframeURL: `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentKeyData.token}`,
    });

  } catch (err: any) {
    console.error("PAYMOB ERROR:", err);

    return NextResponse.json(
      {
        error: "Payment failed",
        details: err.message,
      },
      { status: 500 }
    );
  }
}