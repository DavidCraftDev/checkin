// 🎓 STUDY TIME UTILITIES! Managing all those study sessions! 📚
import "server-only"; // 🚫 Server-only! No browser snooping!

// 🎪 Import circus! Bringing in all the helpers! 🎭
import { getAttendancesPerUser } from "./eventUtilities"; // 📊 Attendance getter!
import { Attendances, StudyTimeData, User } from "@prisma/client"; // 🎯 Prisma types!
import db from "./db"; // 🗄️ The database overlord!
import dayjs from "dayjs"; // 📅 Time wizard!
import isoWeek from "dayjs/plugin/isoWeek"; // 📆 ISO week plugin!
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear"; // 🗓️ Weeks in year!
import isLeapYear from "dayjs/plugin/isLeapYear"; // 🦘 Leap year detector!
import { disabledType } from "../interfaces/utilties"; // 🎨 Type utilities!
import { getUserPerID } from "./userUtilities"; // 👤 User fetcher!
import { redirect } from "next/navigation"; // 🧭 Navigation redirect!
import { getSessionUser } from "./auth/cookieManager"; // 🍪 Session cookie manager!

// 🔌 Activate dayjs superpowers! Transform! ⚡
dayjs.extend(isoWeek); // ⚡ Zap!
dayjs.extend(isoWeeksInYear); // ⚡ Pow!
dayjs.extend(isLeapYear); // ⚡ Boom!

// 💾 Cache for saved study time data! Because we're efficient like that! 🚀
const lastSaveStudyTimeData: disabledType = {};

// 📊 Get attended study times count! Let's crunch those numbers! 🧮
export async function getAttendedStudyTimesCount(user: User, cw: number, year: number) {
  let normalStudyTimes = 0; // 📚 Regular study times counter!
  let parallelStudyTimes = 0; // 🔀 Parallel/substitute sessions!
  let notedStudyTimes = 0; // 📝 Noted study times!
  let trafficLightCount = 0; // 🚦 Traffic light feedback counter!
  let total = 0; // 🔢 Total attendance count!
  // 🎯 Fetch and process all attendances! Let's see what you've been up to! 👀
  await getAttendancesPerUser(user.id, cw, year).then((result) => {
    total = result.length; // 📊 How many in total?
    // 🔄 Loop through each study time and categorize! Sort 'em out! 📦
    result.forEach((studyTime) => {
      if (studyTime.attendance.type === null) return; // 🤷 No type? Skip it!
      // 🔀 Is it a substitute/parallel session?
      if (studyTime.attendance.type.startsWith("Vertretung:")) parallelStudyTimes++;
      // 📝 Is it a noted session?
      else if (studyTime.attendance.type.startsWith("Notiz:")) notedStudyTimes++;
      // 📚 Otherwise it's a normal study time!
      else normalStudyTimes++;
      // 🚦 Calculate traffic light score! RED = 3, YELLOW = 2, GREEN = 1! 
      if (studyTime.attendance.feedback === "RED") {
        trafficLightCount += 3; // 🔴 Uh oh! Not good!
      } else if (studyTime.attendance.feedback === "YELLOW") {
        trafficLightCount += 2; // 🟡 Could be better!
      } else {
        trafficLightCount += 1; // 🟢 Looking good!
      }
    });
  });
  // 💾 Get saved study time data! What's in the vault? 🔐
  const savedStudyTimesData = await getSavedNeededStudyTimes(user, cw, year);
  const savedStudyTimes = savedStudyTimesData && savedStudyTimesData.needs ? savedStudyTimesData.needs as Array<string> : [] as Array<string>;
  const neededStudyTimes = savedStudyTimes.length || 0; // 📊 How many do you need?
  return { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes, trafficLightCount, total }; // 🎁 Here's your stats package!
}

// 💾 Save study time type! Marking attendance with style! ✨
export async function saveStudyTimeType(attendance: Attendances, userID: string, type: string) {
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