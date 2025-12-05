import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { config_data } from "@/app/src/modules/data/config";
import { getMappedTimetable } from "@/app/src/modules/webuntis/webuntis.mapper";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { redirect } from "next/navigation";
import { Metadata } from "next/types";
import React from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { UntisTable } from "./untisTable.component";

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

    // Prepare days array
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

            <UntisTable 
                timetable={timetable}
                timegrid={timegrid}
                dateArray={Object.values(dateArray)}
                days={days}
                user={user}
                hideLockButton={hideLockButton}
            />
        </div>
    );
}

export default UntisPage;

export const metadata: Metadata = {
    title: "Studienzeitplan - CheckIN-System",
    description: "Die Übersicht des Studienzeitplans im CheckIN-System",
}

function parseDate(s: string): Date {
    const y = parseInt(s.slice(0, 4));
    const m = parseInt(s.slice(4, 6)) - 1;
    const d = parseInt(s.slice(6, 8));
    return new Date(y, m, d);
}
