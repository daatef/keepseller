
import { UserTable } from './components/UserTable';
import { DashboardSummary } from './components/DashboardSummary';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AdminUser } from '@/types/user';
import SendMessage from "./components/Messages";
import toast from "react-hot-toast";

interface UserTableProps {
  users: AdminUser[];
}
export default async function AdminPage() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!session?.user?.email || session.user.email !== adminEmail) {
    return redirect(`/en/not-found`);
  }

  const users = await prisma.user.findMany();


  // Map to AdminUser for safe client-side use
  const safeUsers: AdminUser[] = users.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,

  isSubscribed: u.isSubscribed,
  subscriptionStatus: u.subscriptionStatus ?? "pending",

  plan: u.plan ?? "monthly",
  subscriptionStart: u.subscriptionStart?.toISOString() ?? null,
  subscriptionEnd: u.subscriptionEnd?.toISOString() ?? null,

  businessName: u.businessName ?? null,
  mobileNumber: u.mobileNumber ?? null,
  about: u.about ?? null,
  businessAddress: u.businessAddress ?? null,

  loginCount: u.loginCount ?? 0,
  createdAt: u.createdAt.toISOString(),
}));



  return (
    <div>
     
    <div className="bg-black">
      <div className="fixed z-1 ltr:right-0 rtl:left-0 bottom-0 h-50 w-50 rounded-full bg-black opacity-70 blur-3xl"></div>
      <div className="fixed z-1 right-0 top-1/2 h-250 w-250 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black opacity-40 blur-2xl"></div>
      <div className='z-30 relative'>
        <div>
        <h1 className="text-2xl font-bold py-6 ">Notifications System</h1>

        <SendMessage />
      </div>
      <h1 className="text-2xl font-bold py-6 ">Registered and subscribed Users Count</h1>

      <DashboardSummary users={safeUsers} />
      </div>
      <div className='z-30 relative'>
      <h1 className="text-2xl font-bold ">All Registered Users</h1>
      </div>
      <div className='z-30 relative'>
      <UserTable users={safeUsers} />
      </div>

      
    </div>
    </div>

  );
}
