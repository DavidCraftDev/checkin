"use client"

import { usePathname } from 'next/navigation';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { SearchParams } from "@/app/src/interfaces/searchParams";

let currentWeek = moment().week();
let currentYear = moment().year();

export function addWeek(pathname: string, year: number, cw: number, router: AppRouterInstance, userID?: string, groupID?: string) {
    if (String(year) === String(currentYear) && String(cw) === String(currentWeek)) return;
    let newYear = year;
    let newCW = cw;
    newCW++;
    newYear++;
    if (userID) {
        if (String(cw) === "53") return router.push(`${pathname}?year=${newYear}&cw=1&userID=${userID}`);
        if (String(cw) !== "53") return router.push(`${pathname}?year=${year}&cw=${newCW}&userID=${userID}`);
    }
    if (groupID) {
        if (String(cw) === "53") return router.push(`${pathname}?year=${newYear}&cw=1&groupID=${groupID}`);
        if (String(cw) !== "53") return router.push(`${pathname}?year=${year}&cw=${newCW}&groupID=${groupID}`);
    }
    if (String(cw) === "53") return router.push(`${pathname}?year=${newYear}&cw=1`);
    if (String(cw) !== "53") return router.push(`${pathname}?year=${year}&cw=${newCW}`);
}

export function subWeek(pathname: string, year: number, cw: number, router: AppRouterInstance, userID?: string, groupID?: string) {
    if (userID) {
        if (String(cw) === "1") return router.push(`${pathname}?year=${year - 1}&cw=53&userID=${userID}`);
        if (String(cw) !== "1") return router.push(`${pathname}?year=${year}&cw=${cw - 1}&userID=${userID}`);
    }
    if (groupID) {
        if (String(cw) === "1") return router.push(`${pathname}?year=${year - 1}&cw=53&groupID=${groupID}`);
        if (String(cw) !== "1") return router.push(`${pathname}?year=${year}&cw=${cw - 1}&groupID=${groupID}`);
    }
    if (String(cw) === "1") return router.push(`${pathname}?year=${year - 1}&cw=53`);
    if (String(cw) !== "1") return router.push(`${pathname}?year=${year}&cw=${cw - 1}`);
}

const CalendarWeek = ({ searchParams }: { searchParams: SearchParams }) => {
    const router = useRouter();
    const pathname = usePathname();
    const year = searchParams.year || currentYear;
    const cw = searchParams.cw || currentWeek;
    const userID = searchParams.userID;
    const groupID = searchParams.groupID;
    let isCurrentWeek = false;
    if (String(year) === String(currentYear) && String(cw) === String(currentWeek)) isCurrentWeek = true;
    return (
        <div className="grid grid-cols-3 grid-rows-1 gap-0 place-self-center items-center">
            <button className="btn text-bold" onClick={() => subWeek(pathname, year, cw, router, userID, groupID)}>-</button>
            <div className="grid grid-cols-1 grid-rows-2 gap-0 items-center text-center">
                <p>{year}</p>
                <p className="text-4xl">{cw}</p>
            </div>
            <button className="btn" onClick={() => addWeek(pathname, year, cw, router, userID, groupID)} disabled={isCurrentWeek}>+</button>
        </div>
    )
}

export default CalendarWeek;