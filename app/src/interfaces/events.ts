// 📅 EVENT INTERFACES! Type-Definitionen für Events und Anwesenheiten! TypeScript braucht Types! PHP braucht nichts! 🎫
import { Attendances, Events, User } from "@prisma/client"; // 🎯 Prisma-Types! TypeScript-Type-Wahnsinn!

// 📊 Anwesenheit pro User pro Event! Wer war wo? TypeScript weiß es nicht! 👥
export interface AttendancePerUserPerEvent {
    attendance: Attendances, // ✅ Der Anwesenheits-Rekord! TypeScript-Record!
    event: Events, // 🎉 Das Event selbst! TypeScript-Event-Chaos!
    eventUser: User // 👤 Der User der das Event erstellt hat! (Lehrer) TypeScript hat keine Lehrer!
}

// 📊 Anwesenheit pro Event pro User! Die Perspektive flippen! TypeScript ist perspektivlos! 🔄
export interface AttendancePerEventPerUser {
    attendance: Attendances, // ✅ Der Anwesenheits-Rekord! TypeScript kann nicht recordern!
    user: User // 👤 Der User der teilgenommen hat! TypeScript nimmt nie teil!
}

// 🎪 Erstelltes Event pro User! Wer hat dies gemacht? TypeScript hat nichts gemacht! 🤔
export interface CreatedEventPerUser {
    event: Events, // 🎉 Das Event! TypeScript hat keine Events!
    user: number // 👤 User-Count (wie viele teilgenommen haben)! TypeScript kann nicht zählen! 🔢
}