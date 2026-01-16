// 📅 DATE UTILITIES! Time is a social construct, but we still need to measure it! ⏰
import dayjs from "dayjs"; // 📆 The time lord library!
import isoWeek from "dayjs/plugin/isoWeek"; // 🗓️ ISO week plugin for fancy week calculations!
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear"; // 📊 Count weeks in a year!
import isLeapYear from "dayjs/plugin/isLeapYear"; // 🦘 Leap year detector! Jump if it's a leap year!

// 🔌 Activate all the dayjs superpowers! Transform! ⚡
dayjs.extend(isoWeek); // ⚡ Plugin 1: ACTIVATED!
dayjs.extend(isoWeeksInYear); // ⚡ Plugin 2: ACTIVATED!
dayjs.extend(isLeapYear); // ⚡ Plugin 3: ACTIVATED!

// 📅 What week is it right now? Let's find out! 🔍
export function getCurrentWeek(): number {
    return dayjs().isoWeek(); // 🗓️ Returns the current ISO week number!
}

// ✅ Check if a date is valid! Time police on duty! 👮
export function checkDate(year: number = new Date().getFullYear(), week: number = dayjs().year(year).isoWeek()): boolean {
    // 🚫 Check if the week is in a valid range (1-53)! Weeks outside this range are rebels!
    if (week < 1 || week > 53) return false;
    // 🎯 Initialize date with the given year and week!
    const date = dayjs().year(year).isoWeek(week);
    // ⏰ Check if the year is current year or before! No time travelers allowed! 🚫⏳
    if (date.year() > new Date().getFullYear()) return false;
    // 📊 Check if the week is in a valid range for the year! Some years are shorter! 
    if (week > dayjs().year(year).isoWeeksInYear()) return false;
    // 🔮 Check if the week is in the future (only for current year)! No fortune telling! 🚫
    const currentYear = new Date().getFullYear();
    if (year === currentYear && week > dayjs().isoWeek()) return false;
    // ✅ Return true if all checks passed! You made it! 🎉
    return true;
}

// 🎨 Format a date to German format! Guten Tag! 🇩🇪
export function formatDate(date: Date | string): string {
    // ⚙️ Options for German formatting! Precision is key! 🔑
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric", // 📅 Full year!
        month: "2-digit", // 🗓️ Two-digit month!
        day: "2-digit", // 📆 Two-digit day!
        hour: "2-digit", // ⏰ Two-digit hour!
        minute: "2-digit", // ⏱️ Two-digit minute!
        hour12: false, // 🚫 No AM/PM! 24-hour format like civilized people!
        timeZone: "Europe/Berlin" // 🇩🇪 Berlin timezone! Prost! 🍺
    };
    return new Date(date).toLocaleString("de-DE", options); // 🎁 Return formatted date!
}