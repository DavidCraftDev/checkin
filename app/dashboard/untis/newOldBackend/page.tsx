import { getTimegrid, getTimetable, timeUnit } from "@/app/src/modules/untis";
import { Metadata } from "next/types";
import React from "react";

async function UntisPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
    // Fetch days and timegrid from Untis
    const { days, timegrid } = await getTimegrid();
    const dayCount = days.length;

    const params = await searchParams;
    const weekParam = typeof params?.week === "string" ? params?.week : undefined;
    // Bestimme angezeigte Woche über ?week=YYYYMMDD (Montag)
    let date: Date = new Date();
    function parseDate(s: string): Date {
        const y = parseInt(s.slice(0, 4));
        const m = parseInt(s.slice(4, 6)) - 1;
        const d = parseInt(s.slice(6, 8));
        return new Date(y, m, d);
    }
    if (weekParam) {
        date = parseDate(weekParam);
    }
    const timetable = await getTimetable(date);

    const dateSet: Set<number> = new Set();
    Object.keys(timetable).forEach((dateStr) => {
        const dateNum = parseInt(dateStr);
        dateSet.add(dateNum);
    });
    const dayMap: Record<number, number> = Array.from(dateSet).sort();
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
                                const date = parseDate(String(dayMap[i]));
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
                        {timegrid.map((unit) => {
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
                                        if (!timetable[dayMap[i]]) timetable[dayMap[i]] = {};
                                        if (!timetable[dayMap[i]][unit.startTime]) timetable[dayMap[i]][unit.startTime] = [];
                                        return (
                                            <td key={i} className="align-top">
                                                <LeasonGroup entries={timetable[dayMap[i]][unit.startTime]} />
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

function LeasonElement(props: { entry: timeUnit }) {
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
                <div className="font-semibold text-zinc-900">{entry.teacher}</div>
                <div className="text-xs text-zinc-600">{entry.room}</div>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
                {entry.subjects.map((subject) => (
                    <span
                        key={`${subject}-${entry.teacher}-${entry.startTime}`}
                        className="inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-800"
                    >
                        {subject}
                    </span>
                ))}
            </div>
            {entry.name ? <div className="mt-1 text-xs text-zinc-500">{entry.name}</div> : null}
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

function LeasonGroup(props: { entries: timeUnit[] }) {
    const { entries } = props;
    if (!entries || entries.length === 0) {
        return <div className="text-center text-sm text-zinc-400">–</div>;
    }
    return (
        <div className="space-y-2">
            {entries.map((entry) => (
                <LeasonElement
                    key={`${entry.teacher}-${entry.room}-${entry.startTime}-${entry.endTime}-${entry.subjects.join("-")}`}
                    entry={entry}
                />
            ))}
        </div>
    );
}
