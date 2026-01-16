import "server-only";
import { getAttendancesPerUser } from "@/lib/events";
import { Attendance, StudyTimeData, User } from "@prisma/client";
import db from "@/lib/db";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { disabledType } from "@/types/utilties";
import { getUserById } from "@/lib/users";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/cookieManager";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

const lastSaveStudyTimeData: disabledType = {};

export async function getAttendedStudyTimesCount(user: User, cw: number, year: number) {
  let normalStudyTimes = 0;
  let parallelStudyTimes = 0;
  let notedStudyTimes = 0;
  let trafficLightCount = 0;

  const attendancesData = await getAttendancesPerUser(user.id, cw, year);
  const total = attendancesData.length;

  for (const { attendance } of attendancesData) {
      if (!attendance.type) continue;

      if (attendance.type.startsWith("Vertretung:")) parallelStudyTimes++;
      else if (attendance.type.startsWith("Notiz:")) notedStudyTimes++;
      else normalStudyTimes++;

      if (attendance.feedback === "RED") {
        trafficLightCount += 3;
      } else if (attendance.feedback === "YELLOW") {
        trafficLightCount += 2;
      } else {
        trafficLightCount += 1;
      }
  }

  const savedStudyTimesData = await getSavedNeededStudyTimes(user, cw, year);
  const savedStudyTimes = savedStudyTimesData?.needs || [];
  const neededStudyTimes = savedStudyTimes.length;

  return { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes, trafficLightCount, total };
}

export async function saveStudyTimeType(attendance: Attendance, userId: string, type: string) {
  const check = await db.attendance.count({
    where: {
      type: type,
      cw: attendance.cw,
      userId: userId,
      createdAt: {
        gte: dayjs(attendance.createdAt).startOf("week").toDate(),
        lte: dayjs(attendance.createdAt).endOf("week").toDate()
      }
    }
  });

  if (check > 0) return false;

  const data = await db.attendance.update({
    where: { id: attendance.id },
    data: { type: type }
  });
  return data.type === type;
}

export async function createUserStudyTimeNote(userId: string, cw: number = dayjs().isoWeek(), year: number = dayjs().year()) {
  const user = await getUserById(userId);
  if (!user) return false;

  const sessionUser = await getSessionUser();

  if (user.id !== sessionUser.id) {
     const commonGroups = sessionUser.groups.filter(value => user.groups.includes(value));
     if (sessionUser.permission === 0 || commonGroups.length === 0) {
         redirect("/dashboard");
     }
  }

  if (sessionUser.permission !== 0 && (cw !== dayjs().isoWeek() || year !== dayjs().year())) {
    await db.attendance.create({
      data: {
        userId: userId,
        type: "Notiz",
        teacherNote: "Nachträglich erstellte Notiz von " + sessionUser.displayName,
        cw: Number(cw),
        createdAt: dayjs().year(year).isoWeek(cw).toDate(),
      }
    });
    return true;
  }

  if (cw !== dayjs().isoWeek()) return false;

  await db.attendance.create({
    data: {
      userId: userId,
      type: "Notiz",
      cw: Number(cw),
    }
  });
  return true;
}

export async function saveNeededStudyTimes(user: User) {
  if (lastSaveStudyTimeData[user.id] && lastSaveStudyTimeData[user.id] + 900000 > Date.now()) return;

  const data = await db.studyTimeData.findFirst({
    where: {
      userId: user.id,
      cw: dayjs().isoWeek(),
      year: dayjs().year()
    }
  });

  if (data) {
    if (JSON.stringify(data.needs) !== JSON.stringify(user.needs)) {
         await db.studyTimeData.update({
            where: { id: data.id },
            data: { needs: user.needs }
         });
    }
  } else {
    await db.studyTimeData.create({
      data: {
        userId: user.id,
        cw: dayjs().isoWeek(),
        year: dayjs().year(),
        needs: user.needs
      }
    });
  }
  lastSaveStudyTimeData[user.id] = Date.now();
}

export async function getSavedNeededStudyTimes(user: User, cw: number, year: number): Promise<StudyTimeData | null> {
  if (!(lastSaveStudyTimeData[user.id] && lastSaveStudyTimeData[user.id] + 900000 > Date.now())) {
      await saveNeededStudyTimes(user);
  }

  return db.studyTimeData.findFirst({
    where: {
      userId: user.id,
      cw: Number(cw),
      year: Number(year)
    }
  });
}
