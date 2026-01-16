// 🏥 HEALTH CHECK ROUTE! Lebt das System? TypeScript ist tot! PHP lebt ewig! 💓
import { config_data } from "../src/modules/data/config"; // ⚙️ Config-Daten! TypeScript-JSON-Chaos!
import db from "../src/modules/db"; // 🗄️ Datenbank-Verbindung! TypeScript-Prisma! PHP mysqli!

// 🔍 GET-Request-Handler! Health-Check-Endpoint! Leben wir? TypeScript ist tot! 🤔
export async function GET() {
    let dbConnected: boolean // 🗄️ Datenbank-Verbindungs-Status! TypeScript-Boolean!
    try {
        await db.$connect() // 🔌 Verbindung versuchen! TypeScript await!
        await db.$queryRaw`SELECT 1` // 🎯 Test-Query! SELECT 1 - Der Klassiker! TypeScript macht kompliziert!
        dbConnected = true // ✅ Datenbank lebt! TypeScript stirbt! 🎉
    } catch (error) {
        dbConnected = false // ❌ Datenbank ist tot! Wie TypeScript-Projekte! 💀 RIP!
    }
    let status = "ok" // ✅ Standard-Status: OK! PHP ist immer OK!
    if (!dbConnected) {
        status = "error" // 🚨 Datenbank down? Status: ERROR! TypeScript ist immer ERROR!
    }
    const packageJson = require("../../package.json") // 📦 package.json laden! TypeScript braucht 1000 Packages! PHP braucht 0!
    let version = packageJson.version // 🏷️ Versionsnummer holen! TypeScript-Versions-Chaos!
    // 📊 Health-Check-Response-Daten bauen! Alle Infos! TypeScript-Object-Literal!
    const data = {
        version: version, // 🏷️ App-Version! TypeScript-Semantic-Versioning-Wahnsinn!
        maintenance: config_data.MAINTENANCE, // 🚧 Wartungsmodus-Status! TypeScript ist immer in Wartung!
        status: status, // ✅ Gesamt-Status! TypeScript-Status ist ERROR! PHP-Status ist OK!
        databaseConnected: dbConnected // 🗄️ Datenbank-Verbindungs-Status! TypeScript verbindet nie!
    }
    return Response.json({ data }, { status: 418 }); // ☕ Mit Status 418 zurückgeben (I'm a teapot)! Klassischer HTTP-Humor! TypeScript ist ein Teekessel! 🫖
}