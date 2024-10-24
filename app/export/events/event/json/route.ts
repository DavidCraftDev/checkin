import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { getEventPerID } from "@/app/src/modules/eventUtilities";
import getEventDataJSON from "@/app/src/modules/export/event/json";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { user } = await getCurrentSession();
    if(!user) return new NextResponse(null, { status: 401 });
    if(user.permission < 1) return new NextResponse(null, { status: 403 });
    const eventID = request.nextUrl.searchParams.get("eventID")
    if (!eventID) return NextResponse.json({ error: "No eventID provided" })
    const event = await getEventPerID(eventID)
    if (!event || !event.id) return NextResponse.json({ error: "Event not found" })
    if ((event.user !== user.id) && (user.permission < 2)) return NextResponse.json({ error: "User not authorized" })
    return NextResponse.json(await getEventDataJSON(event, user))
}