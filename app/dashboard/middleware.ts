import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const token = cookies().get("session")?.value ?? null;
    if(token === null) return NextResponse.redirect("/login");
	return NextResponse.next();
}