import { config_data } from "../src/modules/config/config";
import db from "../src/modules/db";

export async function GET() {
    let dbConnected: Boolean
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
        maintance: config_data.MAINTANCE,
        status: status,
        databaseConnected: dbConnected
    }
    return Response.json({ data })
}