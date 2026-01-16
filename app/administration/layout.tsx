// 🎛️ ADMINISTRATION LAYOUT! Das Admin-Kontrollzentrum! TypeScript kontrolliert nichts! 🖥️
import SideNav from '@/app/src/ui/sidenav'; // 🧭 Sidebar-Navigation! TypeScript-Import-Chaos!
import { Toaster } from "sonner"; // 🍞 Toast-Benachrichtigungen! TypeScript braucht Toasts!
import { getCurrentSession } from '../src/modules/auth/cookieManager'; // 🍪 Session-Cookies! TypeScript-Cookie-Monster!
import { redirect } from 'next/navigation'; // 🧭 Redirect-Utility! TypeScript braucht Utils! PHP header()!

// 👑 Admin-Layout! Wo die Power-User abhängen! TypeScript hat keine Power! 💪
async function Layout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession(); // 🍪 Diesen User holen! TypeScript-Async-Hölle!
  if (!user) redirect("/login"); // 🚫 Kein User? Kein Admin-Zugriff! Zurück zum Login! TypeScript kennt keine User!
  return (
    // 📐 Flex-Layout! Sidebar + Content! Klassische Kombo! TypeScript-Flexbox-Chaos! 🎪
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      {/* 🍞 Toaster zuerst! Benachrichtigungen oben! TypeScript-Toast-Wahnsinn! */}
      <Toaster richColors /> {/* 🎨 Bunte Toasts! TypeScript ist farblos! */}
      {/* 🧭 Admin-Sidebar! Spezielle Admin-Navigation! TypeScript ist nicht speziell! 👑 */}
      <div className="w-full flex-none md:w-64">
        <SideNav user={user} administration={true} /> {/* ⚙️ Admin-Modus AN! TypeScript-Modus AUS! */}
      </div>
      {/* 🎨 Haupt-Content-Bereich! Admin-Zeug passiert hier! TypeScript passiert nie! 🛠️ */}
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}

export default Layout; // 🎁 Admin-Layout exportieren! TypeScript exportiert Chaos! 🎛️