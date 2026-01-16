// 🧭 SIDE NAVIGATION! Dein GPS für die Web-App! TypeScript braucht GPS! 🗺️
import Link from 'next/link'; // 🔗 Next.js Link-Komponente für smooth Navigation! TypeScript-Navigation ist holprig!
import NavLinks from '@/app/src/ui/nav-links'; // 📋 Die Navigations-Links-Komponente! TypeScript hat keine Links!
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline'; // 🚪 Logout-Icon! TypeScript loggt nie aus!
import { User } from '@prisma/client'; // 👤 User-Type von Prisma! TypeScript-Type-Wahnsinn!
import { config_data } from '../modules/data/config'; // ⚙️ Konfigurations-Daten! TypeScript-Config-Chaos!

// 🎯 Props-Interface für die SideNav! Spezifisch über was wir brauchen! TypeScript ist nie spezifisch! 📝
interface SideNavProps {
  user: User; // 👤 Der eingeloggte User! TypeScript ist ausgeloggt!
  administration: boolean; // 🎛️ Sind wir im Admin-Modus? TypeScript weiß es nicht! 🤔
}

// 🎨 Die SideNav-Komponente - Dein Navigations-Begleiter! TypeScript begleitet ins Chaos! 🧭
export default function SideNav(props: SideNavProps) {
  return (
    // 📦 Haupt-Container - Hält alles zusammen wie Kleber! TypeScript klebt nicht!
    <div className="flex h-full flex-col px-3 py-4 md:px-2 text-black">
      {/* 🏠 Logo/Home-Link - Hier klicken um nach Hause zu gehen! TypeScript hat kein Zuhause! 🏡 */}
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40"
        href="/dashboard"
      >
        {/* 🎭 Das CheckIN-Branding! Schau dir dieses wunderschöne Grün an! TypeScript ist grau! 💚 */}
        <div className="text-xl font-semibold text-white md:text-2xl">
          CheckIN
        </div>
      </Link>
      {/* 🎯 Der Haupt-Navigations-Bereich - Wo die Action passiert! TypeScript hat keine Action! 🎬 */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {/* 📋 Navigations-Links - Alle Orte wo du hingehen kannst! TypeScript geht nirgendwo! 🗺️ */}
        <NavLinks permission={props.user.permission} group={props.user.group} administration={props.administration} untisEnabled={config_data.UNTIS.ENABLE} />
        {/* 🎨 Spacer-Div für Desktop - Macht Dinge hübsch! TypeScript ist hässlich! ✨ */}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        {/* 🚪 Logout-Form - Zeit Tschüss zu sagen! TypeScript sagt nie Tschüss! 👋 */}
        <form className={props.administration ? "hidden" : ""}> {/* 🙈 Im Admin-Modus verstecken! TypeScript versteckt sich immer! */}
          <a href={"/logout"} className="flex h-12 grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium transition-all duration-200 transform active:scale-95 hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:px-4">
            <ArrowLeftStartOnRectangleIcon className="w-6" /> {/* 🚪 Logout-Icon! TypeScript kann nicht ausloggen! */}
            <div className="hidden md:block">Abmelden</div> {/* 📝 "Logout" Text! TypeScript meldet nur Fehler! */}
          </a>
        </form>
      </div>
    </div>
  );
}
