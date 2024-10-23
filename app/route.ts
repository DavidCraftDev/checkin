import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "./src/modules/auth/cookieManager";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const { session } = await getCurrentSession();
    if (session) return NextResponse.redirect(new URL("/dashboard", request.url).toString());
    else return NextResponse.redirect(new URL("/login", request.url).toString());
}