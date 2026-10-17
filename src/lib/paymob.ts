const PAYMOB_API = "https://accept.paymob.com/api";

export async function getAuthToken() {
  const res = await fetch(`${PAYMOB_API}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.PAYMOB_API_KEY,
    }),
  });

  const data = await res.json();
  return data.token;
}

export async function getPaymentKey(
  token: string,
  orderId: number,
  amount: number,
  integrationId: number
) {
  const res = await fetch(`${PAYMOB_API}/acceptance/payment_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount_cents: amount * 100,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA",
        email: "test@test.com",
        floor: "NA",
        first_name: "Test",
        street: "NA",
        building: "NA",
        phone_number: "+201000000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        last_name: "User",
        state: "NA",
      },
      currency: "EGP",
      integration_id: integrationId,
    }),
  });

  const data = await res.json();
  return data.token;
}


export async function createOrder(token: string, amount: number) {
  const res = await fetch(`${PAYMOB_API}/ecommerce/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount_cents: amount * 100,
      currency: "EGP",
      delivery_needed: false,
      items: [],
    }),
  });

  const data = await res.json();
  return data.id;
}