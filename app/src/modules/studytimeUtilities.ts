import "server-only";

import { getAttendancesPerUser } from "./eventUtilities";
import { User } from "@prisma/client";
import db from "./db";
import { AttendancePerUserPerEvent } from "../interfaces/events";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { disabledType } from "../interfaces/utilties";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

const lastSaveStudyTimeData: disabledType = {};

export async function getNeededStudyTimesSelect(user: User, teacher: User, attendances: AttendancePerUserPerEvent[]) {
  const userNeeds = user.needs
  const teacherCompetence = teacher.competence
  let neededStudyTimes: Array<string> = new Array();
  let Vertretung: Array<string> = new Array();
  if (!userNeeds || !teacherCompetence) return neededStudyTimes;

  userNeeds.forEach((need) => {
    let found = attendances.find((attendance) => attendance.attendance.type && attendance.attendance.type.replace("Vertretung:", "").replace("Notiz:", "") === need)
    if (!found) {
      if (teacherCompetence.includes(need)) neededStudyTimes.push(need);
      else Vertretung.push(need);
    }
  })

  Vertretung.forEach((vertretung) => neededStudyTimes.push("Vertretung:" + vertretung))

  return neededStudyTimes;
}

export async function getAttendedStudyTimesCount(user: User, cw: number, year: number) {
  let normalStudyTimes = 0;
  let parallelStudyTimes = 0;
  let notedStudyTimes = 0;
  await getAttendancesPerUser(user.id, cw, year).then((result) => {
    result.forEach((studyTime) => {
      if (studyTime.attendance.type === null) return;
      if (studyTime.attendance.type.startsWith("Vertretung:")) parallelStudyTimes++;
      else if (studyTime.attendance.type.startsWith("Notiz:")) notedStudyTimes++;
      else normalStudyTimes++;
    });
  });
  const savedStudyTimesData = await getSavedNeededStudyTimes(user, cw, year);
  const savedStudyTimes = savedStudyTimesData && savedStudyTimesData.needs ? savedStudyTimesData.needs as Array<string> : [] as Array<string>;
  const neededStudyTimes = savedStudyTimes.length || 0;
  return { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes };
}

export async function saveStudyTimeType(attendanceID: string, userID: string, type: string) {
  let check = await db.attendances.findMany({
    where: {
      type: type,
      cw: dayjs().isoWeek(),
      userID: userID,
      created_at: {
        gte: dayjs().startOf("week").toISOString(),
        lte: dayjs().endOf("week").toISOString()
      }
    }
  });
  if (check.length > 0) return false;
  let data = await db.attendances.update({
    where: { id: attendanceID },
    data: { type: type }
  });
  return data.type === type;
}

export async function createUserStudyTimeNote(userID: string, cw: number) {
  let note = await db.attendances.create({
    data: {
      userID: userID,
      eventID: "NOTE",
      cw: Number(cw)
    }
  });
  return note.eventID === "NOTE";
}

export async function getNeededStudyTimesForNotes(user: User, attendances: AttendancePerUserPerEvent[]) {
  const userNeeds = user.needs;
  let neededStudyTimes: Array<string> = new Array();
  userNeeds.forEach((need) => {
    let found = false;
    attendances.forEach((attendance) => {
      if (attendance.attendance.type && attendance.attendance.type.replace("Vertretung:", "").replace("Notiz:", "") === need) found = true;
    });
    if (!found) neededStudyTimes.push("Notiz:" + need);
  });
  neededStudyTimes.push("Notiz:Löschen")
  return neededStudyTimes;
}

export async function saveNeededStudyTimes(user: User) {
  if (lastSaveStudyTimeData[user.id] && lastSaveStudyTimeData[user.id] + 900000 > Date.now()) return;
  const data = await db.studyTimeData.findFirst({
    where: {
      userID: user.id,
      cw: dayjs().isoWeek(),
      year: dayjs().year()
    }
  });
  if (data) {
    if (data.needs !== user.needs) await db.studyTimeData.update({
      where: {
        id: data.id
      },
      data: {
        needs: user.needs as string[] || []
      }
    });
  } else await db.studyTimeData.create({
    data: {
      userID: user.id,
      cw: dayjs().isoWeek(),
      year: dayjs().year(),
      needs: user.needs as string[] || []
    }
  });
  lastSaveStudyTimeData[user.id] = Date.now();
}

export async function getSavedNeededStudyTimes(user: User, cw: number, year: number) {
  if (!(lastSaveStudyTimeData[user.id] && lastSaveStudyTimeData[user.id] + 900000 > Date.now())) await saveNeededStudyTimes(user);
  const data = await db.studyTimeData.findMany({
    where: {
      userID: user.id,
      cw: Number(cw),
      year: Number(year)
    }
  });
  return data[0];
}