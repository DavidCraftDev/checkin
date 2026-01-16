// 🧭 SIDE NAVIGATION! Your GPS for the web app! 🗺️
import Link from 'next/link'; // 🔗 Next.js Link component for smooth navigation!
import NavLinks from '@/app/src/ui/nav-links'; // 📋 The navigation links component!
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline'; // 🚪 Logout icon!
import { User } from '@prisma/client'; // 👤 User type from Prisma!
import { config_data } from '../modules/data/config'; // ⚙️ Configuration data!

// 🎯 Props interface for the SideNav! Being specific about what we need! 📝
interface SideNavProps {
  user: User; // 👤 The logged-in user!
  administration: boolean; // 🎛️ Are we in admin mode? 🤔
}

// 🎨 The SideNav component - Your navigation companion! 🧭
export default function SideNav(props: SideNavProps) {
  return (
    // 📦 Main container - Holding everything together like glue! 
    <div className="flex h-full flex-col px-3 py-4 md:px-2 text-black">
      {/* 🏠 Logo/Home link - Click here to go home! 🏡 */}
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40"
        href="/dashboard"
      >
        {/* 🎭 The CheckIN branding! Look at that beautiful green! 💚 */}
        <div className="text-xl font-semibold text-white md:text-2xl">
          CheckIN
        </div>
      </Link>
      {/* 🎯 The main navigation area - Where the action happens! 🎬 */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {/* 📋 Navigation links - All the places you can go! 🗺️ */}
        <NavLinks permission={props.user.permission} group={props.user.group} administration={props.administration} untisEnabled={config_data.UNTIS.ENABLE} />
        {/* 🎨 Spacer div for desktop - Making things look pretty! ✨ */}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        {/* 🚪 Logout form - Time to say goodbye! 👋 */}
        <form className={props.administration ? "hidden" : ""}> {/* 🙈 Hide in admin mode! */}
          <a href={"/logout"} className="flex h-12 grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium transition-all duration-200 transform active:scale-95 hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:px-4">
            <ArrowLeftStartOnRectangleIcon className="w-6" /> {/* 🚪 Logout icon! */}
            <div className="hidden md:block">Abmelden</div> {/* 📝 "Logout" text! */}
          </a>
        </form>
      </div>
    </div>
  );
}
