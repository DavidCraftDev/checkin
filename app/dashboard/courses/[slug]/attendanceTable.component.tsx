"use client";

import { CourseStudyTimes } from "@/lib/courses";
import { TeacherPerEvent } from "@/lib/events";
import { User } from "@prisma/client";

export default function AttendanceTable({ students, studyTimesPromise }: { students: User[], studyTimesPromise: Promise<{ studyTimes: CourseStudyTimes, teacherPerEvent: TeacherPerEvent }> }) {
    return (
        <div>
            <h2>Anwesenheiten</h2>
            <div className="overflow-x-auto">
                <div className="table">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Lehrer</th>
                                <th scope="col">Datum</th>
                                <th scope="col">Anzeigen</th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
}