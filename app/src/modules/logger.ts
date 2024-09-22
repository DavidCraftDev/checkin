import "server-only";

import fs from "fs";
import path from "path";
import dayjs from "dayjs";

async function writeLog(message: string) {
    const logPath = path.join(process.cwd(), "log");
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath);
    }
    const logFile = path.join(logPath, dayjs().format("YYYYMMDD") + ".log");
    fs.appendFileSync(logFile, dayjs().format("DD.MM.YYYY HH:mm:ss ") + message + "\n");
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

process.on("uncaughtException", async (errorMessage) => {
    await error(errorMessage.toString(), "UncaughtException");
});

export default { info, warn, error };