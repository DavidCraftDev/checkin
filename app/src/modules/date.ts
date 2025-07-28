import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

export function getCurrentWeek(): number {
    return dayjs().isoWeek();
}

export function checkDate(year: number = new Date().getFullYear(), week: number = dayjs().year(year).isoWeek()): boolean {
    // Check if the week is in a valid range
    if (week < 1 || week > 53) return false;
    // Initialize date
    const date = dayjs().year(year).isoWeek(week);
    // Check if the year is current year or before current year
    if (date.year() > new Date().getFullYear()) return false;
    // Check if the week is in a valid range for the year
    if (week > dayjs().year(year).isoWeeksInYear()) return false;
    // Check if the week is in the future (only for current year)
    const currentYear = new Date().getFullYear();
    if (year === currentYear && week > dayjs().isoWeek()) return false;
    // Return true if all checks passed
    return true;
}

export function formatDate(date: Date | string): string {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Berlin"
    };
    return new Date(date).toLocaleString("de-DE", options);
}