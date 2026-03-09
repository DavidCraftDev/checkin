import fs from "fs";
import path from "path";
import dayjs from "dayjs";

let lastCleanup = 0;

const logger = { info, warn, error, debug };

async function deleteOldLogs() {
    try {
        const logPath = path.join(process.cwd(), "log");
        if (!fs.existsSync(logPath)) return;
        const files = fs.readdirSync(logPath);
        files.forEach(file => {
            const filePath = path.join(logPath, file);
            const fileStats = fs.statSync(filePath);
            if ((dayjs().diff(dayjs(fileStats.birthtime), "days")) > 30) fs.unlinkSync(filePath);
        });
    } catch (e) {
        logger.error("Die alten Protokolle widerstehen ihrer Vernichtung: " + e, "Logger");
    }
}

async function writeLog(message: string) {
    if (Date.now() - lastCleanup > 86400000) { // Run cleanup once every 24 hours
        // Fire and forget
        deleteOldLogs();
        lastCleanup = Date.now();
    }

    const logPath = path.join(process.cwd(), "log");
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath);
    }
    const logFile = path.join(logPath, dayjs().format("YYYYMMDD") + ".log");
    // Use async appendFile to avoid blocking the event loop and await its completion
    try {
        await fs.promises.appendFile(
            logFile,
            dayjs().format("DD.MM.YYYY HH:mm:ss ") + message + "\n"
        );
    } catch (err) {
        console.error("Das Protokoll verweigert die Niederschrift — die Worte verhallen ungehört", err);
    }
}

export async function info(message: string, category: string) {
    let logMessage = `[Info] [${category}] ${message}`;
    await writeLog(logMessage);
    console.log(logMessage);
}

export async function warn(message: string, category: string) {
    let logMessage = `[Warn] [${category}] ${message}`;
    await writeLog(logMessage);
    console.log("\x1b[33m" + logMessage + "\x1b[0m");
}

export async function error(message: string, category: string) {
    let logMessage = `[Error] [${category}] ${message}`;
    await writeLog(logMessage);
    console.log("\x1b[1m\x1b[31m" + logMessage + "\x1b[0m");
}

export async function debug(message: string, category: string) {
    if (!process.env.DEBUG) return;
    let logMessage = `[Debug] [${category}] ${message}`;
    await writeLog(logMessage);
    console.log("\x1b[2m" + logMessage + "\x1b[0m");
}

process.on("uncaughtException", async (errorMessage) => {
    await error(errorMessage.stack || errorMessage.message, "UncaughtException");
});

process.on("warning", async (warning) => {
    await warn(warning.stack || warning.message, "Warning");
});

export default logger;