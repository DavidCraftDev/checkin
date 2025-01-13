"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

let currentWeek = dayjs().isoWeek();
let currentYear = dayjs().year();

export function addWeek(pathname: string, year: number, cw: number, router: AppRouterInstance, searchParams: URLSearchParams) {
    if (year > currentYear || (year === currentYear && cw >= currentWeek)) return;
    if (cw === dayjs().year(year).isoWeeksInYear()) {
        year = year + 1;
        searchParams.set("cw", "1");
        searchParams.set("year", year.toString());
    } else {
        cw = cw + 1;
        searchParams.set("cw", cw.toString());
        searchParams.set("year", year.toString());
    }
    router.push(`${pathname}?${searchParams.toString()}`);
}

export function subWeek(pathname: string, year: number, cw: number, router: AppRouterInstance, searchParams: URLSearchParams) {
    if (cw === 1) {
        year = year - 1;
        searchParams.set("cw", dayjs().year(year).isoWeeksInYear().toString());
        searchParams.set("year", year.toString());
    } else {
        cw = cw - 1;
        searchParams.set("cw", cw.toString());
        searchParams.set("year", year.toString());
    }
    router.push(`${pathname}?${searchParams.toString()}`);
}

function CalendarWeek() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = new URLSearchParams(useSearchParams());
    const year = Number(searchParams.get("year")) || currentYear;
    const cw = Number(searchParams.get("cw")) || currentWeek;
    const isCurrentWeek = year >= currentYear && cw >= currentWeek;
    return (
        <div className="flex items-center justify-center space-x-4">
            <button className="btn p-3 font-bold" onClick={() => subWeek(pathname, year, cw, router, searchParams)}>−</button>
            <div className="text-center">
                <p className="text-lg font-medium">{year}</p>
                <p className="text-4xl font-bold">{cw}</p>
            </div>
            <button className="btn p-3 font-bold" onClick={() => addWeek(pathname, year, cw, router, searchParams)} disabled={isCurrentWeek}>+</button>
        </div>
    )
}

export default CalendarWeek;