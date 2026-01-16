import { Attendances, Events, User } from "@prisma/client";

export interface AttendancePerUserPerEvent {
    attendance: Attendances,
    event: Events,
    eventUser: User
}

export interface AttendancePerEventPerUser {
    attendance: Attendances,
    user: User
}

export interface CreatedEventPerUser {
    event: Events,
    user: number
}