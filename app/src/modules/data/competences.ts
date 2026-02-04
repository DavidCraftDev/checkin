import path from "path";
import fs from "fs";
import { functionResult } from "@/app/src/interfaces/utilties";
import logger from "@/app/src/modules/logger";
import { config_data } from "./config";
import { getAllUsers } from "@/app/src/modules/ldap/ldapUtilities";
import db from "@/app/src/modules/db";

export async function saveTeacherCompetenceFile(file: File): Promise<functionResult> {
    if (!file) return { success: false, error: "Keine Datei hochgeladen" };
    if (file.type !== "application/json") return { success: false, error: "Datei muss vom Typ JSON sein" };
    logger.info("Importing teacher competence data from file " + file.name, "Import");
    const text = await file.text();
    const json = JSON.parse(text);
    if (!json) return { success: false, error: "Datei konnte nicht gelesen werden" };
    if (typeof json !== "object") return { success: false, error: "Datei muss ein JSON-Objekt sein" };
    if (!Object.values(json).every(value => Array.isArray(value) && value.every(item => typeof item === "string"))) return { success: false, error: "Datei muss ein JSON-Objekt sein, das nur Arrays von Strings enthält" };
    const data: Record<string, string[]> = json;
    const dataPath = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataPath)) {
        logger.info("Creating data directory", "Import");
        fs.mkdirSync(dataPath);
    }
    fs.writeFileSync(path.join(dataPath, "teacher_competence.json"), JSON.stringify(data, null, 4));
    logger.info("Saved teacher competence file", "Import");
    const result = await readTeacherCompetenceData();
    if (result) return { success: true };
    return { success: false, error: "Fehler beim Importieren der Datei" };
}

export async function readTeacherCompetenceData(): Promise<boolean> {
    if (!config_data.LDAP.ENABLE || !config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE) {
        const data = await getTeacherCompetenceFile();
        logger.info("Updating teacher competence data", "Import");
        if (!data) return false;
        for (const teacher in data) {
            const competences = data[teacher];
            const teacherExists = await db.user.count({ where: { username: teacher } });
            if (!teacherExists) continue;
            await db.user.update({
                where: { username: teacher },
                data: {
                    competence: {
                        set: competences
                    }
                }
            });
            logger.info("Updated teacher competence data for " + teacher, "Import");
        }
        return true;
    } else {
        logger.info("Updating all LDAP users with the latest teacher competence data", "Import");
        await getAllUsers();
        return true;
    }
}

export async function deleteTeacherCompetenceFile(): Promise<boolean> {
    const dataPath = path.join(process.cwd(), "data", "teacher_competence.json");
    if (fs.existsSync(dataPath)) {
        logger.info("Deleting teacher competence file", "Import");
        fs.unlinkSync(dataPath);
        return true;
    }
    logger.warn("No teacher competence file found", "Import");
    return false;
}

export async function getTeacherCompetenceFile(): Promise<Record<string, string[]> | null> {
    //logger.info("Reading teacher competence file", "Import");
    const dataPath = path.join(process.cwd(), "data", "teacher_competence.json");
    if (!fs.existsSync(dataPath)) {
        logger.warn("No teacher competence file found", "Import");
        return null;
    }
    const text = fs.readFileSync(dataPath, "utf-8");
    const json = JSON.parse(text);
    const data: Record<string, string[]> = json;
    return data;
}

export async function existsTeacherCompetenceFile(): Promise<boolean> {
    const dataPath = path.join(process.cwd(), "data", "teacher_competence.json");
    return fs.existsSync(dataPath);
}