// 📚 COURSES DATA MODULE! Course name mappings! 🎓
import { existsSync, readFileSync } from "fs"; // 📁 File system!
import Papa from "papaparse"; // 📊 CSV parser! Papa Parse FTW!
import path from "path"; // 🛤️ Path utilities!
import logger from "../logger"; // 📝 Logger!

// 🗺️ Course code to full name mapping! The Rosetta Stone of courses! 📖
const data: Record<string, string> = {
    "E5": "Englisch", // 🇬🇧 English courses!
    "E": "Englisch",
    "EG": "Englisch",
    "D": "Deutsch", // 🇩🇪 German!
    "M": "Mathematik", // 🔢 Math! Numbers and stuff!
    "ME": "Mathematik",
    "S8": "Spanisch", // 🇪🇸 Spanish courses galore!
    "S9": "Spanisch",
    "S0": "Spanisch",
    "S1": "Spanisch",
    "S6": "Spanisch",
    "SA": "Spanisch",
    "SM": "Spanisch",
    "FR": "Französisch", // 🇫🇷 French!
    "F6": "Französisch",
    "R0": "Russisch",
    "MU": "Musik",
    "SW": "Sozialwissenschaften",
    "SOWI": "Sozialwissenschaften",
    "G": "Geschichte",
    "GE": "Geschichte",
    "K": "Kunst",
    "KU": "Kunst",
    "PH": "Physik",
    "CH": "Chemie",
    "BI": "Biologie",
    "BIO": "Biologie",
    "B": "Biologie",
    "IF": "Informatik",
    "INF": "Informatik",
    "SP": "Sport",
    "PA": "Pädagogik",
    "ER": "Religion",
    "KR": "Religion",
    "EN": "Religion",
    "RELI": "Religion",
    "EL": "Ernährungslehre",
    "PL": "Philosophie",
    "ET": "Ethik",
    "PO": "Politik",
    "VK": "Vertiefungskurs",
    "IE": "Vertiefungskurs",
    "VTK": "Vertiefungskurs",
    "VTK1": "Vertiefungskurs",
    "VTK2": "Vertiefungskurs",
    "VX": "Vertiefungskurs",
    "LI": "Literatur",
    "EK": "Erdkunde"
}

const faecherCSVPath = path.join(process.cwd(), "data", "Faecher.csv");

async function parseCSV() {
    "use server";
    await new Promise((resolve, reject) => {
        const fileContent = readFileSync(faecherCSVPath, "utf8");

        Papa.parse(fileContent, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                results.data.forEach((row) => {
                    if (!row["InternKrz"] || !row["BezeichnungZeugnis"]) return;
                    data[row["InternKrz"]] = row["BezeichnungZeugnis"].split(" ")[0];
                });
                resolve(true);
            },
            error: (error: Papa.ParseError) => {
                logger.error("Failed to parse CSV. Error: " + error, "Courses");
                reject(false);
            }

        } as Papa.ParseConfig);
    }).then(() => {
        logger.info("Loaded courses from CSV.", "Courses");
    });
}

if (existsSync(faecherCSVPath)) parseCSV();

export function getCourseTypeFromName(name: string): string | undefined {
    const course = Object.keys(data).find((key) => name.includes(data[key]));
    return course !== undefined ? data[course] : undefined;
}

export default data;
