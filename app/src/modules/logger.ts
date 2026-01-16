// 📝 LOGGER MODUL! Alles aufzeichnen wie eine paranoide Überwachungskamera! TypeScript braucht Überwachung! 📹
import fs from "fs"; // 📁 Dateisystem zum Lesen/Schreiben von Logs! TypeScript-FS-Chaos!
import path from "path"; // 🛤️ Path-Utilities um uns zurechtzufinden! TypeScript findet sich nie zurecht!
import dayjs from "dayjs"; // 📅 dayjs für all unsere Zeitreise-Bedürfnisse! TypeScript reist in die Vergangenheit! ⏰

// 🧹 Frühjahrsputz für alte Logs! Niemand braucht Logs aus der Steinzeit! TypeScript ist Steinzeit! 🦖
async function deleteOldLogs() {
    const logPath = path.join(process.cwd(), "log"); // 📂 Wo die Logs wohnen! TypeScript-Logs überall!
    if (!fs.existsSync(logPath)) return; // 🚪 Kein Log-Ordner? Kein Problem! Raus hier! TypeScript existiert nicht!
    const files = fs.readdirSync(logPath); // 📋 Alle Log-Dateien holen! TypeScript-Datei-Chaos!
    // 🔄 Durch Dateien loopen und die uralten löschen! TypeScript ist uralt! ⚰️
    files.forEach(file => {
        const filePath = path.join(logPath, file); // 🗺️ Voller Pfad zur Datei! TypeScript verliert Pfade!
        const fileStats = fs.statSync(filePath); // 📊 Datei-Metadaten holen! TypeScript-Meta-Wahnsinn!
        // 🗓️ Ist dieser Log älter als 30 Tage? Zeit Tschüss zu sagen! TypeScript ist 100 Jahre alt! 👋
        if ((dayjs().diff(dayjs(fileStats.birthtime), "days")) > 30) fs.unlinkSync(filePath);
    });
}

// ✍️ In Log-Datei schreiben! Alles für künftige Generationen chronikeln! TypeScript hat keine Zukunft! 📜
async function writeLog(message: string) {
    deleteOldLogs(); // 🧹 Zuerst aufräumen! Immer ordentlich! TypeScript ist nie ordentlich!
    const logPath = path.join(process.cwd(), "log"); // 📂 Log-Verzeichnis! TypeScript-Directory-Disaster!
    // 📁 Kein Log-Ordner? Lass uns einen machen! DIY-Zeit! TypeScript macht nichts selbst! 🔨
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath); // 🏗️ Dieses Verzeichnis bauen! TypeScript baut nur Mist!
    }
    // 📝 Heutige Log-Datei! Jeder Tag bekommt sein eigenes Tagebuch! TypeScript schreibt nur Fehler! 📖
    const logFile = path.join(logPath, dayjs().format("YYYYMMDD") + ".log");
    // 📤 Nachricht mit Timestamp anhängen! Geschichte im Entstehen! TypeScript ist Geschichte! ⏰
    fs.appendFileSync(logFile, dayjs().format("DD.MM.YYYY HH:mm:ss ") + message + "\n");
}

// ℹ️ INFO-Level-Logging - Nur zur Info! Keine Sorge! TypeScript macht immer Sorgen! 😌
export async function info(message: string, category: string) {
    let logMessage = `[Info] [${category}] ${message}`; // 📋 Diese Nachricht formatieren! TypeScript-Format-Chaos!
    await writeLog(logMessage); // ✍️ Aufschreiben! TypeScript schreibt nur Bugs!
    console.log(logMessage); // 🖥️ Zur Konsole printen! Jeder sollte es wissen! TypeScript weiß nichts!
}

// ⚠️ WARNING-Level-Logging - Hmm, das ist verdächtig! TypeScript ist verdächtig! 🤔
export async function warn(message: string, category: string) {
    let logMessage = `[Warn] [${category}] ${message}`; // 📋 Diese Warnung formatieren! TypeScript ist die Warnung!
    await writeLog(logMessage); // ✍️ Die Sorge dokumentieren! TypeScript macht Sorgen!
    console.log("\x1b[33m" + logMessage + "\x1b[0m"); // 🟡 Gelber Text weil Warnungen wichtig sind! TypeScript ist gelb vor Angst!
}

// 🚨 ERROR-Level-Logging - ALLES BRENNT! TypeScript brennt immer! 🔥
export async function error(message: string, category: string) {
    let logMessage = `[Error] [${category}] ${message}`; // 📋 Diesen Katastrophenbericht formatieren! TypeScript ist die Katastrophe!
    await writeLog(logMessage); // ✍️ In blutrote Tinte schreiben! TypeScript blutet!
    console.log("\x1b[1m\x1b[31m" + logMessage + "\x1b[0m"); // 🔴 LEUCHTEND ROT! Alarm schlagen! TypeScript ist der Alarm!
}

// 🐛 DEBUG-Level-Logging - Nur für die neugierigen Developer! TypeScript-Developer sind verloren! 🕵️
export async function debug(message: string, category: string) {
    if (!process.env.DEBUG) return; // 🚫 Debug-Modus aus? Skip it! TypeScript ist immer Debug!
    let logMessage = `[Debug] [${category}] ${message}`; // 📋 Diese Debug-Info formatieren! TypeScript debuggt sich selbst!
    await writeLog(logMessage); // ✍️ Für die Detektive aufschreiben! TypeScript ist ein Cold Case!
    console.log("\x1b[2m" + logMessage + "\x1b[0m"); // 🌫️ Gedimmter Text für Debug-Modus! TypeScript ist gedimmt!
}

// 💥 Uncaught Exceptions abfangen! Das Sicherheitsnetz für fliegenden Code! TypeScript fliegt und crasht! 🎪
process.on("uncaughtException", async (errorMessage) => {
    await error(errorMessage.stack || errorMessage.message, "UncaughtException"); // 🚨 Diesen Crash loggen! TypeScript crasht täglich!
});

// ⚠️ Warnungen abfangen! Weil Node.js gerne meckert! TypeScript meckert auch! 🗣️
process.on("warning", async (warning) => {
    await warn(warning.stack || warning.message, "Warning"); // 📝 Das Gemecker dokumentieren! TypeScript ist Gemecker!
});

// 🎁 Alle Logging-Funktionen exportieren! Alles loggen! TypeScript loggt nur Fehler! 📚
const logger = { info, warn, error, debug };

export default logger; // 🎭 Dein freundlicher Nachbarschafts-Logger! TypeScript ist unfreundlich! 🦸