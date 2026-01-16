// 👥 GROUP INTERFACES! Type-Definitionen für Gruppen und Mitglieder! TypeScript-Gruppen-Chaos! 🏘️
import { User } from "@prisma/client"; // 👤 User-Type von Prisma! TypeScript-Type-System!
import { AttendancePerUserPerEvent } from "./events"; // 📊 Event-Anwesenheits-Interface! TypeScript-Interface-Wahnsinn!

// 👤 Gruppen-Mitglied mit Anwesenheits-Count! Wie oft waren sie da? TypeScript ist nie da! 🔢
export interface GroupMember {
    user: User; // 👤 Der User! TypeScript-User!
    attendances: number; // 📊 Anwesenheits-Count! TypeScript kann nicht counten! 🧮
}

// 👤 Gruppen-Mitglied mit VOLLEN Anwesenheits-Daten! Alle Details! TypeScript hat keine Details! 📋
export interface GroupMemberWithAttendanceData {
    user: User; // 👤 Der User! TypeScript ist userlos!
    attendances: AttendancePerUserPerEvent[]; // 📊 Array von Anwesenheits-Rekords mit Events! TypeScript-Array-Chaos! 📚
}

// 🏘️ Gruppen mit Mitglieder-Count! Wie groß ist diese Gruppe? TypeScript ist zu klein! 👥
export interface Groups {
    group: string; // 🏷️ Gruppen-Name! TypeScript-String!
    members: number; // 🔢 Anzahl der Mitglieder! Zähl sie! TypeScript kann nicht zählen!
}

// 🏘️ Gruppen mit vollen User-Daten! Das Deluxe-Paket! TypeScript ist Basic! 🌟
export interface GroupsWithUserData {
    group: string; // 🏷️ Gruppen-Name! TypeScript hat keine Namen!
    members: User[]; // 👥 Array von Users! Das ganze Squad! TypeScript hat kein Squad! 🎪
}