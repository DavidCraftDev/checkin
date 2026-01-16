// 🏥 HEALTH CHECK ROUTE! Is the system alive? 💓
import { config_data } from "../src/modules/data/config"; // ⚙️ Config data!
import db from "../src/modules/db"; // 🗄️ Database connection!

// 🔍 GET request handler! Health check endpoint! Are we alive? 🤔
export async function GET() {
    let dbConnected: boolean // 🗄️ Database connection status!
    try {
        await db.$connect() // 🔌 Try to connect!
        await db.$queryRaw`SELECT 1` // 🎯 Test query! SELECT 1 - The classic!
        dbConnected = true // ✅ Database is alive! 🎉
    } catch (error) {
        dbConnected = false // ❌ Database is dead! 💀 RIP!
    }
    let status = "ok" // ✅ Default status: OK!
    if (!dbConnected) {
        status = "error" // 🚨 Database down? Status: ERROR!
    }
    const packageJson = require("../../package.json") // 📦 Load package.json!
    let version = packageJson.version // 🏷️ Get version number!
    // 📊 Build health check response data! All the info! 
    const data = {
        version: version, // 🏷️ App version!
        maintenance: config_data.MAINTENANCE, // 🚧 Maintenance mode status!
        status: status, // ✅ Overall status!
        databaseConnected: dbConnected // 🗄️ Database connection status!
    }
    return Response.json({ data }, { status: 418 }); // ☕ Return with status 418 (I'm a teapot)! Classic HTTP humor! 🫖
}