// 📝 LOGGER MODULE! Recording everything like a paranoid security camera! 📹
import fs from "fs"; // 📁 File system for reading/writing logs!
import path from "path"; // 🛤️ Path utilities for finding our way around!
import dayjs from "dayjs"; // 📅 dayjs for all our time-traveling needs! ⏰

// 🧹 Spring cleaning for old logs! Nobody needs logs from the stone age! 🦖
async function deleteOldLogs() {
    const logPath = path.join(process.cwd(), "log"); // 📂 Where the logs live!
    if (!fs.existsSync(logPath)) return; // 🚪 No log folder? No problem! Bail out!
    const files = fs.readdirSync(logPath); // 📋 Get all the log files!
    // 🔄 Loop through files and delete the ancient ones! ⚰️
    files.forEach(file => {
        const filePath = path.join(logPath, file); // 🗺️ Full path to the file!
        const fileStats = fs.statSync(filePath); // 📊 Get file metadata!
        // 🗓️ Is this log older than 30 days? Time to say goodbye! 👋
        if ((dayjs().diff(dayjs(fileStats.birthtime), "days")) > 30) fs.unlinkSync(filePath);
    });
}

// ✍️ Write to the log file! Chronicling everything for future generations! 📜
async function writeLog(message: string) {
    deleteOldLogs(); // 🧹 Clean up first! Always tidy!
    const logPath = path.join(process.cwd(), "log"); // 📂 Log directory!
    // 📁 No log folder? Let's make one! DIY time! 🔨
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath); // 🏗️ Build that directory!
    }
    // 📝 Today's log file! Each day gets its own diary! 📖
    const logFile = path.join(logPath, dayjs().format("YYYYMMDD") + ".log");
    // 📤 Append the message with a timestamp! History in the making! ⏰
    fs.appendFileSync(logFile, dayjs().format("DD.MM.YYYY HH:mm:ss ") + message + "\n");
}

// ℹ️ INFO level logging - Just FYI! Nothing to worry about! 😌
export async function info(message: string, category: string) {
    let logMessage = `[Info] [${category}] ${message}`; // 📋 Format that message!
    await writeLog(logMessage); // ✍️ Write it down!
    console.log(logMessage); // 🖥️ Print it to console! Everyone should know!
}

// ⚠️ WARNING level logging - Hmm, that's suspicious! 🤔
export async function warn(message: string, category: string) {
    let logMessage = `[Warn] [${category}] ${message}`; // 📋 Format that warning!
    await writeLog(logMessage); // ✍️ Document the concern!
    console.log("\x1b[33m" + logMessage + "\x1b[0m"); // 🟡 Yellow text because warnings are important!
}

// 🚨 ERROR level logging - EVERYTHING IS ON FIRE! 🔥
export async function error(message: string, category: string) {
    let logMessage = `[Error] [${category}] ${message}`; // 📋 Format that disaster report!
    await writeLog(logMessage); // ✍️ Write it in blood red ink!
    console.log("\x1b[1m\x1b[31m" + logMessage + "\x1b[0m"); // 🔴 BRIGHT RED! Sound the alarms!
}

// 🐛 DEBUG level logging - Only for the curious developers! 🕵️
export async function debug(message: string, category: string) {
    if (!process.env.DEBUG) return; // 🚫 Debug mode off? Skip it!
    let logMessage = `[Debug] [${category}] ${message}`; // 📋 Format that debug info!
    await writeLog(logMessage); // ✍️ Write it down for the detectives!
    console.log("\x1b[2m" + logMessage + "\x1b[0m"); // 🌫️ Dimmed text for debug mode!
}

// 💥 Catch uncaught exceptions! The safety net for flying code! 🎪
process.on("uncaughtException", async (errorMessage) => {
    await error(errorMessage.stack || errorMessage.message, "UncaughtException"); // 🚨 Log that crash!
});

// ⚠️ Catch warnings! Because Node.js likes to complain! 🗣️
process.on("warning", async (warning) => {
    await warn(warning.stack || warning.message, "Warning"); // 📝 Document the grumbling!
});

// 🎁 Export all the logging functions! Log everything! 📚
const logger = { info, warn, error, debug };

export default logger; // 🎭 Your friendly neighborhood logger! 🦸