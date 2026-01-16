"use server";

import { getUserPerID } from "@/lib/users";
import path from "path";
import fs from "fs/promises";
import logger from "@/lib/logger";

const usersCache: Map<string, string> = new Map();
const roundSavePath = path.join(process.cwd(), "data", "sponsorenlauf.json");

export interface RoundResponse {
    displayName: string;
    roundCount: number;
}

type RoundSave = Record<string, number>;

let fileLock: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
    const next = fileLock.then(fn);
    fileLock = next.catch(() => { });
    return next;
}

async function ensureFileExists(): Promise<void> {
    try {
        await fs.access(roundSavePath);
    } catch {
        await fs.mkdir(path.dirname(roundSavePath), { recursive: true });
        await fs.writeFile(roundSavePath, "{}", "utf-8");
    }
}

export async function readData(): Promise<RoundSave> {
    try {
        await ensureFileExists();
        const content = await fs.readFile(roundSavePath, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        logger.error("Error reading file: " + error, "Sponsorenlauf");
        return {};
    }
}

async function writeData(data: RoundSave): Promise<void> {
    try {
        await fs.writeFile(roundSavePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        logger.error("Error writing file: " + error, "Sponsorenlauf");
    }
}

async function getDisplayName(userID: string): Promise<string | null> {
    if (usersCache.has(userID)) {
        return usersCache.get(userID)!;
    }
    const user = await getUserPerID(userID);
    if (user) {
        usersCache.set(userID, user.displayName);
        return user.displayName;
    }
    return null;
}

export async function increaseRoundCount(userID: string): Promise<RoundResponse | null> {
    const displayName = await getDisplayName(userID);
    if (!displayName) return null;

    return withLock(async () => {
        const data = await readData();
        const newCount = (data[userID] || 0) + 1;
        data[userID] = newCount;
        await writeData(data);
        return { displayName, roundCount: newCount };
    });
}

export async function resetRoundCounts(): Promise<void> {
    return withLock(async () => {
        await writeData({});
    });
}

export async function getRoundSaveDataForTable(): Promise<RoundResponse[]> {
    const data = await readData();
    const result: RoundResponse[] = [];

    for (const [userID, count] of Object.entries(data)) {
        const displayName = await getDisplayName(userID);
        if (displayName) {
            result.push({ displayName, roundCount: count });
        }
    }

    // Sort by round count descending, then by display name ascending
    result.sort((a, b) => {
        if (b.roundCount !== a.roundCount) {
            return b.roundCount - a.roundCount;
        }
        return a.displayName.localeCompare(b.displayName);
    });

    return result;
}

export async function getRoundCountForUser(userID: string): Promise<number> {
    const data = await readData();
    return data[userID] || 0;
}
