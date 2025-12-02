/** @file Provides data mapping for the data from the WebUntis API for the frontend timetable */

import "server-only";
import { LessonUnit, TimetableMapping } from "./webuntis.types";
import courses from "../data/courses";
import { cachedDBTeacher, cachedLessonCloseStatus, cachedTeachers, cachedTimegrid, cachedTimetable } from "./webuntis.caching";
import { config_data } from "../data/config";
import { WebAPITimetable } from "webuntis";

/**
 * Gets the mapped timetable for a whole week and timegrid for the frontend
 *
 * @export
 * @async
 * @param {Date} date A date in the week for which to get the mapped timetable
 * @returns {TimetableMapping} The mapped timetable and timegrid
 */
export async function getMappedTimetable(date: Date): Promise<TimetableMapping> {
    const [timetable, timegrid] = await Promise.all([
        buildTimetable(date),
        cachedTimegrid()
    ]);
    return {
        timetable: timetable,
        timegrid: timegrid
    };
}

/**
 * Description placeholder
 *
 * @async
 * @param {Date} date 
 * @returns {unknown} 
 */
async function buildTimetable(date: Date) {
    // Fetch data
    const timetableDatas: Record<number, WebAPITimetable[]> = {};
    await Promise.all(config_data.UNTIS.CLASS_IDS.map(async classID => {
        timetableDatas[classID] = await cachedTimetable(date, classID);
    }));
    const webuntisTeachers = await cachedTeachers();

    // Date -> Starttime -> LessonUnits
    const timetable: Record<string, Record<string, LessonUnit[]>> = {};

    // Map WebAPITimetable entries of every class timetable to LessonUnits
    await Promise.all(Object.values(timetableDatas).map(async timetableData => {
        await Promise.all(timetableData.map(async entry => {
            const dateKey = entry.date.toString();
            const startKey = entry.startTime.toString();

            // Initialize nested objects if they don't exist
            if (!timetable[dateKey]) {
                timetable[dateKey] = {};
            }
            if (!timetable[dateKey][startKey]) {
                timetable[dateKey][startKey] = [];
            }

            // Skip entries that are part of a full lesson
            if (timetableData.map(e => entry.date === e.date && entry.studentGroup === e.studentGroup && (entry.startTime === e.endTime || entry.endTime === e.startTime)).includes(true)) {
                return;
            }

            // Note: entry.is.exam is when the lesson is only an exam, entry.exam is when the lesson is an exam but also has regular lesson parts
            // Skip event and exam entries
            if (entry.is.event || entry.is.exam) {
                return;
            }

            // Find webuntis teacher data and corresponding checkIN teacher data from database
            const webUntisTeacherData = webuntisTeachers.find(teacher => entry.teachers.some(t => t.element.id === teacher.id || t.orgId === teacher.id));
            const dbTeacherData = webUntisTeacherData ? await cachedDBTeacher(webUntisTeacherData.name) : null;

            // List subjects from checkIN teacher competence if available, otherwise use subjects from WebUntis entry
            let subjectList: string[] = [];
            if (dbTeacherData) {
                subjectList = dbTeacherData.competence;
            } else {
                subjectList = entry.subjects.map(subject => courses[entry.subjects[0].element.name.split(" ")[0]] || subject.element.name);
            }

            // A lesson is considered cancelled if all teachers have the state "ABSENT", if the lesson is part of an exam or is marked as cancelled
            let cancelled: boolean = entry.teachers.every(teacher => teacher.state === "ABSENT");
            if (entry.is.cancelled || entry.exam) {
                cancelled = true;
            }

            // Placeholder, implement logic if needed
            let closed: boolean = await cachedLessonCloseStatus(String(entry.id));

            // Map WebAPITimetable entry to LessonUnit
            const lessonUnit: LessonUnit = {
                course: entry.classes[0].element.name + " " + entry.subjects.map(subject => subject.element.name).join(", "),
                teacherID: dbTeacherData ? dbTeacherData.id : "0",
                teacherName: entry.teachers.map(teacher => webUntisTeacherData?.name || teacher.element.name).join(", "),
                room: entry.rooms.map(room => room.element.name !== "---" ? room.element.name : null).join(", "),
                note: entry.substText || "",
                subjects: subjectList,
                startTime: entry.startTime,
                endTime: entry.endTime,
                cancelled: cancelled,
                roomChanged: entry.rooms.every(room => room.state === "ABSENT" || room.state === "SUBSTITUTED"),
                closed: closed
            };

            timetable[dateKey][startKey].push(lessonUnit);
        }));
    }));

    return timetable;
}