// 🎛️ ADMINISTRATION LAYOUT! The admin control center! 🖥️
import SideNav from '@/app/src/ui/sidenav'; // 🧭 Sidebar navigation!
import { Toaster } from "sonner"; // 🍞 Toast notifications!
import { getCurrentSession } from '../src/modules/auth/cookieManager'; // 🍪 Session cookies!
import { redirect } from 'next/navigation'; // 🧭 Redirect utility!

// 👑 Admin layout! Where the power users hang out! 💪
async function Layout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession(); // 🍪 Get that user!
  if (!user) redirect("/login"); // 🚫 No user? No admin access! Back to login!
  return (
    // 📐 Flex layout! Sidebar + content! Classic combo! 🎪
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      {/* 🍞 Toaster first! Notifications on top! (Well, not literally...) */}
      <Toaster richColors /> {/* 🎨 Colorful toasts! */}
      {/* 🧭 Admin sidebar! Special admin navigation! 👑 */}
      <div className="w-full flex-none md:w-64">
        <SideNav user={user} administration={true} /> {/* ⚙️ Admin mode ON! */}
      </div>
      {/* 🎨 Main content area! Admin stuff happens here! 🛠️ */}
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}

export default Layout; // 🎁 Export the admin layout! 🎛️