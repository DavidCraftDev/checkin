'use client';

import {
  UserGroupIcon,
  HomeIcon,
  QrCodeIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';

interface NavLinkProps {
  permission: number;
  group: boolean;
}

const links = [
  { name: 'Übersicht', href: '/dashboard', icon: HomeIcon, mobile: false, permission: 0 },
  { name: 'QR-Code', href: '/dashboard/qrcode', icon: QrCodeIcon, mobile: true, permission: 0 },
  { name: 'Teilgenomme Veranstaltungen', href: '/dashboard/events/attendedEvents', icon: CalendarDaysIcon, mobile: true, permission: 0 },
  { name: 'Erstellte Veranstaltungen', href: '/dashboard/events/createdEvents', icon: PlusCircleIcon, mobile: true, permission: 1 },
  { name: 'Meine Gruppe', href: '/dashboard/groups/group', icon: UsersIcon, mobile: true, permission: 1 },
  { name: 'Gruppen', href: '/dashboard/groups/groups', icon: UserGroupIcon, mobile: false, permission: 2 },
  { name: 'Nutzer', href: '/dashboard/user', icon: UserCircleIcon, mobile: false, permission: 2 },
];

export default function NavLinks(props: NavLinkProps) {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        if (props.permission < link.permission) return;
        if (link.name === "Meine Gruppe" && !props.group) return;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium transition-all duration-200 transform active:scale-95 hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:px-4',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
                "hidden md:flex": !link.mobile,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
