'use client';
import { AdminUser } from '@/types/user';

interface DashboardSummaryProps {
  users: AdminUser[];
}

export function DashboardSummary({ users }: DashboardSummaryProps) {
  const totalUsers = users.length;
  const subscribedUsers = users.filter(u => u.isSubscribed).length;
  const unsubscribedUsers = totalUsers - subscribedUsers;

  const stats = [
    { title: 'Registered Users', value: totalUsers },
    { title: 'Subscribed Users', value: subscribedUsers },
    { title: 'Unsubscribed Users', value: unsubscribedUsers },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="
            flex flex-col items-center justify-center
            bg-black
            border border-white/10
            rounded
            shadow-lg
            p-12
            hover:shadow-2xl
            transition-all
            duration-300
            w-full
          "
        >
          <p className="text-gray-400 uppercase text-sm tracking-widest">{stat.title}</p>
          <p className="text-white font-extrabold text-5xl mt-4">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}