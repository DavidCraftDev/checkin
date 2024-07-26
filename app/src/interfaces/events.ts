import { Attendance, Events, User } from "@prisma/client";

export interface AttendancePerUserPerEvent {
    attendance: Attendance,
    event: Events,
    eventUser: User
}

export interface AttendancePerEventPerUser {
    attendance: Attendance,
    user: User
}

export interface CreatedEventPerUser {
    event: Events,
    user: number
}