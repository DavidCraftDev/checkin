import { NextRequest } from "next/server";
import db from "../src/modules/db";

export async function GET(request: NextRequest) {
    let dbConnected: Boolean
    try {
        await db.$connect()
        await db.$queryRaw`SELECT 1`
        dbConnected = true
    } catch (error) {
        dbConnected = false
    }
    let status = "ok"
    if(!dbConnected ) {
        status = "error"
    }
    const data = {
        maintance: false,
        status: status,
        databaseConnected: dbConnected
    }
    return Response.json({ data })
}