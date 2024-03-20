import SideNav from '@/app/src/ui/sidenav';
import { getSesessionUser } from '../src/modules/authUtilities';
 
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getSesessionUser();
  const permission = user.permission;
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      <div className="w-full flex-none md:w-64">
        <SideNav permission={permission}/>
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}