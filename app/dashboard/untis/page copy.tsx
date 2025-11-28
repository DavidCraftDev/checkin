import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { config_data } from "@/app/src/modules/data/config";
import { getMappedTimetable } from "@/app/src/modules/webuntis/webuntis.mapper";
import { LessonUnit } from "@/app/src/modules/webuntis/webuntis.types";
import { redirect } from "next/navigation";
import { Metadata } from "next/types";
import React from "react";

async function UntisPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    // Check if Untis module is enabled
    if(!config_data.UNTIS.ENABLE) redirect("/dashboard");

    // Get search params and user session in parallel 
    const [params, user] = await Promise.all([
        await searchParams,
        await getSessionUser(),
    ]);

    // Get date from search params (?week=YYYYMMDD) or use current date
    let date: Date = new Date();
    const weekParam = typeof params?.week === "string" ? params?.week : undefined;
    if (weekParam) {
        date = parseDate(weekParam);
    }

    // Fetch mapped timetable and timegrid from WebUntis in the given week
    const { timetable, timegrid } = await getMappedTimetable(date);

    // Prepare timegrid and days array
    const timelayout = timegrid[0].timeUnits;
    const dayCount = timegrid.length;
    const days: Array<string> = [];
    timegrid.forEach(day => {
        days.push(["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][day.day - 1]);
    });

    // Prepare date array from timetable keys
    const dateSet: Set<number> = new Set();
    Object.keys(timetable).forEach((dateStr) => {
        const dateNum = parseInt(dateStr);
        dateSet.add(dateNum);
    });
    const dateArray: Record<number, number> = Array.from(dateSet).sort();

    // Check if user is teacher of one of the classes
    let checkCourseOwner: boolean = false;
    if(user.permission !== 0) {
        // Check if on of the lessons has the user as teacher (Check by id), if yes set checkCourseOwner to true
        Object.values(timetable).forEach(day => {
            Object.values(day).forEach(lessonUnits => {
                lessonUnits.forEach(lessonUnit => {
                    if(lessonUnit.teacherID === user.id) {
                        checkCourseOwner = true;
                    }
                });
            });
        });
    }
    return (
        <div className="space-y-3">
            <h1>Studienzeit-Plan</h1>
            <div className="text-sm text-zinc-600">
                Zuletzt aktualisiert: {new Date().toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" })}
            </div>

            {/* Status-Legende */}
            <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-red-700 ring-1 ring-inset ring-red-200">Entfällt</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-lime-50 px-3 py-1 text-lime-700 ring-1 ring-inset ring-lime-200">Raumänderung</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-800 ring-1 ring-inset ring-amber-200">Geschlossen</span>
            </div>

            {/* Tabelle im CheckIN-Style */}
            <div className="table overflow-x-auto">
                <table>
                    <colgroup>
                        <col span={1} className="w-1/13" />
                        <col span={1} className="w-2/11" />
                        <col span={1} className="w-2/11" />
                        <col span={1} className="w-2/11" />
                        <col span={1} className="w-2/11" />
                        <col span={1} className="w-2/11" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr>
                            <th className="font-bold">Zeit</th>
                            {Array.from({ length: dayCount }).map((_, i) => {
                                const date = parseDate(String(dateArray[i]));
                                return (
                                    <th key={i} className="font-bold">
                                        <div className="flex flex-col">
                                            <span>{days[i]}</span>
                                            <span className="text-xs font-normal text-zinc-500">
                                                {date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                                            </span>
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {timelayout.map((unit) => {
                            const startTime: string = String(unit.startTime).padStart(4, "0");
                            const endTime: string = String(unit.endTime).padStart(4, "0");
                            return (
                                <tr key={`${unit.name}-${unit.startTime}-${unit.endTime}`}>
                                    <td className="align-top text-center">
                                        <span className="font-mono font-semibold text-zinc-800">
                                            {startTime.substring(0, 2) + ":" + startTime.substring(2)}
                                        </span>
                                        <span className="mx-1 text-zinc-400">–</span>
                                        <span className="font-mono text-zinc-600">
                                            {endTime.substring(0, 2) + ":" + endTime.substring(2)}
                                        </span>
                                    </td>
                                    {Array.from({ length: dayCount }).map((_, i) => {
                                        if (!timetable[dateArray[i]]) timetable[dateArray[i]] = {};
                                        if (!timetable[dateArray[i]][unit.startTime]) timetable[dateArray[i]][unit.startTime] = [];
                                        return (
                                            <td key={i} className="align-top">
                                                <LeasonGroup entries={timetable[dateArray[i]][unit.startTime]} />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UntisPage;

export const metadata: Metadata = {
    title: "Studienzeitplan - CheckIN-System",
    description: "Die Übersicht des Studienzeitplans im CheckIN-System",
}

function LeasonElement(props: { entry: LessonUnit }) {
    const { entry } = props;
    const base = "rounded-md border bg-white p-2 shadow-sm transition-shadow hover:shadow";
    const status = entry.cancelled
        ? "border-red-300 bg-red-50"
        : entry.roomChanged
            ? "border-lime-300 bg-lime-50"
            : entry.closed
                ? "border-amber-300 bg-amber-50"
                : "border-zinc-200";

    return (
        <div
            className={`${base} ${status}`}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-zinc-900">{entry.teacherName}</div>
                <div className="text-xs text-zinc-600">{entry.room}</div>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
                {entry.subjects.map((subject) => (
                    <span
                        key={`${subject}-${entry.teacherName}-${entry.startTime}`}
                        className="inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-800"
                    >
                        {subject}
                    </span>
                ))}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{entry.course}</div>
            {entry.note ? <div className="mt-2 text-xs italic text-zinc-600">{entry.note}</div> : null}

            {(entry.cancelled || entry.roomChanged || entry.closed) && (
                <div className="mt-2 flex flex-wrap gap-1 text-[11px] font-semibold">
                    {entry.cancelled && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 ring-1 ring-inset ring-red-200">Entfällt</span>
                    )}
                    {entry.roomChanged && (
                        <span className="rounded-full bg-lime-100 px-2 py-0.5 text-lime-700 ring-1 ring-inset ring-lime-200">Raumänderung</span>
                    )}
                    {entry.closed && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 ring-1 ring-inset ring-amber-200">Geschlossen</span>
                    )}
                </div>
            )}
        </div>
    );
}

function LeasonGroup(props: { entries: LessonUnit[] }) {
    const { entries } = props;
    if (!entries || entries.length === 0) {
        return <div className="text-center text-sm text-zinc-400">–</div>;
    }
    return (
        <div className="space-y-2">
            {entries.map((entry) => (
                <LeasonElement
                    key={`${entry.teacherName}-${entry.room}-${entry.startTime}-${entry.endTime}-${entry.subjects.join("-")}`}
                    entry={entry}
                />
            ))}
        </div>
    );
}

function parseDate(s: string): Date {
    const y = parseInt(s.slice(0, 4));
    const m = parseInt(s.slice(4, 6)) - 1;
    const d = parseInt(s.slice(6, 8));
    return new Date(y, m, d);
}
