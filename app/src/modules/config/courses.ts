import "server-only";

import { existsSync, readFileSync } from "fs";
import Papa from "papaparse";
import path from "path";
import logger from "../logger";

let data: Record<string, string> = {
    "E5": "Englisch",
    "E": "Englisch",
    "EG": "Englisch",
    "D": "Deutsch",
    "M": "Mathematik",
    "ME": "Mathematik",
    "S8": "Spanisch",
    "S0": "Spanisch",
    "S1": "Spanisch",
    "S6": "Spanisch",
    "SA": "Spanisch",
    "SM": "Spanisch",
    "FR": "Französisch",
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
    "VK": "Vertifungskurs",
    "IE": "Vertifungskurs",
    "VTK": "Vertifungskurs",
    "VTK1": "Vertifungskurs",
    "VTK2": "Vertifungskurs",
    "VX": "Vertifungskurs",
    "LI": "Literatur",
    "EK": "Erdkunde"
}

const faecherCSVPath = path.join(process.cwd(), "data", "Faecher.csv");

async function parseCSV() {
    new Promise((resolve, reject) => {
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

export default data;