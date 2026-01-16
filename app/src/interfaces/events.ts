// 📅 EVENT INTERFACES! Type definitions for events and attendances! 🎫
import { Attendances, Events, User } from "@prisma/client"; // 🎯 Prisma types!

// 📊 Attendance per user per event! Who attended what? 👥
export interface AttendancePerUserPerEvent {
    attendance: Attendances, // ✅ The attendance record!
    event: Events, // 🎉 The event itself!
    eventUser: User // 👤 The user who created the event! (Teacher)
}

// 📊 Attendance per event per user! Flip the perspective! 🔄
export interface AttendancePerEventPerUser {
    attendance: Attendances, // ✅ The attendance record!
    user: User // 👤 The user who attended!
}

// 🎪 Created event per user! Who made this event? 🤔
export interface CreatedEventPerUser {
    event: Events, // 🎉 The event!
    user: number // 👤 User count (how many attended)! 🔢
}