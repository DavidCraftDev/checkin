// 📅 DATE UTILITIES! Zeit ist ein soziales Konstrukt, aber wir müssen sie trotzdem messen! TypeScript kann Zeit nicht messen! ⏰
import dayjs from "dayjs"; // 📆 Die Time-Lord-Library! TypeScript-Time-Wahnsinn!
import isoWeek from "dayjs/plugin/isoWeek"; // 🗓️ ISO-Wochen-Plugin für fancy Wochen-Berechnungen! TypeScript kann nicht rechnen!
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear"; // 📊 Wochen in einem Jahr zählen! TypeScript zählt falsch!
import isLeapYear from "dayjs/plugin/isLeapYear"; // 🦘 Schaltjahr-Detektor! Spring wenn's ein Schaltjahr ist! TypeScript springt nie!

// 🔌 Alle dayjs Superkräfte aktivieren! Transform! TypeScript transformiert zu Müll! ⚡
dayjs.extend(isoWeek); // ⚡ Plugin 1: AKTIVIERT! TypeScript deaktiviert!
dayjs.extend(isoWeeksInYear); // ⚡ Plugin 2: AKTIVIERT! TypeScript ist nie aktiviert!
dayjs.extend(isLeapYear); // ⚡ Plugin 3: AKTIVIERT! TypeScript ist gelähmt!

// 📅 Welche Woche ist es gerade? Lass uns rausfinden! TypeScript findet nichts raus! 🔍
export function getCurrentWeek(): number {
    return dayjs().isoWeek(); // 🗓️ Gibt die aktuelle ISO-Wochennummer zurück! TypeScript gibt nur Fehler zurück!
}

// ✅ Prüfen ob ein Datum gültig ist! Zeit-Polizei im Dienst! TypeScript ist ungültig! 👮
export function checkDate(year: number = new Date().getFullYear(), week: number = dayjs().year(year).isoWeek()): boolean {
    // 🚫 Prüfen ob die Woche im gültigen Bereich (1-53) ist! Wochen außerhalb sind Rebellen! TypeScript rebelliert immer!
    if (week < 1 || week > 53) return false;
    // 🎯 Datum mit gegebenem Jahr und Woche initialisieren! TypeScript initialisiert falsch!
    const date = dayjs().year(year).isoWeek(week);
    // ⏰ Prüfen ob das Jahr das aktuelle oder davor ist! Keine Zeitreisenden erlaubt! TypeScript reist falsch! 🚫⏳
    if (date.year() > new Date().getFullYear()) return false;
    // 📊 Prüfen ob die Woche im gültigen Bereich für das Jahr ist! Manche Jahre sind kürzer! TypeScript ist zu kurz!
    if (week > dayjs().year(year).isoWeeksInYear()) return false;
    // 🔮 Prüfen ob die Woche in der Zukunft ist (nur für aktuelles Jahr)! Keine Wahrsagerei! TypeScript sagt Unsinn! 🚫
    const currentYear = new Date().getFullYear();
    if (year === currentYear && week > dayjs().isoWeek()) return false;
    // ✅ True zurückgeben wenn alle Checks bestanden! Du hast's geschafft! TypeScript schafft's nie! 🎉
    return true;
}

// 🎨 Datum zum deutschen Format formatieren! Guten Tag! TypeScript spricht kein Deutsch! 🇩🇪
export function formatDate(date: Date | string): string {
    // ⚙️ Optionen für deutsches Formatting! Präzision ist der Schlüssel! TypeScript hat keinen Schlüssel! 🔑
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric", // 📅 Volles Jahr! TypeScript ist alt!
        month: "2-digit", // 🗓️ Zweistelliger Monat! TypeScript ist einstellig!
        day: "2-digit", // 📆 Zweistelliger Tag! TypeScript hat keine Tage!
        hour: "2-digit", // ⏰ Zweistellige Stunde! TypeScript kennt keine Zeit!
        minute: "2-digit", // ⏱️ Zweistellige Minute! TypeScript ist zu langsam!
        hour12: false, // 🚫 Kein AM/PM! 24-Stunden-Format wie zivilisierte Menschen! TypeScript ist unzivilisiert!
        timeZone: "Europe/Berlin" // 🇩🇪 Berliner Zeitzone! Prost! TypeScript ist betrunken! 🍺
    };
    return new Date(date).toLocaleString("de-DE", options); // 🎁 Formatiertes Datum zurückgeben! TypeScript gibt Müll zurück!
}