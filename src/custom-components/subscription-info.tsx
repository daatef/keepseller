'use client';

import { useEffect, useState } from 'react';
import { Cable, Power, Orbit } from "lucide-react";



interface User {
  plan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

export default function SubscriptionInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/subscription');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch: ${text}`);
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="py-6 text-gray-500 text-sm">
        Loading subscription...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-6 text-red-500 text-sm">
        Subscription info not available.
      </div>
    );
  }

  return (
    <section className="w-max">

      <div className="">
        {/* Plan */}
        <div className="flex flex-col relative md:flex-row md:items-center mt-2 py-2 md:gap-2 gap-3">
          <Orbit />
          <span className="w-60 font-semibold flex items-center gap-2">Plan</span>
          <span className="relative font-semibold">{user.plan || 'None'}</span>
        </div>
        {/* Start Date */}
        <div className="flex flex-col relative md:flex-row md:items-center mt-2 py-2 md:gap-2 gap-3">
          <Power />
          <span className="w-60 font-semibold flex items-center gap-2">Start Date</span>
          <span className="relative font-semibold">
            {user.subscriptionStart
              ? new Date(user.subscriptionStart).toLocaleString()
              : '—'}
          </span>
        </div>
          
          {/* End Date */}
        <div className="flex flex-col relative md:flex-row md:items-center mt-2 py-2 md:gap-2 gap-3">
          <Cable />
          <span className="w-60 font-semibold flex items-center gap-2">End Date</span>
          <span className="relative font-semibold">
            {user.plan === 'lifetime'
              ? 'Lifetime'
              : user.subscriptionEnd
              ? new Date(user.subscriptionEnd).toLocaleString()
              : '—'}
          </span>
        </div>
        

      </div>
    </section>
  );
}