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
import { propagateServerField } from 'next/dist/server/lib/render-server';

const links = [
  { name: 'Übersicht', href: '/dashboard', icon: HomeIcon, mobile: false, permission: 0 },
  { name: 'QR-Code', href: '/dashboard/qrcode', icon: QrCodeIcon, mobile: true, permission: 0 },
  { name: 'Teilgenomme Veranstalltungen', href: '/dashboard/events/attendedEvents', icon: CalendarDaysIcon, mobile: true, permission: 0 },
  { name: 'Erstellte Veranstalltungen', href: '/dashboard/events/createdEvents', icon: PlusCircleIcon, mobile: true, permission: 1 },
  { name: 'Meine Gruppe', href: '/dashboard/groups/group', icon: UsersIcon, mobile: true, permission: 1 },
  { name: 'Gruppen', href: '/dashboard/groups/groups', icon: UserGroupIcon, mobile: false, permission: 2 },
  { name: 'Nutzer', href: '/dashboard/user', icon: UserCircleIcon, mobile: false, permission: 2 },
];

export default function NavLinks(props: any) {
const permission: number = props.permission;
const group: boolean = props.group;
const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        if(permission < link.permission) return;
        if(link.name === "Meine Gruppe" && !group) return;
        return (
          <a
            key={link.name}
            href={link.href}
            className={clsx(
                'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                {
                    'bg-sky-100 text-blue-600': pathname === link.href,
                    "hidden md:flex": !link.mobile,
                },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </a>
        );
      })}
    </>
  );
}
