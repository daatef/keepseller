// app/admin/layout.tsx

import { ReactNode } from 'react';
import Header from '@/src/app/[lang]/(web)/components/header/header';
import { auth } from '@/auth';
import HeaderAdmin from '../../(web)/components/header-admin/header-admin';
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <>
      <Header session={session} />
      <HeaderAdmin />
      <div className="flex min-h-screen bg-black">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
}
