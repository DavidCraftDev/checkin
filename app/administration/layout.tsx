import SideNav from '@/components/sidenav';
import { Toaster } from "sonner";
import { getCurrentSession } from '@/lib/auth/cookieManager';
import { redirect } from 'next/navigation';

async function Layout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      <Toaster richColors />
      <div className="w-full flex-none md:w-64">
        <SideNav user={user} administration={true} />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}

export default Layout;