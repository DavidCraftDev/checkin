import { redirect } from "next/navigation";
import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";

async function Layout({ children }: { children: React.ReactNode }) {
  const { session } = await getCurrentSession();
  if (session) redirect("/dashboard");
  return (
    <>
      {children}
    </>
  );
}

export default Layout;