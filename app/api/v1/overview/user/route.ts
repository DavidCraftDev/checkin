import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { getSortedUserOverviewData } from "@/app/src/modules/overview/user";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // Get the current user and check if there a allowed to access this route
    const { user } = await getCurrentSession();
    if (!user) return new NextResponse("401 Unauthorized", { status: 401 });
    if (user.permission < 1) return new NextResponse("403 Forbidden", { status: 403 });

    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const userID = searchParams.get("userID") || user.id;
    const startCW = Number(searchParams.get("startCW")) || dayjs().isoWeek();
    const startYear = Number(searchParams.get("startYear")) || dayjs().year();
    const endCW = Number(searchParams.get("endCW")) || startCW;
    const endYear = Number(searchParams.get("endYear")) || startYear;

    // Get the overview data
    const overviewData = await getSortedUserOverviewData(userID, startCW, startYear, endCW, endYear);

    // Check if the user is allowed to view this data and if the user exists
    if (!overviewData) {
        const userData = await getUserPerID(userID);
        if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });
        return NextResponse.json("403 Forbidden", { status: 403 });
    }

    return NextResponse.json(overviewData);
}