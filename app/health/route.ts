import { config_data } from "../src/modules/data/config";
import db from "../src/modules/db";

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
    const data = {
        maintenance: config_data.MAINTENANCE,
        status: status,
        databaseConnected: dbConnected
    }
    return Response.json({ data });
}