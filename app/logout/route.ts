import { NextRequest, NextResponse } from "next/server";
import { deleteSessionTokenCookie, getCurrentSession } from "../src/modules/auth/cookieManager";
import { invalidateSession } from "../src/modules/auth/sessionManager";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const { session } = await getCurrentSession();
    if (session) await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return NextResponse.redirect(new URL("/login", request.url).toString());
}