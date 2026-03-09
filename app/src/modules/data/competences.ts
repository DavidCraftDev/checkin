import path from "path";
import fs from "fs";
import { functionResult } from "@/app/src/interfaces/utilties";
import logger from "@/app/src/modules/logger";
import { config_data } from "./config";
import { getAllUsers } from "@/app/src/modules/ldap/ldapUtilities";
import db from "@/app/src/modules/db";

export async function saveTeacherCompetenceFile(file: File): Promise<functionResult> {
    if (!file) return { success: false, error: "Keine Akte wurde der Behörde übergeben" };
    if (file.type !== "application/json") return { success: false, error: "Datei muss vom Typ JSON sein" };
    logger.info("Die Kompetenzen der Lehrenden werden aus der Akte '" + file.name + "' in die Register überführt", "Import");
    const text = await file.text();
    const json = JSON.parse(text);
    if (!json) return { success: false, error: "Die Akte entzieht sich jeder Lesbarkeit" };
    if (typeof json !== "object") return { success: false, error: "Die Akte muss die Form eines JSON-Objekts annehmen — so will es die Vorschrift" };
    if (!Object.values(json).every(value => Array.isArray(value) && value.every(item => typeof item === "string"))) return { success: false, error: "Die Akte muss ein JSON-Objekt sein, das ausschließlich Listen von Zeichenketten enthält — die Bürokratie ist unerbittlich" };
    const data: Record<string, string[]> = json;
    const dataPath = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataPath)) {
        logger.info("Das Datenarchiv wird aus dem Nichts erschaffen", "Import");
        fs.mkdirSync(dataPath);
    }
    fs.writeFileSync(path.join(dataPath, "teacher_competence.json"), JSON.stringify(data, null, 4));
    logger.info("Die Kompetenzakte der Lehrenden wurde in den Archiven abgelegt", "Import");
    const result = await readTeacherCompetenceData();
    if (result) return { success: true };
    return { success: false, error: "Die Akte konnte nicht in die Register überführt werden — ein unsichtbares Hindernis" };
}

export async function readTeacherCompetenceData(): Promise<boolean> {
    if (!config_data.LDAP.ENABLE || !config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE) {
        const data = await getTeacherCompetenceFile(true);
        logger.info("Die Kompetenzdaten der Lehrenden werden einer Revision unterzogen", "Import");
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
            logger.info("Die Kompetenzen von " + teacher + " wurden in den Akten aktualisiert", "Import");
        }
        return true;
    } else {
        logger.info("Alle LDAP-Wesen werden mit den neuesten Kompetenzdaten aus den Archiven versehen", "Import");
        await getAllUsers();
        return true;
    }
}

export async function deleteTeacherCompetenceFile(): Promise<boolean> {
    const dataPath = path.join(process.cwd(), "data", "teacher_competence.json");
    if (fs.existsSync(dataPath)) {
        logger.info("Die Kompetenzakte der Lehrenden wird aus den Archiven entfernt", "Import");
        fs.unlinkSync(dataPath);
        return true;
    }
    logger.warn("Keine Kompetenzakte der Lehrenden in den Archiven gefunden", "Import");
    return false;
}

const teacherCompetenceFileData: Record<string, string[]> = {};
const dataPath: string = path.join(process.cwd(), "data", "teacher_competence.json");

export async function getTeacherCompetenceFile(forceUpdate: boolean = false): Promise<Record<string, string[]> | null> {
    if (!forceUpdate && Object.keys(teacherCompetenceFileData).length > 0) {
        return teacherCompetenceFileData;
    }
    if (!fs.existsSync(dataPath)) {
        logger.warn("Keine Kompetenzakte der Lehrenden in den Archiven gefunden", "Import");
        return null;
    }
    logger.info("Die Kompetenzakte der Lehrenden wird aus den Archiven konsultiert", "Import");
    const text = fs.readFileSync(dataPath, "utf-8");
    const json = JSON.parse(text);
    const data: Record<string, string[]> = json;
    Object.assign(teacherCompetenceFileData, data);
    return data;
}

export async function existsTeacherCompetenceFile(): Promise<boolean> {
    const dataPath = path.join(process.cwd(), "data", "teacher_competence.json");
    return fs.existsSync(dataPath);
}