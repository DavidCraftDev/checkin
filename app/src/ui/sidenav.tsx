"use client";

import Link from 'next/link';
import NavLinks from '@/app/src/ui/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { User } from '@prisma/client';

interface SideNavProps {
  user: User;
}

export default function SideNav(props: SideNavProps) {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 text-black">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40"
        href="/dashboard"
      >
        <div className="text-xl font-semibold text-white md:text-2xl">
          CheckIN
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks permission={props.user.permission} group={props.user.group} />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form>
          <a href={"/logout"} className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium transition-all duration-200 transform active:scale-95 hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:px-4">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Abmelden</div>
          </a>
        </form>
      </div>
    </div>
  );
}
