import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/cookieManager";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
    const { session } = await getCurrentSession();
    if (session) redirect("/dashboard");
    else redirect("/login");
}