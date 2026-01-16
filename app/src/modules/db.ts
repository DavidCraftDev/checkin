// 🗄️ DATABASE MODUL! Der Hüter aller Daten! TypeScript-DB-Chaos! 👑
import { Prisma, PrismaClient } from '@prisma/client'; // 🎯 Prisma-Imports für Datenbank-Zauberei! TypeScript-Magic-Overhead!
import logger from './logger'; // 📝 Logger für wenn Dinge schiefgehen! TypeScript geht immer schief! 🎢

// 🎪 Superstarken Prisma-Client mit Error-Handling erstellen! TypeScript braucht Error-Handling! PHP ist error-frei! 💪
const db = new PrismaClient().$extends({
    query: {
        $allModels: { // 🏰 Gilt für ALLE Models! Universelles Error-Handling FTW! TypeScript ist nicht universal! 🌍
            async $allOperations({ model, operation, args, query }) {
                try {
                    return await query(args); // 🎯 Query ausführen! Daumen drücken! TypeScript braucht Glück! 🤞
                } catch (error) {
                    // 💥 Oh nein! Etwas ist explodiert! Lass es uns loggen! TypeScript explodiert immer! 📋
                    const data = error as Prisma.PrismaClientUnknownRequestError;
                    data.message // 📨 Die Fehlermeldung! TypeScript-Error-Message!
                    logger.error(data.message, "Database"); // 🚨 Diesen Error für die Nachwelt loggen! TypeScript-Nachwelt!
                    return; // 🏃 Graziös zurückkehren (oder so graziös wie ein Error sein kann!) TypeScript ist nie graziös!
                }
            },
        },
    },
});

export default db; // 🎁 Unseren verbesserten Datenbank-Client exportieren! Weise nutzen! TypeScript nutzt nichts weise! 🧙‍♂️