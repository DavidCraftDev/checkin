import "server-only";

import { getAttendancesPerUser } from "./eventUtilities";
import { Attendances, StudyTimeData, User } from "@prisma/client";
import db from "./db";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { disabledType } from "../interfaces/utilties";
import { getUserPerID } from "./userUtilities";
import { redirect } from "next/navigation";
import { getSessionUser } from "./auth/cookieManager";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

const lastSaveStudyTimeData: disabledType = {};

export async function getAttendedStudyTimesCount(user: User, cw: number, year: number) {
  let normalStudyTimes = 0;
  let parallelStudyTimes = 0;
  let notedStudyTimes = 0;
  let trafficLightCount = 0;
  let total = 0;
  await getAttendancesPerUser(user.id, cw, year).then((result) => {
    total = result.length;
    result.forEach((studyTime) => {
      if (studyTime.attendance.type === null) return;
      if (studyTime.attendance.type.startsWith("Vertretung:")) parallelStudyTimes++;
      else if (studyTime.attendance.type.startsWith("Notiz:")) notedStudyTimes++;
      else normalStudyTimes++;
      if (studyTime.attendance.feedback === "RED") {
        trafficLightCount += 3;
      } else if (studyTime.attendance.feedback === "YELLOW") {
        trafficLightCount += 2;
      } else {
        trafficLightCount += 1;
      }
    });
  });
  const savedStudyTimesData = await getSavedNeededStudyTimes(user, cw, year);
  const savedStudyTimes = savedStudyTimesData && savedStudyTimesData.needs ? savedStudyTimesData.needs as Array<string> : [] as Array<string>;
  const neededStudyTimes = savedStudyTimes.length || 0;
  return { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes, trafficLightCount, total };
}

export async function saveStudyTimeType(attendance: Attendances, userID: string, type: string) {
  if (type !== "Zusätzliche Studienzeit") {
    const check = await db.attendances.findMany({
      where: {
        type: type,
        cw: attendance.cw,
        userID: userID,
        created_at: {
          gte: dayjs(attendance.created_at).startOf("week").toISOString(),
          lte: dayjs(attendance.created_at).endOf("week").toISOString()
        }
      }
    });
    if (check.length > 0) return false;
  }
  const data = await db.attendances.update({
    where: { id: attendance.id },
    data: { type: type }
  });
  return data.type === type;
}

export async function createUserStudyTimeNote(userID: string, cw: number = dayjs().isoWeek(), year: number = dayjs().year()) {
  const user = await getUserPerID(userID);
  const sessionUser = await getSessionUser();
  if (user.id !== sessionUser.id) {
    if (sessionUser.permission === 0 || sessionUser.group.filter(value => user.group.includes(value)).length === 0) redirect("/dashboard");
  }
  if (sessionUser.permission !== 0 && (cw !== dayjs().isoWeek() || year !== dayjs().year())) {
    const note = await db.attendances.create({
      data: {
        userID: userID,
        eventID: "NOTE",
        teacherNote: "Nachträglich erstellte Notiz von " + sessionUser.displayname,
        cw: Number(cw),
        created_at: dayjs().year(year).isoWeek(cw).toISOString(),
      }
    });
    return note.eventID === "NOTE";
  }
  if (cw !== dayjs().isoWeek()) return false;
  const note = await db.attendances.create({
    data: {
      userID: userID,
      eventID: "NOTE",
      cw: Number(cw),
    }
  });
  return note.eventID === "NOTE";
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

export async function getSavedNeededStudyTimes(user: User, cw: number, year: number): Promise<StudyTimeData> {
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