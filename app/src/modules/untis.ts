import "server-only";
import { WebUntisElementType, WebUntisQR } from "webuntis"
import { authenticator as Authenticator } from 'otplib';
import { URL } from "url";
import courses from "./data/courses";

const QRCodeData = '';

const untis = new WebUntisQR(QRCodeData, 'custom-identity', Authenticator, URL);

export async function getTimegrid() {
  await untis.login();
  const data = await untis.getTimegrid();
  const days: Array<string> = [];
  data.forEach(day => {
    days.push(["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][day.day - 1]);
  });
  const timegrid = data[0].timeUnits
  return {
    days: days,
    timegrid: timegrid
  }
}

export async function getTeachers() {
  const teachersData = await untis.getTeachers();
  return teachersData;
}

export interface timeUnit {
  name: string,
  teacher: string
  room: string,
  note: string,
  subjects: string[],
  startTime: number,
  endTime: number,
  cancelled: boolean
  roomChanged: boolean
  closed: boolean
}

export async function getTimetable(date?: Date): Promise<Record<string, Record<string, timeUnit[]>>> {
  // Sort timetable entries by date and startTime
  // The Data is hardcoded for demonstration purposes. In a real application the data would be fetched from the WebUntis API.
  const timetableData = await untis.getTimetableForWeek(date || new Date(), 1028, WebUntisElementType.CLASS);

  const teachers = await getTeachers();
  // Date -> Starttime
  const timetable: Record<string, Record<string, timeUnit[]>> = {};
  timetableData.forEach(async entry => {
    const dateKey = entry.date.toString();
    const startKey = entry.startTime.toString();

    if (!timetable[dateKey]) {
      timetable[dateKey] = {};
    }
    if (!timetable[dateKey][startKey]) {
      timetable[dateKey][startKey] = [];
    }

    if (timetableData.map(e => entry.date === e.date && entry.studentGroup === e.studentGroup && (entry.startTime === e.endTime || entry.endTime === e.startTime)).includes(true)) {
      return;
    }

    if (entry.is.event || entry.is.exam) {
      return;
    }

    // A lesson is considered cancelled if all teachers have the name "---" or if the entry is marked as cancelled
    let cancelled = entry.teachers.every(teacher => teacher.state === "ABSENT");
    if (entry.is.cancelled || entry.exam) {
      cancelled = true;
    }

    const teacherData = teachers.find(teacher => entry.teachers.some(t => t.element.id === teacher.id || t.orgId === teacher.id));

    timetable[dateKey][startKey].push({
      name: entry.classes[0].element.name + " " + entry.subjects.map(subject => subject.element.name).join(", "),
      teacher: entry.teachers.map(teacher => teacherData?.name || teacher.element.name).join(", "),
      room: entry.rooms.map(room => room.element.name !== "---" ? room.element.name : null).join(", "),
      note: entry.substText || "",
      // Temporary implementation: list all subjects, not the subjects of the specific teacher
      subjects: entry.subjects.map(subject => courses[entry.subjects[0].element.name.split(" ")[0]] || subject.element.name),
      startTime: entry.startTime,
      endTime: entry.endTime,
      cancelled: cancelled,
      // A room is considered changed if any of the rooms has an orgname that differs from its name
      roomChanged: entry.rooms.every(room => room.state === "ABSENT" || room.state === "SUBSTITUTED"),
      closed: false // Placeholder, implement logic if needed
    });
  });
  return timetable;
}
