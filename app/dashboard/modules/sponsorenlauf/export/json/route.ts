import { getCurrentSession } from "@/lib/auth/cookieManager";
import { readData } from "../../handler";
import { NextResponse } from "next/server";

export async function GET() {
    const { user } = await getCurrentSession();
    if (!user) return new Response("401 Unauthorized", { status: 401 });
    if (user.permission < 1) return new Response("403 Forbidden", { status: 403 });
    const data = await readData();
    return new NextResponse(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="sponsorenlauf_data.json"',
        },
    });
}