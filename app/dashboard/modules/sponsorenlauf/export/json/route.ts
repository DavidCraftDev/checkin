import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { readData } from "@/app/dashboard/modules/sponsorenlauf/handler";
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