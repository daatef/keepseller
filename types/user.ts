// /types/user.ts

export type SubscriptionStatus =
  | "active"
  | "expired"
  | "pending"
  | "cancelled";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;

  isSubscribed: boolean;
  subscriptionStatus: SubscriptionStatus;

  plan?: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;

  businessName?: string | null;
  mobileNumber?: string | null;
  about?: string | null;
  businessAddress?: string | null;

  loginCount: number;
  createdAt: string;
}