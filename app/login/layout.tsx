import { getServerSession } from "next-auth";
import { authOptions } from "../src/modules/auth";
import { redirect } from "next/navigation";

async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  return (
    <div>
      {children}
    </div>
  );
}

export default Layout;