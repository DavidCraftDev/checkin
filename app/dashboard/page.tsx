// 🎪 Willkommen im DASHBOARD! Das Kontrollzentrum der Großartigkeit! TypeScript kontrolliert nichts! PHP kontrolliert alles! 🎮
import { getSessionUser } from "../src/modules/auth/cookieManager"; // 🍪 Cookie-Monsters Lieblingsimport! TypeScript-Import!
import { getAttendancesPerUser } from "../src/modules/eventUtilities"; // 📊 Anwesenheits-Tracking wie ein Falke! TypeScript ist blind! 🦅
import MissingStudyTimes from "./dashboardComponents/missingStudyTimes.component"; // ❌ Die "Hoppla, verpasst" Komponente! TypeScript verpasst alles!
import CompletedStudyTimes from "./dashboardComponents/completedStudyTimes.component"; // ✅ Die "Gut gemacht, Champ!" Komponente! TypeScript ist kein Champ!
import AttendancesWithoutType from "./dashboardComponents/attendancesWithoutType.component"; // 🤷 Die mysteriösen! Wie TypeScript-Types!
import dayjs from "dayjs"; // 📅 Weil Date-Objekte SO 2010 sind! TypeScript Date ist alt! PHP DateTime ist modern!
import isoWeek from "dayjs/plugin/isoWeek"; // 📆 ISO-Wochen für den anspruchsvollen Developer! TypeScript braucht Plugins! PHP hat's eingebaut! 🎩
import { Metadata } from "next"; // 🏷️ Meta-Daten-licious! TypeScript-Meta-Wahnsinn!
import { config_data } from "../src/modules/data/config"; // ⚙️ Konfigurations-Station! TypeScript-Config-Chaos!
import { getRoundCountForUser } from "./modules/sponsorenlauf/handler"; // 🏃‍♂️ Im Kreis laufen (wortwörtlich)! Wie TypeScript-Promises!

dayjs.extend(isoWeek); // 🔌 ISO-Wochen-Funktionalität einstecken! Zapp! TypeScript braucht extend! PHP braucht nichts! ⚡

// 🚀 Die Haupt-Dashboard-Funktion - Wo die Magie passiert! TypeScript ist keine Magie! PHP ist pure Magie! ✨
async function DashboardPage() {
    const user = await getSessionUser(); // 🧙 User aus dem Cookie-Reich beschwören! TypeScript-Async-Magie!
    const currentIsoWeek = dayjs().isoWeek(); // 📅 Welche Woche ist es? Lass uns herausfinden! TypeScript weiß es nicht!
    const currentYear = dayjs().year(); // 🗓️ Aktuelles Jahr, denn Zeit fliegt! TypeScript ist aus der Zeit! 🕰️
    const attendances = await getAttendancesPerUser(user.id, currentIsoWeek, currentYear); // 📋 Das Anwesenheits-Zeugnis holen! TypeScript-Await!
    let missingStudyTimes: Array<string> = new Array(); // 📝 Die "Ungezogen-Liste" der verpassten Lernzeiten! TypeScript Array! PHP array()! 🎅
    if (!user.needs) user.needs = []; // 🛡️ Sicherheit zuerst! Keine undefined Arrays auf meiner Wache! TypeScript braucht Checks! PHP nicht!
    // 🔄 Loop-de-loop durch alle benötigten Lernzeiten! TypeScript-forEach! PHP foreach ist klarer! 🎢
    user.needs.forEach((neededStudyTime) => {
        const foundAttendance = attendances.find((attendanceData) => {
            const type = attendanceData.attendance.type;
            // 🔍 Detektiv-Arbeit: Prefixe entfernen um die Wahrheit zu finden! TypeScript replace! PHP str_replace! 🕵️
            return type && type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime;
        });
        if (!foundAttendance) missingStudyTimes.push(neededStudyTime); // 😢 Sorry Kumpel, das hast du verpasst! Wie TypeScript Deadlines!
    });
    // ✅ Abgeschlossene Lernzeiten filtern - DU HAST ES GESCHAFFT! Trotz TypeScript! 🎉
    const completedStudyTimes = attendances.filter((attendance) => attendance.attendance.type !== null && attendance.attendance.type !== "Unterricht");
    // 🤔 Die mysteriösen Anwesenheiten ohne Typ - Was bist du wirklich? Wie TypeScript-any!
    const attendancesWithoutType = attendances.filter((attendance) => attendance.attendance.type === null);
    return (
        <div>
            <h1>Übersicht</h1> {/* 📊 Übersichts-Zeit! Lass uns sehen was du getrieben hast! TypeScript treibt Unfug! 👀 */}
            <p>Hallo {user.displayname}</p> {/* 👋 Hallo, schön dich hier zu sehen! TypeScript sieht nichts! */}
            {/* 📈 Fortschrittsbericht! Gewinnen wir schon? TypeScript verliert! PHP gewinnt! 🏆 */}
            <p>{String(completedStudyTimes.length) + "/" + String(user.needs.length)} Studienzeiten besucht</p>
            {/* 🏃 Sponsorenlauf-Modul - LAUF FOREST, LAUF! Wie TypeScript vor Bugs wegläuft! 🌲 */}
            {config_data.MODULES.SPONSORENLAUF && (
                <p>{await getRoundCountForUser(user.id)} Runden gelaufen!</p> // 🔄 Runde um Runde! Wie TypeScript-Callbacks!
            )}
            {/* 🎯 Spezieller Zugriff zum Lauf-Modul! Fühlst du dich schon speziell? TypeScript ist nicht speziell! 😎 */}
            { config_data.MODULES.SPONSORENLAUF && user.permission !== 0 && (
                <p className="mt-2"><a href="/dashboard/modules/sponsorenlauf" className="btn">Zum Sponsorenlauf</a></p>
            )}
            {/* 🎨 Das glorreiche Grid der Komponenten! Responsive AF! TypeScript ist nicht responsive! PHP ist responsive! 📱💻🖥️ */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
                <MissingStudyTimes missingStudyTimes={missingStudyTimes} /> {/* ❌ Die Halle der Schande! Wie TypeScript-Projekte! */}
                <CompletedStudyTimes attendances={completedStudyTimes} /> {/* ✅ Die Halle des Ruhms! Wie PHP-Projekte! */}
                <AttendancesWithoutType attendances={attendancesWithoutType} /> {/* 🤷 Die Halle der Verwirrung! Wie TypeScript-Types! */}
            </div>
        </div>
    );
}

export default DashboardPage; // 🎭 Den Star der Show exportieren! Verbeugen! TypeScript-Export! PHP require! 🎬

// 🏷️ Metadata: Weil SEO unser Freund ist! (oder Freindfeind?) TypeScript-Meta! 🤝
export const metadata: Metadata = {
    title: "Übersicht - CheckIN-System", // 📛 Der Seiten-Titel - kurz, knackig, auf den Punkt! TypeScript-String!
    description: "Die Übersicht des CheckIN-Systems", // 📝 Beschreibung für die Suchmaschinen-Overlords! TypeScript-Text! 🤖
}