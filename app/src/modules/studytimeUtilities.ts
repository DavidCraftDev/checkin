import moment from "moment";
import { getAttendancesPerUser } from "./eventUtilities";
import { getUserPerID } from "./userUtilities";
import { Prisma } from "@prisma/client";

export function isStudyTimeEnabled() {
  let result: boolean = false;
  if (process.env.study_time === "true") {
    result = true;
  }
  return result;
}

export async function getNeededStudyTimesSelect(userID: string, teacherID: string) {
  const userData = await getUserPerID(userID);
  const teacherData = await getUserPerID(teacherID);
  const attendances = await getAttendancesPerUser(userID, moment().week(), moment().year());
  let neededStudyTimes: Array<String> = [];
  let vertretung: Array<String> = [];
  function addVertretung() {
    vertretung.forEach((vertretung: any) => {
      neededStudyTimes.push("Vertretung:" + vertretung);
    });
  }
  userData.needs.forEach((need: any) => {
    let found = false;
    attendances.forEach((attendance: any) => {
      if (attendance.type === need) {
        found = true;
      }
    });
    if (!found) {
      let foundTeacher = false;
      teacherData.competence.forEach((competence: any) => {
        if (competence === need) {
          foundTeacher = true;
        }
      });
      if (foundTeacher) {
        neededStudyTimes.push(need);
      } else {
        vertretung.push(need);
      }
    }
    addVertretung();
  })
  return neededStudyTimes;
}

export async function getNeededStudyTimes(userID: string) {
  const user = await getUserPerID(userID);
  if (!user.id) return [] as Prisma.JsonArray;
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
      } else if (studyTime.startsWith("noted:")) {
        notedStudyTimes++;
      } else {
        normalStudyTimes++;
      }
    });
  });
  let neededStudyTimes: number = await getNeededStudyTimes(userID).then((result) => result.length);
  attendedStudyTimesCount.push({
    normal: normalStudyTimes,
    parallel: parallelStudyTimes,
    noted: notedStudyTimes,
    needed: neededStudyTimes
  })
  return attendedStudyTimesCount[0];
}