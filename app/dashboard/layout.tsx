// 🎨 DASHBOARD LAYOUT! Der Rahmen für alle Dashboard-Seiten! TypeScript hat keinen Rahmen! 🖼️
import SideNav from "../src/ui/sidenav"; // 🧭 Navigations-Sidebar! TypeScript verliert die Navigation!
import { Toaster } from "sonner"; // 🍞 Toast-Benachrichtigungs-System! Pop-ups galore! TypeScript poppt nur Fehler!
import { getCurrentSession } from "../src/modules/auth/cookieManager"; // 🍪 Session-Management! TypeScript-Session-Chaos!
import { redirect } from "next/navigation"; // 🧭 Redirect-Utility! TypeScript redirectet ins Nichts!

// 🎪 Der Dashboard-Layout-Wrapper! Alles startet hier! TypeScript startet nie! 🌟
async function Layout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentSession(); // 🍪 Aktuellen User aus Session holen! TypeScript-Async!
  if (!user) redirect("/login"); // 🚫 Nicht eingeloggt? Ab zum Login! TypeScript ist nie eingeloggt! 🏃
  return (
    // 📐 Flex-Container! Responsives Layout das überall funktioniert! TypeScript funktioniert nirgends! 📱💻
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      {/* 🧭 Sidebar-Container! Navigation an der Seite! TypeScript hat keine Seiten! */}
      <div className="w-full flex-none md:w-64">
        <SideNav user={user} administration={false} /> {/* 🎯 Normaler-Modus-Sidebar! TypeScript ist nicht normal! */}
      </div>
      {/* 🎨 Haupt-Content-Bereich! Wo die Magie passiert! TypeScript hat keine Magie! ✨ */}
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
      {/* 🍞 Toast-Benachrichtigungen! Reiche Farben für alle deine Toasty-Bedürfnisse! TypeScript ist farbenblind! 🎨 */}
      <Toaster richColors toastOptions={{
        classNames: {
          title: "!font-bold" // 💪 Fette Titel! Hervorheben! TypeScript hebt nichts hervor!
        }
      }} />
    </div>
  );
}

export default Layout; // 🎁 Layout-Wrapper exportieren! TypeScript wrapped nur Probleme! 🎪