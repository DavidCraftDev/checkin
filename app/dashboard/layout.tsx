// 🎨 DASHBOARD LAYOUT! The frame for all dashboard pages! 🖼️
import SideNav from "../src/ui/sidenav"; // 🧭 Navigation sidebar!
import { Toaster } from "sonner"; // 🍞 Toast notification system! Pop-ups galore!
import { getCurrentSession } from "../src/modules/auth/cookieManager"; // 🍪 Session management!
import { redirect } from "next/navigation"; // 🧭 Redirect utility!

// 🎪 The dashboard layout wrapper! Everything starts here! 🌟
async function Layout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession(); // 🍪 Get current user from session!
  if (!user) redirect("/login"); // 🚫 Not logged in? Off to login you go! 🏃
  return (
    // 📐 Flex container! Responsive layout that works everywhere! 📱💻
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      {/* 🧭 Sidebar container! Navigation on the side! */}
      <div className="w-full flex-none md:w-64">
        <SideNav user={user} administration={false} /> {/* 🎯 Regular mode sidebar! */}
      </div>
      {/* 🎨 Main content area! Where the magic happens! ✨ */}
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
      {/* 🍞 Toast notifications! Rich colors for all your toasty needs! 🎨 */}
      <Toaster richColors toastOptions={{
        classNames: {
          title: "!font-bold" // 💪 Bold titles! Make it stand out!
        }
      }} />
    </div>
  );
}

export default Layout; // 🎁 Export the layout wrapper! 🎪