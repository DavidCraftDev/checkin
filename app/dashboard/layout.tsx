import SideNav from "../src/ui/sidenav";
import { Toaster } from "react-hot-toast";
import { getCurrentSession } from "../src/modules/auth/cookieManager";
import { redirect } from "next/navigation";
import StuhuTips from "./stuhu.component";

async function Layout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      <div className="w-full flex-none md:w-64">
        <SideNav user={user} administration={false} />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
      <Toaster position="bottom-center" />
      {user.id == "abc6143f-26a5-45d1-9d34-888db88cb08b" && Date.now() < 1744063200000 ? <StuhuTips /> : null}
    </div>
  );
}

export default Layout;