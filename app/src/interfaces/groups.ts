// 👥 GROUP INTERFACES! Type definitions for groups and members! 🏘️
import { User } from "@prisma/client"; // 👤 User type from Prisma!
import { AttendancePerUserPerEvent } from "./events"; // 📊 Event attendance interface!

// 👤 Group member with attendance count! How many times did they show up? 🔢
export interface GroupMember {
    user: User; // 👤 The user!
    attendances: number; // 📊 Attendance count! 🧮
}

// 👤 Group member with FULL attendance data! All the details! 📋
export interface GroupMemberWithAttendanceData {
    user: User; // 👤 The user!
    attendances: AttendancePerUserPerEvent[]; // 📊 Array of attendance records with events! 📚
}

// 🏘️ Groups with member count! How big is this group? 👥
export interface Groups {
    group: string; // 🏷️ Group name!
    members: number; // 🔢 Number of members! Count 'em! 
}

// 🏘️ Groups with full user data! The deluxe package! 🌟
export interface GroupsWithUserData {
    group: string; // 🏷️ Group name!
    members: User[]; // 👥 Array of users! The whole squad! 🎪
}