import { redirect } from "next/navigation";
import { getCurrentSession } from "../src/modules/auth/cookieManager";

async function Layout({ children }: { children: React.ReactNode }) {
  const { session } = await getCurrentSession();
  if (session) redirect("/dashboard");
  return (
    <div>
      {children}
    </div>
  );
}

export default Layout;