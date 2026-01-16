// 📱 CLIENT-SIDE! Because we need to know where we are! 🗺️
'use client';

// 🎨 Icon import extravaganza! So many pretty icons! ✨
import {
  UserGroupIcon, // 👥 Group icon!
  HomeIcon, // 🏠 Home sweet home!
  QrCodeIcon, // 📱 QR code scanner!
  CalendarDaysIcon, // 📅 Calendar!
  PlusCircleIcon, // ➕ Add new stuff!
  UserCircleIcon, // 👤 User profile!
  UsersIcon, // 👥 Multiple users!
  Cog8ToothIcon, // ⚙️ Settings/Admin!
  ArrowLeftIcon, // ⬅️ Go back!
  FolderArrowDownIcon, // 📥 Import data!
  ServerStackIcon, // 🖥️ Server/LDAP!
  SquaresPlusIcon, // ➕ Modules!
  DocumentMagnifyingGlassIcon, // 🔍 Logs viewer!
  PresentationChartBarIcon, // 📊 Courses/Charts!
  TableCellsIcon // 📊 Table/Timetable!
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation'; // 🧭 Hook to get current path!
import clsx from 'clsx'; // 🎨 Conditional classnames utility!
import Link from 'next/link'; // 🔗 Next.js Link component!

// 🎯 Props interface - What does this component need? 📝
interface NavLinkProps {
  permission: number; // 🎫 User permission level!
  group: string[]; // 👥 User's groups!
  administration: boolean; // 🎛️ Admin mode active?
  untisEnabled: boolean; // 📊 Is Untis integration enabled?
}

// 📋 Normal mode navigation links! The everyday menu! 🍔
const linksNormal = [
  { name: 'Übersicht', href: '/dashboard', icon: HomeIcon, mobile: false, permission: 0 }, // 🏠 Home base!
  { name: 'QR-Code', href: '/dashboard/qrcode', icon: QrCodeIcon, mobile: true, permission: 0 }, // 📱 Scan those codes!
  { name: 'Teilgenomme Studienzeiten', href: '/dashboard/events/attendedEvents', icon: CalendarDaysIcon, mobile: true, permission: 0 }, // 📅 Your attendance history!
  { name: 'Stundenplan', href: '/dashboard/untis', icon: TableCellsIcon, mobile: true, permission: 0 }, // 📊 Timetable!
  { name: 'Erstellte Studienzeiten', href: '/dashboard/events/createdEvents', icon: PlusCircleIcon, mobile: true, permission: 1 }, // ➕ Events you created!
  { name: 'Meine Kurse', href: '/dashboard/courses', icon: PresentationChartBarIcon, mobile: true, permission: 1 }, // 📚 Your courses!
  { name: 'Meine Gruppe', href: '/dashboard/groups/group', icon: UsersIcon, mobile: true, permission: 1 }, // 👥 Your group!
  { name: 'Administration', href: '/administration', icon: Cog8ToothIcon, mobile: true, permission: 2 }, // ⚙️ Admin power!
];

// 🎛️ Administration mode navigation links! The power user menu! 💪
const linksAdministration = [
  { name: 'Zurück', href: '/dashboard', icon: ArrowLeftIcon, mobile: true, permission: 2 }, // ⬅️ Back to safety!
  { name: 'Allgemein', href: '/administration', icon: HomeIcon, mobile: true, permission: 2 }, // 🏠 Admin home!
  { name: 'Daten Import', href: '/administration/import', icon: FolderArrowDownIcon, mobile: true, permission: 2 }, // 📥 Import all the things!
  { name: 'LDAP', href: '/administration/ldap', icon: ServerStackIcon, mobile: true, permission: 3 }, // 🖥️ LDAP config!
  { name: 'Gruppen', href: '/administration/groups', icon: UserGroupIcon, mobile: false, permission: 2 }, // 👥 Manage groups!
  { name: 'Nutzer', href: '/administration/user', icon: UserCircleIcon, mobile: false, permission: 2 }, // 👤 Manage users!
  { name: 'Module', href: '/administration/modules', icon: SquaresPlusIcon, mobile: false, permission: 2 }, // 🧩 Module settings!
  { name: 'Logs', href: '/administration/logs', icon: DocumentMagnifyingGlassIcon, mobile: false, permission: 2 }, // 🔍 View logs!
];

// 🎬 The NavLinks component - Rendering navigation like a boss! 🎯
export default function NavLinks(props: NavLinkProps) {
  const pathname = usePathname(); // 🧭 Where are we right now? 📍
  const links = props.administration ? linksAdministration : linksNormal; // 🎛️ Admin or normal mode? You decide!
  return (
    <>
      {/* 🔄 Map through all the links! Loop-de-loop! 🎢 */}
      {links.map((link) => {
        const LinkIcon = link.icon; // 🎨 Get the icon component!
        // 🛡️ Filter: required permission and group availability! Security checkpoint! 
        if (props.permission < link.permission) return null; // 🚫 Not enough permission? DENIED!
        // 👥 Special handling for "My Group" link! 
        if (link.name === "Meine Gruppe" && (props.group.length < 1 || props.group[0] === "")) return null; // 🚫 No group? No link!
        // 📊 Hide timetable if Untis is disabled!
        if (!props.untisEnabled && link.name === "Stundenplan") return null; // 🚫 Untis off? Skip!

        // 🏷️ Dynamic label for group link! Singular or plural? 🤔
        const label = link.name === "Meine Gruppe" && props.group.length > 1 ? "Meine Gruppen" : link.name;
        // 🔗 Dynamic href for group link! Multiple groups? Different page! 
        const href = link.name === "Meine Gruppe" && props.group.length > 1 ? "/dashboard/groups/mygroups" : link.href;

        // 📱 Teachers/Admin (permission > 0) should not see the mobile variant of permission 0 links on small screens! 
        const isMobileVisible = link.mobile && (props.permission === 0 || link.permission !== 0);
        return (
          // 🔗 The actual link! Click me! 🖱️
          <Link
            key={label}
            href={href}
            className={clsx(
              'flex h-12 grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium transition-all duration-200 transform active:scale-95 hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:px-4',
              {
                'bg-sky-100 text-blue-600': pathname === href, // ✅ Current page? Highlight it! 🎯
                "hidden md:flex": !isMobileVisible, // 📱 Mobile visibility control!
              },
            )}
          >
            <LinkIcon className="w-6" /> {/* 🎨 The pretty icon! */}
            <p className="hidden md:block">{label}</p> {/* 📝 The link text! Desktop only! */}
          </Link>
        );
      })}
    </>
  );
}
