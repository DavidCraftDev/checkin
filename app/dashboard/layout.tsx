import SideNav from '@/app/src/ui/sidenav';
import { getSessionUser } from '../src/modules/authUtilities';
import { Toaster } from "react-hot-toast";

async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      <Toaster position="bottom-center" />
      <div className="w-full flex-none md:w-64">
        <SideNav user={user} />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}

export default Layout;