import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { config_data } from "@/app/src/modules/data/config";
import { getMappedTimetable } from "@/app/src/modules/webuntis/webuntis.mapper";
import { LessonUnit } from "@/app/src/modules/webuntis/webuntis.types";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { redirect } from "next/navigation";
import { Metadata } from "next/types";
import React from "react";
import { LockButtonComponent } from "./lockButton.component";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function UntisPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    // Check if Untis module is enabled
    if (!config_data.UNTIS.ENABLE) redirect("/dashboard");

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
    date.setHours(12, 0, 0, 0); // Set to noon to avoid multiple caching entries

    // Fetch mapped timetable and timegrid from WebUntis in the given week
    const { timetable, timegrid, lastRefresh } = await getMappedTimetable(date);

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

    // Hide lock button for teachers if the timetable is in the current or past week
    let hideLockButton = false;
    if (user.permission === 1) {
        if (dayjs(date).startOf("isoWeek").isBefore(dayjs().startOf("isoWeek"))) {
            hideLockButton = true;
        } else if (dayjs(date).startOf("isoWeek").isSame(dayjs().startOf("isoWeek"))) {
            hideLockButton = true;
        }
    }

    // Prepare week navigation dates
    const startOfWeek = dayjs(date).startOf("isoWeek");
    const endOfWeek = dayjs(date).endOf("isoWeek");
    const prevWeek = startOfWeek.subtract(1, "week").format("YYYYMMDD");
    const nextWeek = startOfWeek.add(1, "week").format("YYYYMMDD");
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1>Studienzeit-Plan</h1>
                    <div className="text-sm text-zinc-600">
                        Zuletzt aktualisiert: {new Date(lastRefresh).toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" })}
                    </div>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center gap-2 rounded-lg bg-white p-1 shadow-sm ring-1 ring-zinc-200">
                    <Link
                        href={`?week=${prevWeek}`}
                        className="rounded-md p-1 hover:bg-zinc-100 text-zinc-600"
                        title="Vorherige Woche"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </Link>
                    <div className="px-2 text-sm font-medium text-zinc-700">
                        {startOfWeek.format("DD.MM.")} – {endOfWeek.format("DD.MM.YYYY")}
                    </div>
                    <Link
                        href={`?week=${nextWeek}`}
                        className="rounded-md p-1 hover:bg-zinc-100 text-zinc-600"
                        title="Nächste Woche"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* Status-Legende */}
            <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-red-700 ring-1 ring-inset ring-red-200">Entfällt</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-lime-50 px-3 py-1 text-lime-700 ring-1 ring-inset ring-lime-200">Raumänderung</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-800 ring-1 ring-inset ring-amber-200">Geschlossen</span>
            </div>

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
                                                <LessonGroup entries={timetable[dateArray[i]][unit.startTime]} hideLockButton={hideLockButton} currentUserId={user.id} isAdmin={user.permission === 2} />
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

function LessonElement(props: { entry: LessonUnit; showLock: boolean }) {
    const { entry, showLock } = props;
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
                <div className="flex items-center gap-2">
                    <div className="text-xs text-zinc-600">{entry.room}</div>
                    {showLock ? (
                        <LockButtonComponent lessonID={entry.id} courseID={entry.course} />
                    ) : null}
                </div>
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

function LessonGroup(props: { entries: LessonUnit[]; hideLockButton: boolean; currentUserId: string, isAdmin: boolean }) {
    const { entries, hideLockButton, currentUserId, isAdmin } = props;
    if (!entries || entries.length === 0) {
        return <div className="text-center text-sm text-zinc-400">–</div>;
    }
    return (
        <div className="space-y-2">
            {entries.map((entry) => (
                <LessonElement
                    key={`${entry.teacherName}-${entry.room}-${entry.startTime}-${entry.endTime}-${entry.subjects.join("-")}`}
                    entry={entry}
                    showLock={!hideLockButton && !entry.cancelled && !entry.closed && (isAdmin || entry.teacherID === currentUserId)}
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
