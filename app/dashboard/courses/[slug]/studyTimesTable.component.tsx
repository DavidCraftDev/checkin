"use client";

import { CourseStudyTimes } from "@/app/src/modules/courses";
import { formatDate } from "@/app/src/modules/date";
import { TeacherPerEvent } from "@/app/src/modules/eventUtilities";
import { Suspense } from "react";
import { use } from "react";
import TrafficLight from "../../events/attendedEvents/trafficLight";
import { User } from "@/app/src/modules/db";

export default function StudyTimeTable({ students, studyTimesPromise }: { students: User[], studyTimesPromise: Promise<{ studyTimes: CourseStudyTimes, teacherPerEvent: TeacherPerEvent }> }) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Schüler</th>
                            <th scope="col">Type</th>
                            <th scope="col">Lehrer</th>
                            <th scope="col">Schüler Notiz</th>
                            <th scope="col">Lehrer Notiz</th>
                            <th scope="col">Selbstreflexion</th>
                            <th scope="col">Ampel</th>
                            <th scope="col">Datum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <Suspense fallback={<tr><td colSpan={8}>Lade Studienzeiten...</td></tr>}>
                            <StudyTimeTableEntry students={students} studyTimesPromise={studyTimesPromise} />
                        </Suspense>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StudyTimeTableEntry({ students, studyTimesPromise }: { students: User[], studyTimesPromise: Promise<{ studyTimes: CourseStudyTimes, teacherPerEvent: TeacherPerEvent }> }) {
    const { studyTimes, teacherPerEvent } = use(studyTimesPromise);
    return (
        <>
            {Object.entries(studyTimes).map(([studentID, attendance]) => (
                <tr key={studentID}>
                    <td>{students.find(student => student.id === studentID)?.displayname}</td>
                    <td>{attendance?.type || "Noch keine Studienzeit besucht"}</td>
                    <td>{teacherPerEvent[attendance?.eventID]?.displayname || ""}</td>
                    <td>{attendance?.studentNote || ""}</td>
                    <td>{attendance?.teacherNote || ""}</td>
                    <td>{attendance?.selfReflection || "❓"}</td>
                    <td><TrafficLight status={attendance?.feedback} /></td>
                    <td>{attendance?.created_at ? formatDate(attendance?.created_at) : ""}</td>
                </tr>
            ))}
        </>
    );
}