"use client";

import { LessonUnit } from "@/app/src/modules/webuntis/webuntis.types";
import React, { useState } from "react";
import { LockButtonComponent } from "./lockButton.component";
import { Timegrid } from "webuntis";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { User } from "@/app/src/modules/db";

interface UntisTableProps {
    timetable: Record<string, Record<string, LessonUnit[]>>;
    timegrid: Timegrid[];
    dateArray: number[];
    days: string[];
    user: User;
    hideLockButton: boolean;
}

export function UntisTable({ timetable, timegrid, dateArray, days, user, hideLockButton }: UntisTableProps) {
    const [filterNeeds, setFilterNeeds] = useState(false);
    const [filterMyCourses, setFilterMyCourses] = useState(false);

    const today = new Date();
    const todayNumber = parseInt(
        today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, '0') +
        today.getDate().toString().padStart(2, '0')
    );
    const initialIndex = dateArray.indexOf(todayNumber);
    const [currentMobileDayIndex, setCurrentMobileDayIndex] = useState(initialIndex !== -1 ? initialIndex : 0);

    const timelayout = timegrid[0].timeUnits;
    const dayCount = timegrid.length;

    const isStudent = user.permission === 0;
    const isTeacher = user.permission >= 1;

    return (
        <div className="space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 rounded-lg bg-white p-3 shadow-sm ring-1 ring-zinc-200">
                {isStudent && (
                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input
                            type="checkbox"
                            checked={filterNeeds}
                            onChange={(e) => setFilterNeeds(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        Nur meine Fächer anzeigen
                    </label>
                )}
                {isTeacher && (
                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input
                            type="checkbox"
                            checked={filterMyCourses}
                            onChange={(e) => setFilterMyCourses(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        Nur meine Kurse anzeigen
                    </label>
                )}
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm ring-1 ring-zinc-200 md:hidden">
                <button
                    onClick={() => setCurrentMobileDayIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentMobileDayIndex === 0}
                    className="rounded p-1 hover:bg-zinc-100 disabled:opacity-30"
                >
                    <ChevronLeftIcon className="h-6 w-6 text-zinc-600" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-semibold text-zinc-900">{days[currentMobileDayIndex]}</span>
                    <span className="text-xs text-zinc-500">
                        {parseDate(String(dateArray[currentMobileDayIndex])).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })}
                    </span>
                </div>
                <button
                    onClick={() => setCurrentMobileDayIndex((prev) => Math.min(dayCount - 1, prev + 1))}
                    disabled={currentMobileDayIndex === dayCount - 1}
                    className="rounded p-1 hover:bg-zinc-100 disabled:opacity-30"
                >
                    <ChevronRightIcon className="h-6 w-6 text-zinc-600" />
                </button>
            </div>

            <div className="table overflow-x-auto">
                <table>
                    <colgroup>
                        <col span={1} className="w-1/13" />
                        {Array.from({ length: dayCount }).map((_, i) => {
                            const isHiddenOnMobile = i !== currentMobileDayIndex;
                            return (
                                <col
                                    key={i}
                                    span={1}
                                    className={`${isHiddenOnMobile ? "hidden md:table-column" : ""}` + " w-auto md:w-2/11"}
                                />
                            );
                        })}
                        { }
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr>
                            <th className="font-bold">Zeit</th>
                            {Array.from({ length: dayCount }).map((_, i) => {
                                const date = parseDate(String(dateArray[i]));
                                const isHiddenOnMobile = i !== currentMobileDayIndex;
                                return (
                                    <th key={i} className={`font-bold ${isHiddenOnMobile ? "hidden md:table-cell" : ""}`}>
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
                                        const dateKey = dateArray[i];
                                        const entries = timetable[dateKey]?.[unit.startTime] || [];

                                        // Apply filters
                                        let filteredEntries = entries;

                                        if (filterNeeds && isStudent) {
                                            // Remove subjects that are not needed from the entries
                                            filteredEntries = filteredEntries.map(entry => {
                                                const data = {
                                                    ...entry,
                                                    subjects: entry.subjects.filter(subject => user.needs.includes(subject)),
                                                }
                                                if (data.subjects.length === 0) {
                                                    return null;
                                                }
                                                return data;
                                            }).filter(entry => entry !== null) as LessonUnit[];
                                        }

                                        if (filterMyCourses && isTeacher) {
                                            filteredEntries = filteredEntries.filter(entry => entry.teacherID === user.id);
                                        }

                                        const isHiddenOnMobile = i !== currentMobileDayIndex;

                                        return (
                                            <td key={i} className={`align-top ${isHiddenOnMobile ? "hidden md:table-cell" : ""}`}>
                                                <LessonGroup
                                                    entries={filteredEntries}
                                                    hideLockButton={hideLockButton}
                                                    currentUserId={user.id}
                                                    isAdmin={user.permission === 2}
                                                />
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
