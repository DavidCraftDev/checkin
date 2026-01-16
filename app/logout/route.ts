import { NextRequest, NextResponse } from "next/server";
import { deleteSessionTokenCookie, getCurrentSession } from "@/lib/auth/cookieManager";
import { invalidateSession } from "@/lib/auth/sessionManager";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const { session } = await getCurrentSession();
    if (session) await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return redirect("/login");
}