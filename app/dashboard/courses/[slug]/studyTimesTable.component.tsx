"use client";

import { CourseStudyTimes } from "@/app/src/modules/courses";
import { TeacherPerEvent } from "@/app/src/modules/eventUtilities";
import { User } from "@prisma/client";
import { Suspense } from "react";
import { use } from "react";

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
                            <th scope="col">Datum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <Suspense fallback={<tr><td colSpan={6}>Lade Studienzeiten...</td></tr>}>
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
                    <td>{attendance ? attendance.type : "Noch keine Studienzeit besucht"}</td>
                    <td>{attendance ? teacherPerEvent[attendance.eventID]?.displayname : ""}</td>
                    <td>{attendance ? attendance.studentNote : ""}</td>
                    <td>{attendance ? attendance.teacherNote : ""}</td>
                    <td>{attendance ? attendance.created_at?.toLocaleString("de-DE") : ""}</td>
                </tr>
            ))}
        </>
    );
}