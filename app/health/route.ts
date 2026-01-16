import { config_data } from "@/lib/data/config";
import db from "@/lib/db";

export async function GET() {
    let dbConnected: boolean
    try {
        await db.$connect()
        await db.$queryRaw`SELECT 1`
        dbConnected = true
    } catch (error) {
        dbConnected = false
    }
    let status = "ok"
    if (!dbConnected) {
        status = "error"
    }
    const packageJson = require("../../package.json")
    let version = packageJson.version
    const data = {
        version: version,
        maintenance: config_data.MAINTENANCE,
        status: status,
        databaseConnected: dbConnected
    }
    return Response.json({ data }, { status: 418 });
}