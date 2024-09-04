import "server-only";

import moment from "moment";
import { getAttendancesPerUser } from "./eventUtilities";
import { getUserPerID } from "./userUtilities";
import { Prisma, User } from "@prisma/client";
import db from "./db";

export async function getNeededStudyTimesSelect(userID: string, teacherID: string) {
  const userNeeds = await getNeededStudyTimes(userID);
  const teacherData = await getUserPerID(teacherID);
  const attendances = await getAttendancesPerUser(userID, moment().isoWeek(), moment().year());
  let neededStudyTimes: Array<string> = new Array();
  let parallel: Array<string> = new Array();
  if (!userNeeds || !teacherData.competence) return neededStudyTimes;

  userNeeds.forEach((need: string) => {
    let found = attendances.find((attendance) => attendance.attendance.type && attendance.attendance.type.replace("parallel:", "").replace("note:", "") === need)
    if (!found) {
      teacherData.competence = teacherData.competence as Array<string>;
      if (teacherData.competence.includes(need)) neededStudyTimes.push(need);
      else parallel.push(need);
    }
  })

  parallel.forEach((vertretung: string) => neededStudyTimes.push("parallel:" + vertretung))

  return neededStudyTimes;
}

export async function getNeededStudyTimes(userID: string) {
  const user = await getUserPerID(userID);
  if (!user.id) return [] as Array<string>;
  if (!user.needs) return [] as Array<string>;
  return user.needs as Array<string>;
}

export async function getAttendedStudyTimes(userID: string, cw: number, year: number) {
  const attendances = await getAttendancesPerUser(userID, cw, year);
  let attendedStudyTimes: Array<string> = [];
  attendances.forEach((attendance) => { if (attendance.event.studyTime && attendance.attendance.type) attendedStudyTimes.push(attendance.attendance.type) });
  return attendedStudyTimes;
}

export async function getAttendedStudyTimesCount(userID: string, cw: number, year: number) {
  let normalStudyTimes = 0;
  let parallelStudyTimes = 0;
  let notedStudyTimes = 0;
  await getAttendedStudyTimes(userID, cw, year).then((result) => {
    result.forEach((studyTime: string) => {
      if (studyTime.startsWith("parallel:")) parallelStudyTimes++;
      else if (studyTime.startsWith("note:")) notedStudyTimes++;
      else normalStudyTimes++;
    });
  });
  const savedStudyTimesData = await getSavedNeededStudyTimes(userID, cw, year);
  const savedStudyTimes = savedStudyTimesData && savedStudyTimesData.needs ? savedStudyTimesData.needs as Array<string> : [] as Array<string>;
  const neededStudyTimes = savedStudyTimes.length || 0;
  return { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes };
}

export async function saveStudyTimeType(attendanceID: string, type: string) {
  let check = await db.attendance.findMany({
    where: {
      type: type,
      cw: moment().isoWeek(),
      created_at: {
        gte: moment().startOf("week").toISOString(),
        lte: moment().endOf("week").toISOString()
      }
    }
  });
  if (check.length > 0) return false;
  let data = await db.attendance.update({
    where: { id: attendanceID },
    data: { type: type }
  });
  return data.type === type;
}

export async function createUserStudyTimeNote(userID: string, cw: number) {
  let note = await db.attendance.create({
    data: {
      userID: userID,
      eventID: "NOTE",
      cw: Number(cw),
      teacherNote: "- Studienzeit Notiz -"
    }
  });
  return note.eventID === "NOTE";
}

export async function getNeededStudyTimesForNotes(userID: string) {
  const userNeeds = await getNeededStudyTimes(userID);
  const attendances = await getAttendancesPerUser(userID, moment().isoWeek(), moment().year());
  let neededStudyTimes: Array<string> = new Array();
  userNeeds.forEach((need) => {
    let found = false;
    attendances.forEach((attendance) => {
      if (attendance.attendance.type && attendance.attendance.type.replace("parallel:", "").replace("note:", "") === need) found = true;
    });
    if (!found) neededStudyTimes.push("note:" + need);
  });
  neededStudyTimes.push("note:delete")
  return neededStudyTimes;
}

export async function getMissingStudyTimes(userID: string) {
  const neededStudyTimes = await getNeededStudyTimes(userID);
  const attendedStudyTimes = await getAttendedStudyTimes(userID, moment().isoWeek(), moment().year());
  let missingStudyTimes: Array<string> = new Array();
  neededStudyTimes.forEach((neededStudyTime) => { if (!attendedStudyTimes.find((attendedStudyTime) => attendedStudyTime.replace("parallel:", "").replace("note:", "") === neededStudyTime)) missingStudyTimes.push(neededStudyTime) });
  return missingStudyTimes;
}

export async function saveNeededStudyTimes(user: User) {
  const count = await db.studyTimeData.count({
    where: {
      userID: user.id,
      cw: moment().isoWeek(),
      year: moment().year()
    }
  });
  if (!user.needs) return
  if (count > 0) await db.studyTimeData.updateMany({
    where: {
      AND: [
        { userID: user.id },
        { cw: moment().isoWeek() },
        { year: moment().year() }
      ]
    },
    data: {
      needs: user.needs
    }
  });
  else await db.studyTimeData.create({
    data: {
      userID: user.id,
      cw: moment().isoWeek(),
      year: moment().year(),
      needs: user.needs as string[]
    }
  });
}

export async function getSavedNeededStudyTimes(userID: string, cw: number, year: number) {
  const data = await db.studyTimeData.findMany({
    where: {
      userID: userID,
      cw: Number(cw),
      year: Number(year)
    }
  });
  return data[0];
}

export async function getSavedMissingStudyTimes(userID: string, cw: number, year: number) {
  const savedData = await getSavedNeededStudyTimes(userID, cw, year);
  let missingStudyTimes: Array<string> = new Array();
  if (savedData && savedData.needs) {
    const attendances = await getAttendancesPerUser(userID, cw, year);
    const needs = savedData.needs as Array<string>;
    needs.forEach((neededStudyTime) => { if (!attendances.find((attendance) => attendance.attendance.type && attendance.attendance.type.replace("parallel:", "").replace("note:", "") === neededStudyTime)) missingStudyTimes.push(neededStudyTime) });
  }
  return missingStudyTimes;
}