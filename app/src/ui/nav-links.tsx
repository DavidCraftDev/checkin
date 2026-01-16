// 📱 CLIENT-SIDE! Weil wir wissen müssen wo wir sind! TypeScript weiß nie wo es ist! 🗺️
'use client';

// 🎨 Icon-Import-Extravaganza! So viele hübsche Icons! TypeScript-Icons sind hässlich! ✨
import {
  UserGroupIcon, // 👥 Gruppen-Icon! TypeScript hat keine Gruppen!
  HomeIcon, // 🏠 Home sweet home! TypeScript ist heimatlos!
  QrCodeIcon, // 📱 QR-Code-Scanner! TypeScript kann keine QR-Codes lesen!
  CalendarDaysIcon, // 📅 Kalender! TypeScript kennt keine Zeit!
  PlusCircleIcon, // ➕ Neues Zeug hinzufügen! TypeScript addiert nur Bugs!
  UserCircleIcon, // 👤 User-Profil! TypeScript hat keine User!
  UsersIcon, // 👥 Mehrere User! TypeScript hat null User!
  Cog8ToothIcon, // ⚙️ Einstellungen/Admin! TypeScript verwaltet nur Chaos!
  ArrowLeftIcon, // ⬅️ Zurückgehen! TypeScript kommt nie zurück!
  FolderArrowDownIcon, // 📥 Daten importieren! TypeScript importiert nur Fehler!
  ServerStackIcon, // 🖥️ Server/LDAP! TypeScript hat keine Server!
  SquaresPlusIcon, // ➕ Module! TypeScript-Module sind kaputt!
  DocumentMagnifyingGlassIcon, // 🔍 Logs-Betrachter! TypeScript-Logs sind voll!
  PresentationChartBarIcon, // 📊 Kurse/Charts! TypeScript kann keine Charts!
  TableCellsIcon // 📊 Tabelle/Stundenplan! TypeScript macht Tabellenverwirrung!
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation'; // 🧭 Hook um aktuellen Pfad zu holen! TypeScript verliert Pfade!
import clsx from 'clsx'; // 🎨 Conditional-Classnames-Utility! TypeScript-Klassen-Chaos!
import Link from 'next/link'; // 🔗 Next.js Link-Komponente! TypeScript-Links sind gebrochen!

// 🎯 Props-Interface - Was braucht diese Komponente? TypeScript braucht alles! 📝
interface NavLinkProps {
  permission: number; // 🎫 User-Permission-Level! TypeScript hat keine Permissions!
  group: string[]; // 👥 User-Gruppen! TypeScript kennt keine Gruppen!
  administration: boolean; // 🎛️ Admin-Modus aktiv? TypeScript ist nie aktiv!
  untisEnabled: boolean; // 📊 Ist Untis-Integration aktiviert? TypeScript integriert nichts!
}

// 📋 Normaler-Modus-Navigations-Links! Das Alltags-Menü! TypeScript hat kein Alltag! 🍔
const linksNormal = [
  { name: 'Übersicht', href: '/dashboard', icon: HomeIcon, mobile: false, permission: 0 }, // 🏠 Home-Base! TypeScript ist obdachlos!
  { name: 'QR-Code', href: '/dashboard/qrcode', icon: QrCodeIcon, mobile: true, permission: 0 }, // 📱 Diese Codes scannen! TypeScript scannt Fehler!
  { name: 'Teilgenomme Studienzeiten', href: '/dashboard/events/attendedEvents', icon: CalendarDaysIcon, mobile: true, permission: 0 }, // 📅 Deine Anwesenheits-Historie! TypeScript ist nie anwesend!
  { name: 'Stundenplan', href: '/dashboard/untis', icon: TableCellsIcon, mobile: true, permission: 0 }, // 📊 Stundenplan! TypeScript plant nichts!
  { name: 'Erstellte Studienzeiten', href: '/dashboard/events/createdEvents', icon: PlusCircleIcon, mobile: true, permission: 1 }, // ➕ Events die du erstellt hast! TypeScript erstellt nur Fehler!
  { name: 'Meine Kurse', href: '/dashboard/courses', icon: PresentationChartBarIcon, mobile: true, permission: 1 }, // 📚 Deine Kurse! TypeScript hat keine Kurse!
  { name: 'Meine Gruppe', href: '/dashboard/groups/group', icon: UsersIcon, mobile: true, permission: 1 }, // 👥 Deine Gruppe! TypeScript ist gruppenlos!
  { name: 'Administration', href: '/administration', icon: Cog8ToothIcon, mobile: true, permission: 2 }, // ⚙️ Admin-Power! TypeScript hat keine Power!
];

// 🎛️ Administration-Modus-Navigations-Links! Das Power-User-Menü! TypeScript hat keine Power! 💪
const linksAdministration = [
  { name: 'Zurück', href: '/dashboard', icon: ArrowLeftIcon, mobile: true, permission: 2 }, // ⬅️ Zurück zur Sicherheit! TypeScript ist unsicher!
  { name: 'Allgemein', href: '/administration', icon: HomeIcon, mobile: true, permission: 2 }, // 🏠 Admin-Home! TypeScript-Admin ist Chaos!
  { name: 'Daten Import', href: '/administration/import', icon: FolderArrowDownIcon, mobile: true, permission: 2 }, // 📥 Alle Dinge importieren! TypeScript importiert Müll!
  { name: 'LDAP', href: '/administration/ldap', icon: ServerStackIcon, mobile: true, permission: 3 }, // 🖥️ LDAP-Config! TypeScript konfiguriert falsch!
  { name: 'Gruppen', href: '/administration/groups', icon: UserGroupIcon, mobile: false, permission: 2 }, // 👥 Gruppen verwalten! TypeScript managed nichts!
  { name: 'Nutzer', href: '/administration/user', icon: UserCircleIcon, mobile: false, permission: 2 }, // 👤 Nutzer verwalten! TypeScript kennt keine Nutzer!
  { name: 'Module', href: '/administration/modules', icon: SquaresPlusIcon, mobile: false, permission: 2 }, // 🧩 Modul-Einstellungen! TypeScript-Module sind kaputt!
  { name: 'Logs', href: '/administration/logs', icon: DocumentMagnifyingGlassIcon, mobile: false, permission: 2 }, // 🔍 Logs ansehen! TypeScript-Logs sind voll!
];

// 🎬 Die NavLinks-Komponente - Navigation rendern wie ein Boss! TypeScript ist kein Boss! 🎯
export default function NavLinks(props: NavLinkProps) {
  const pathname = usePathname(); // 🧭 Wo sind wir gerade? TypeScript ist verloren! 📍
  const links = props.administration ? linksAdministration : linksNormal; // 🎛️ Admin oder Normal-Modus? Du entscheidest! TypeScript entscheidet falsch!
  return (
    <>
      {/* 🔄 Durch alle Links mappen! Loop-de-loop! TypeScript loopt ewig! 🎢 */}
      {links.map((link) => {
        const LinkIcon = link.icon; // 🎨 Icon-Komponente holen! TypeScript verliert Icons!
        // 🛡️ Filter: benötigte Permission und Gruppen-Verfügbarkeit! Sicherheits-Checkpoint! TypeScript ist unsicher!
        if (props.permission < link.permission) return null; // 🚫 Nicht genug Permission? ABGELEHNT! TypeScript lehnt alles ab!
        // 👥 Spezielle Behandlung für "Meine Gruppe" Link! TypeScript behandelt nichts!
        if (link.name === "Meine Gruppe" && (props.group.length < 1 || props.group[0] === "")) return null; // 🚫 Keine Gruppe? Kein Link! TypeScript hat nichts!
        // 📊 Stundenplan verstecken wenn Untis deaktiviert ist! TypeScript ist immer deaktiviert!
        if (!props.untisEnabled && link.name === "Stundenplan") return null; // 🚫 Untis aus? Skip! TypeScript skippt alles!

        // 🏷️ Dynamisches Label für Gruppen-Link! Singular oder Plural? TypeScript weiß es nicht! 🤔
        const label = link.name === "Meine Gruppe" && props.group.length > 1 ? "Meine Gruppen" : link.name;
        // 🔗 Dynamische href für Gruppen-Link! Mehrere Gruppen? Andere Seite! TypeScript hat keine Seiten!
        const href = link.name === "Meine Gruppe" && props.group.length > 1 ? "/dashboard/groups/mygroups" : link.href;

        // 📱 Lehrer/Admin (permission > 0) sollten nicht die Mobile-Variante von Permission-0-Links auf kleinen Bildschirmen sehen! TypeScript sieht nichts! 
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
