// 🎪 Welcome to the DASHBOARD! The control center of awesomeness! 🎮
import { getSessionUser } from "../src/modules/auth/cookieManager"; // 🍪 Cookie monster's favorite import!
import { getAttendancesPerUser } from "../src/modules/eventUtilities"; // 📊 Attendance tracking like a hawk! 🦅
import MissingStudyTimes from "./dashboardComponents/missingStudyTimes.component"; // ❌ The "oops, you missed it" component
import CompletedStudyTimes from "./dashboardComponents/completedStudyTimes.component"; // ✅ The "good job, champ!" component
import AttendancesWithoutType from "./dashboardComponents/attendancesWithoutType.component"; // 🤷 The mysterious ones!
import dayjs from "dayjs"; // 📅 Because Date objects are SO 2010! 
import isoWeek from "dayjs/plugin/isoWeek"; // 📆 ISO weeks for the sophisticated developer! 🎩
import { Metadata } from "next"; // 🏷️ Meta-data-licious!
import { config_data } from "../src/modules/data/config"; // ⚙️ Configuration station!
import { getRoundCountForUser } from "./modules/sponsorenlauf/handler"; // 🏃‍♂️ Running circles (literally!)

dayjs.extend(isoWeek); // 🔌 Plugging in that ISO week functionality! Zap! ⚡

// 🚀 The main dashboard function - Where the magic happens! ✨
async function DashboardPage() {
    const user = await getSessionUser(); // 🧙 Summoning the user from the cookie realm!
    const currentIsoWeek = dayjs().isoWeek(); // 📅 What week is it? Let's find out!
    const currentYear = dayjs().year(); // 🗓️ Current year, because time flies! 🕰️
    const attendances = await getAttendancesPerUser(user.id, currentIsoWeek, currentYear); // 📋 Getting that attendance report card!
    let missingStudyTimes: Array<string> = new Array(); // 📝 The "naughty list" of missed study times! 🎅
    if (!user.needs) user.needs = []; // 🛡️ Safety first! No undefined arrays on my watch!
    // 🔄 Loop-de-loop through all the needed study times! 🎢
    user.needs.forEach((neededStudyTime) => {
        const foundAttendance = attendances.find((attendanceData) => {
            const type = attendanceData.attendance.type;
            // 🔍 Detective work: stripping away the prefixes to find the truth! 🕵️
            return type && type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime;
        });
        if (!foundAttendance) missingStudyTimes.push(neededStudyTime); // 😢 Sorry buddy, you missed this one!
    });
    // ✅ Filter out the completed study times - YOU DID IT! 🎉
    const completedStudyTimes = attendances.filter((attendance) => attendance.attendance.type !== null && attendance.attendance.type !== "Unterricht");
    // 🤔 The mysterious attendances without a type - What are you, really? 
    const attendancesWithoutType = attendances.filter((attendance) => attendance.attendance.type === null);
    return (
        <div>
            <h1>Übersicht</h1> {/* 📊 Overview time! Let's see what you've been up to! 👀 */}
            <p>Hallo {user.displayname}</p> {/* 👋 Hello there, fancy seeing you here! */}
            {/* 📈 Progress report! Are we winning yet? 🏆 */}
            <p>{String(completedStudyTimes.length) + "/" + String(user.needs.length)} Studienzeiten besucht</p>
            {/* 🏃 Sponsorenlauf module - RUN FOREST, RUN! 🌲 */}
            {config_data.MODULES.SPONSORENLAUF && (
                <p>{await getRoundCountForUser(user.id)} Runden gelaufen!</p> // 🔄 Round and round we go!
            )}
            {/* 🎯 Special access to the running module! Feel special yet? 😎 */}
            { config_data.MODULES.SPONSORENLAUF && user.permission !== 0 && (
                <p className="mt-2"><a href="/dashboard/modules/sponsorenlauf" className="btn">Zum Sponsorenlauf</a></p>
            )}
            {/* 🎨 The glorious grid of components! Responsive AF! 📱💻🖥️ */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
                <MissingStudyTimes missingStudyTimes={missingStudyTimes} /> {/* ❌ The hall of shame! */}
                <CompletedStudyTimes attendances={completedStudyTimes} /> {/* ✅ The hall of fame! */}
                <AttendancesWithoutType attendances={attendancesWithoutType} /> {/* 🤷 The hall of confusion! */}
            </div>
        </div>
    );
}

export default DashboardPage; // 🎭 Exporting the star of the show! Take a bow! 🎬

// 🏷️ Metadata: Because SEO is our friend! (or frenemy?) 🤝
export const metadata: Metadata = {
    title: "Übersicht - CheckIN-System", // 📛 The page title - short, sweet, and to the point!
    description: "Die Übersicht des CheckIN-Systems", // 📝 Description for the search engine overlords! 🤖
}