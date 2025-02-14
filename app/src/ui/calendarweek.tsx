"use client";

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

let currentWeek = dayjs().isoWeek();
let currentYear = dayjs().year();

export function addWeek(pathname: string, year: number, cw: number, router: ReturnType<typeof useRouter>, cwSearchParam: string, yearSearchParam: string, searchParams: URLSearchParams) {
    if (year > currentYear || (year === currentYear && cw >= currentWeek)) return;
    if (cw === dayjs().year(year).isoWeeksInYear()) {
        year = year + 1;
        searchParams.set(cwSearchParam, "1");
        searchParams.set(yearSearchParam, year.toString());
    } else {
        cw = cw + 1;
        searchParams.set(cwSearchParam, cw.toString());
        searchParams.set(yearSearchParam, year.toString());
    }
    router.push(`${pathname}?${searchParams.toString()}`);
}

export function subWeek(pathname: string, year: number, cw: number, router: ReturnType<typeof useRouter>, cwSearchParam: string, yearSearchParam: string, searchParams: URLSearchParams) {
    if (cw === 1) {
        year = year - 1;
        searchParams.set(cwSearchParam, dayjs().year(year).isoWeeksInYear().toString());
        searchParams.set(yearSearchParam, year.toString());
    } else {
        cw = cw - 1;
        searchParams.set(cwSearchParam, cw.toString());
        searchParams.set(yearSearchParam, year.toString());
    }
    router.push(`${pathname}?${searchParams.toString()}`);
}

function CalendarWeek({ cwSearchParam = "cw", yearSearchParam = "year" }: { cwSearchParam?: string, yearSearchParam?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = new URLSearchParams(useSearchParams());
    const cw = Number(searchParams.get(cwSearchParam)) || currentWeek;
    const year = Number(searchParams.get(yearSearchParam)) || currentYear;
    const isCurrentWeek = year >= currentYear && cw >= currentWeek;
    return (
        <div className="flex items-center justify-center space-x-4">
            <button className="btn p-3 font-bold" onClick={() => subWeek(pathname, year, cw, router, cwSearchParam, yearSearchParam, searchParams)}>−</button>
            <div className="text-center">
                <p className="text-lg font-medium">{year}</p>
                <p className="text-4xl font-bold">{cw}</p>
            </div>
            <button className="btn p-3 font-bold" onClick={() => addWeek(pathname, year, cw, router, cwSearchParam, yearSearchParam, searchParams)} disabled={isCurrentWeek}>+</button>
        </div>
    )
}

export default CalendarWeek;