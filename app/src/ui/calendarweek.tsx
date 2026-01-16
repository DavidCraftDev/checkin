// 📅 CALENDAR WEEK COMPONENT! Time travel through weeks! ⏰
"use client";

// 🎪 Import extravaganza! Navigation and time utilities! 🎭
import { usePathname, useSearchParams, useRouter } from 'next/navigation'; // 🧭 Next.js navigation!
import dayjs from "dayjs"; // 📆 Time wizard!
import isoWeek from "dayjs/plugin/isoWeek"; // 🗓️ ISO week plugin!
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear"; // 📊 Weeks per year!
import isLeapYear from "dayjs/plugin/isLeapYear"; // 🦘 Leap year detection!

// 🔌 Power up dayjs! ⚡
dayjs.extend(isoWeek); // ⚡ Zap!
dayjs.extend(isoWeeksInYear); // ⚡ Pow!
dayjs.extend(isLeapYear); // ⚡ Boom!

// 📅 Store current week and year! The present moment! ⏰
let currentWeek = dayjs().isoWeek();
let currentYear = dayjs().year();

// ➕ Add a week! Time to move forward! 🚀
export function addWeek(pathname: string, year: number, cw: number, router: ReturnType<typeof useRouter>, cwSearchParam: string, yearSearchParam: string, searchParams: URLSearchParams) {
    // 🚫 Can't go into the future! No time machines here! ⏰
    if (year > currentYear || (year === currentYear && cw >= currentWeek)) return;
    // 🎆 End of year? Roll over to next year! 🎉
    if (cw === dayjs().year(year).isoWeeksInYear()) {
        year = year + 1; // 🗓️ New year, who dis?
        searchParams.set(cwSearchParam, "1"); // 🔢 Week 1!
        searchParams.set(yearSearchParam, year.toString()); // 📅 Update year!
    } else {
        // ➕ Just add one week! Simple! 
        cw = cw + 1;
        searchParams.set(cwSearchParam, cw.toString()); // 🔢 Update week!
        searchParams.set(yearSearchParam, year.toString()); // 📅 Keep year!
    }
    router.push(`${pathname}?${searchParams.toString()}`); // 🧭 Navigate to new week!
}

// ➖ Subtract a week! Going back in time! ⏪
export function subWeek(pathname: string, year: number, cw: number, router: ReturnType<typeof useRouter>, cwSearchParam: string, yearSearchParam: string, searchParams: URLSearchParams) {
    // 🎆 At week 1? Roll back to previous year! 📅
    if (cw === 1) {
        year = year - 1; // 🗓️ Previous year!
        searchParams.set(cwSearchParam, dayjs().year(year).isoWeeksInYear().toString()); // 🔢 Last week of previous year!
        searchParams.set(yearSearchParam, year.toString()); // 📅 Update year!
    } else {
        // ➖ Just subtract one week! Easy peasy! 
        cw = cw - 1;
        searchParams.set(cwSearchParam, cw.toString()); // 🔢 Update week!
        searchParams.set(yearSearchParam, year.toString()); // 📅 Keep year!
    }
    router.push(`${pathname}?${searchParams.toString()}`); // 🧭 Navigate to new week!
}

// 📅 Calendar Week Component! The week navigator! 🧭
function CalendarWeek({ cwSearchParam = "cw", yearSearchParam = "year" }: { cwSearchParam?: string, yearSearchParam?: string }) {
    const router = useRouter(); // 🚀 Router for navigation!
    const pathname = usePathname(); // 📍 Current path!
    const searchParams = new URLSearchParams(useSearchParams()); // 🔍 URL search params!
    const cw = Number(searchParams.get(cwSearchParam)) || currentWeek; // 📅 Get week from URL or use current!
    const year = Number(searchParams.get(yearSearchParam)) || currentYear; // 🗓️ Get year from URL or use current!
    const isCurrentWeek = year >= currentYear && cw >= currentWeek; // ⏰ Are we at the present?
    return (
        // 🎨 The week selector UI! Beautiful and functional! ✨
        <div className="flex items-center justify-center space-x-4">
            {/* ➖ Previous week button! Go back in time! ⏪ */}
            <button className="btn p-3 font-bold" onClick={() => subWeek(pathname, year, cw, router, cwSearchParam, yearSearchParam, searchParams)}>−</button>
            {/* 📊 Display current week and year! The time stamp! ⏰ */}
            <div className="text-center">
                <p className="text-lg font-medium">{year}</p> {/* 🗓️ Year display! */}
                <p className="text-4xl font-bold">{cw}</p> {/* 📅 Week number! BIG and BOLD! */}
            </div>
            {/* ➕ Next week button! Move forward! ⏩ (but not into the future!) */}
            <button className="btn p-3 font-bold" onClick={() => addWeek(pathname, year, cw, router, cwSearchParam, yearSearchParam, searchParams)} disabled={isCurrentWeek}>+</button>
        </div>
    )
}

export default CalendarWeek; // 🎁 Export the time traveler component! ⏰