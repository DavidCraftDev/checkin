"use client"

import { usePathname, useSearchParams } from 'next/navigation';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

let currentWeek = moment().isoWeek();
let currentYear = moment().year();

export function addWeek(pathname: string, year: number, cw: number, router: AppRouterInstance, searchParams: URLSearchParams) {
    if (year >= currentYear && cw >= currentWeek) return;
    if (cw === 53) {
        searchParams.set("cw", "1");
        searchParams.set("year", (year + 1).toString());
    } else {
        searchParams.set("cw", (cw + 1).toString());
        searchParams.set("year", year.toString());
    }
    router.push(`${pathname}?${searchParams.toString()}`);
}

export function subWeek(pathname: string, year: number, cw: number, router: AppRouterInstance, searchParams: URLSearchParams) {
    if (cw === 1) {
        searchParams.set("cw", "53");
        searchParams.set("year", (year - 1).toString());
    } else {
        searchParams.set("cw", (cw - 1).toString());
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
    let isCurrentWeek = false;
    if (year >= currentYear && cw >= currentWeek) isCurrentWeek = true;
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