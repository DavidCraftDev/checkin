// 🎓 COMPETENCES DATA MODULE! Managing teacher competencies! 📚
import path from "path"; // 🛤️ Path utilities!
import fs from "fs"; // 📁 File system operations!
import { functionResult } from "../../interfaces/utilties"; // ✅ Function result interface!
import logger from "../logger"; // 📝 Logger for tracking!
import { config_data } from "./config"; // ⚙️ Configuration data!
import { getAllUsers } from "../ldap/ldapUtilities"; // 👥 LDAP user list!
import db from "../db"; // 🗄️ Database connection!

// 💾 Save teacher competence file! Upload that JSON! 📤
export async function saveTeacherCompetenceFile(file: File): Promise<functionResult> {
    if (!file) return { success: false, error: "Keine Datei hochgeladen" }; // 🚫 No file? Error!
    if (file.type !== "application/json") return { success: false, error: "Datei muss vom Typ JSON sein" }; // 🚫 Not JSON? Nope!
    logger.info("Importing teacher competence data from file " + file.name, "Import"); // 📝 Log the import!
    const text = await file.text(); // 📖 Read file content!
    const json = JSON.parse(text); // 🔄 Parse JSON! Transform!
    if (!json) return { success: false, error: "Datei konnte nicht gelesen werden" }; // 🚫 Parse failed!
    if (typeof json !== "object") return { success: false, error: "Datei muss ein JSON-Objekt sein" }; // 🚫 Not an object!
    // ✅ Validate structure! Must be object with arrays of strings! Type safety FTW! 🎯
    if (!Object.values(json).every(value => Array.isArray(value) && value.every(item => typeof item === "string"))) return { success: false, error: "Datei muss ein JSON-Objekt sein, das nur Arrays von Strings enthält" };
    const data: Record<string, string[]> = json; // 📦 Type-cast to proper structure!
    const dataPath = path.join(process.cwd(), "data"); // 📂 Data directory path!
    // 📁 Create data directory if it doesn't exist! 
    if (!fs.existsSync(dataPath)) {
        logger.info("Creating data directory", "Import"); // 📝 Log creation!
        fs.mkdirSync(dataPath); // 🏗️ Build that directory!
    }
    // 💾 Write file to disk! Pretty JSON with indentation! ✨
    fs.writeFileSync(path.join(dataPath, "teacher_competence.json"), JSON.stringify(data, null, 4));
    logger.info("Saved teacher competence file", "Import"); // 📝 Success log!
    const result = await readTeacherCompetenceData(); // 🔄 Read and process the data!
    if (result) return { success: true }; // ✅ All good!
    return { success: false, error: "Fehler beim Importieren der Datei" }; // 🚫 Something went wrong!
}

// 📖 Read teacher competence data! Process those competencies! 🎓
export async function readTeacherCompetenceData(): Promise<boolean> {
    // 🔍 Check if automatic detection is disabled! Manual mode! 🛠️
    if (!config_data.LDAP.ENABLE || !config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE) {
        const data = await getTeacherCompetenceFile(); // 📂 Get competence file!
        logger.info("Updating teacher competence data", "Import"); // 📝 Log update!
        if (!data) return false; // 🚫 No data? Fail!
        // 🔄 Loop through each teacher! Process all competencies! 
        for (const teacher in data) {
            const competences = data[teacher]; // 🎓 Get teacher's competencies!
            const teacherExists = await db.user.count({ where: { username: teacher } }); // 👤 Does teacher exist?
            if (!teacherExists) continue; // 🚫 Teacher not found? Skip!
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