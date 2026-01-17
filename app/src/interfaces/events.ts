import { Attendance, Event, User } from "@prisma/client";

export interface AttendancePerUserPerEvent {
    attendance: Attendance,
    event: Event,
    eventUser: User
}

export interface AttendancePerEventPerUser {
    attendance: Attendance,
    user: User
}

export interface CreatedEventPerUser {
    event: Event,
    user: number
}
