import { User } from "@prisma/client";
import { AttendancePerUserPerEvent } from "./events";

export interface GroupMember {
    user: User;
    attendances: number;
}

export interface GroupMemberWithAttendanceData {
    user: User;
    attendances: AttendancePerUserPerEvent[];
}

export interface Groups {
    group: string;
    members: number;
}

export interface GroupsWithUserData {
    group: string;
    members: User[];
}