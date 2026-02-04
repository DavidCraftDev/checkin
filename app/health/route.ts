import { config_data } from "@/app/src/modules/data/config";
import db from "@/app/src/modules/db";
import packageJson from "@/package.json";

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
    const version = packageJson.version
    const data = {
        version: version,
        maintenance: config_data.MAINTENANCE,
        status: status,
        databaseConnected: dbConnected
    }
    return Response.json({ data }, { status: 418 });
}