"use server"

import moment from "moment";
import { getAttendancesPerUser } from "./eventUtilities";
import { getUserPerID } from "./userUtilities";
import { Prisma } from "@prisma/client";
import db from "./db";

export async function getNeededStudyTimesSelect(userID: string, teacherID: string) {
  const userData = await getUserPerID(userID);
  const teacherData = await getUserPerID(teacherID);
  const attendances = await getAttendancesPerUser(userID, moment().week(), moment().year());
  if (!userData.needs) return [];
  let neededStudyTimes: Array<string> = [];
  let vertretung: Array<string> = [];

  function addVertretung() {
    vertretung.forEach((vertretung: string) => {
      neededStudyTimes.push("parallel:" + vertretung);
    });
  }

  userData.needs.forEach((need: any) => {
    let found = attendances.find((attendance: any) => attendance.attendance.type && attendance.attendance.type.replace("parallel:", "").replace("note:", "") === need)
    if (!found) {
      if (teacherData.competence.includes(need)) {
        neededStudyTimes.push(need);
      } else {
        vertretung.push(need);
      }
    }
  })

  addVertretung();
  return neededStudyTimes;
}

export async function getNeededStudyTimes(userID: string) {
  const user = await getUserPerID(userID);
  if (!user.id) return [] as Prisma.JsonArray;
  if (!user.needs) return [] as Prisma.JsonArray;
  return user.needs as Prisma.JsonArray;
}

export async function getAttendedStudyTimes(userID: string, cw: number, year: number) {
  const attendances = await getAttendancesPerUser(userID, cw, year);
  let attendedStudyTimes: Array<String> = [];
  attendances.forEach((attendance: any) => {
    if (attendance.event.studyTime) {
      if (attendance.attendance.type) {
        attendedStudyTimes.push(attendance.attendance.type);
      }
    }
  });
  return attendedStudyTimes;
}

export async function getAttendedStudyTimesCount(userID: any, cw: number, year: number) {
  let attendedStudyTimesCount = new Array();
  let normalStudyTimes: number = 0;
  let parallelStudyTimes: number = 0;
  let notedStudyTimes: number = 0;
  await getAttendedStudyTimes(userID, cw, year).then((result) => {
    result.forEach((studyTime: String) => {
      if (studyTime.startsWith("parallel:")) {
        parallelStudyTimes++;
      } else if (studyTime.startsWith("note:")) {
        notedStudyTimes++;
      } else {
        normalStudyTimes++;
      }
    });
  });
  let neededStudyTimes = await getSavedNeededStudyTimes(userID, cw, year).then((result) => result.needs) as Array<String> || [];
  attendedStudyTimesCount.push({
    normal: normalStudyTimes,
    parallel: parallelStudyTimes,
    noted: notedStudyTimes,
    needed: neededStudyTimes.length || 0
  })
  return attendedStudyTimesCount[0];
}

export async function saveStudyTimeType(attendanceID: string, type: string) {
  let check = await db.attendance.findMany({
    where: {
      type: type,
      cw: moment().week(),
      created_at: {
        gte: moment().startOf("week").toISOString(),
        lte: moment().endOf("week").toISOString()
      }
    }
  });
  if (check.length > 0) return "error";
  let data = await db.attendance.update({
    where: { id: attendanceID },
    data: { type: type }
  });
  if (data.type === type) return "success";
  return "error";
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
  if (note.eventID === "NOTE") return "success";
  return "error";
}

export async function getNeededStudyTimesForNotes(userID: string) {
  const user = await getUserPerID(userID);
  const attendances = await getAttendancesPerUser(userID, moment().week(), moment().year());
  let neededStudyTimes: Array<string> = [];
  if (!user.needs) return [];
  user.needs.forEach((need: any) => {
    let found = false;
    attendances.forEach((attendance: any) => {
      if (attendance.attendance.type && attendance.attendance.type.replace("parallel:", "").replace("note:", "") === need) {
        found = true;
      }
    });
    if (!found) {
      neededStudyTimes.push("note:" + need);
    }
  });
  return neededStudyTimes;
}

export async function getMissingStudyTimes(userID: string) {
  const neededStudyTimes = await getNeededStudyTimes(userID);
  const attendedStudyTimes = await getAttendedStudyTimes(userID, moment().week(), moment().year());
  let missingStudyTimes: Array<string> = [];
  neededStudyTimes.forEach((neededStudyTime: any) => {
    if (!attendedStudyTimes.find((attendedStudyTime: any) => attendedStudyTime.replace("parallel:", "").replace("note:", "") === neededStudyTime)) {
      missingStudyTimes.push(neededStudyTime);
    }
  });
  return missingStudyTimes;
}

export async function saveNeededStudyTimes(user: any) {
  const count = await db.studyTimeData.count({
    where: {
      userID: user.id,
      cw: moment().week(),
      year: moment().year()
    }
  });
  if (!user.needs) return "noNeeds";
  let data
  if (count > 0) {
    data = await db.studyTimeData.updateMany({
      where: {
        AND: [
          { userID: user.id },
          { cw: moment().week() },
          { year: moment().year() }
        ]
      },
      data: {
        needs: user.needs
      }
    });
  } else {
    data = await db.studyTimeData.create({
      data: {
        userID: user.id,
        cw: moment().week(),
        year: moment().year(),
        needs: user.needs as Prisma.JsonArray
      }
    });
  }
  return data;
}

export async function getSavedNeededStudyTimes(userID: string, cw: number, year: number) {
  const data = await db.studyTimeData.findMany({
    where: {
      userID: userID,
      cw: Number(cw),
      year: Number(year)
    }
  });
  return data[0] || [] as any;
}

export async function getSavedMissingStudyTimes(userID: string, cw: number, year: number) {
  const savedData = await getSavedNeededStudyTimes(userID, cw, year);
  let missingStudyTimes: Array<string> = [];
  if (savedData && savedData.needs) {
    const attendances = await getAttendancesPerUser(userID, cw, year);
    const needs = savedData.needs as Array<string>;
    needs.forEach((neededStudyTime: any) => {
      if (!attendances.find((attendance: any) => attendance.attendance.type && attendance.attendance.type.replace("parallel:", "").replace("note:", "") === neededStudyTime)) {
        missingStudyTimes.push(neededStudyTime);
      }
    });
  }
  return missingStudyTimes;
}