'use client';

import {
  UserGroupIcon,
  HomeIcon,
  QrCodeIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UsersIcon,
  Cog8ToothIcon,
  ArrowLeftIcon,
  FolderArrowDownIcon,
  ServerStackIcon,
  SquaresPlusIcon,
  DocumentMagnifyingGlassIcon,
  PresentationChartBarIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';

interface NavLinkProps {
  permission: number;
  group: string[];
  administration: boolean;
  untisEnabled: boolean;
}

const linksNormal = [
  { name: 'Übersicht', href: '/dashboard', icon: HomeIcon, mobile: false, permission: 0 },
  { name: 'QR-Code', href: '/dashboard/qrcode', icon: QrCodeIcon, mobile: true, permission: 0 },
  { name: 'Teilgenomme Studienzeiten', href: '/dashboard/events/attendedEvents', icon: CalendarDaysIcon, mobile: true, permission: 0 },
  { name: 'Stundenplan', href: '/dashboard/untis', icon: TableCellsIcon, mobile: true, permission: 0 },
  { name: 'Erstellte Studienzeiten', href: '/dashboard/events/createdEvents', icon: PlusCircleIcon, mobile: true, permission: 1 },
  { name: 'Meine Kurse', href: '/dashboard/courses', icon: PresentationChartBarIcon, mobile: true, permission: 1 },
  { name: 'Meine Gruppe', href: '/dashboard/groups/group', icon: UsersIcon, mobile: true, permission: 1 },
  { name: 'Administration', href: '/administration', icon: Cog8ToothIcon, mobile: true, permission: 2 },
];

const linksAdministration = [
  { name: 'Zurück', href: '/dashboard', icon: ArrowLeftIcon, mobile: true, permission: 2 },
  { name: 'Allgemein', href: '/administration', icon: HomeIcon, mobile: true, permission: 2 },
  { name: 'Daten Import', href: '/administration/import', icon: FolderArrowDownIcon, mobile: true, permission: 2 },
  { name: 'LDAP', href: '/administration/ldap', icon: ServerStackIcon, mobile: true, permission: 3 },
  { name: 'Gruppen', href: '/administration/groups', icon: UserGroupIcon, mobile: false, permission: 2 },
  { name: 'Nutzer', href: '/administration/user', icon: UserCircleIcon, mobile: false, permission: 2 },
  { name: 'Module', href: '/administration/modules', icon: SquaresPlusIcon, mobile: false, permission: 2 },
  { name: 'Logs', href: '/administration/logs', icon: DocumentMagnifyingGlassIcon, mobile: false, permission: 2 },
];

export default function NavLinks(props: NavLinkProps) {
  const pathname = usePathname();
  const links = props.administration ? linksAdministration : linksNormal;
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        // Filter: required permission and group availability
        if (props.permission < link.permission) return null;
        if (link.name === "Meine Gruppe" && (props.group.length < 1 || props.group[0] === "")) return null;
        if (!props.untisEnabled && link.name === "Stundenplan") return null;

        const label = link.name === "Meine Gruppe" && props.group.length > 1 ? "Meine Gruppen" : link.name;
        const href = link.name === "Meine Gruppe" && props.group.length > 1 ? "/dashboard/groups/mygroups" : link.href;

        // Teachers/Admin (permission > 0) should not see the mobile variant of permission 0 links on small screens
        const isMobileVisible = link.mobile && (props.permission === 0 || link.permission !== 0);
        return (
          <Link
            key={label}
            href={href}
            className={clsx(
              'flex h-12 grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium transition-all duration-200 md:flex-none md:justify-start md:px-4 border border-transparent',
              {
                'bg-blue-50 text-blue-600 border-blue-100 font-semibold shadow-sm': pathname === href,
                'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900': pathname !== href,
                "hidden md:flex": !isMobileVisible,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{label}</p>
          </Link>
        );
      })}
    </>
  );
}
