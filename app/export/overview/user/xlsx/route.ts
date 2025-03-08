import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import getAttendedEventsXLSX from "@/app/src/modules/export/attendedEvents/xlsx";
import { getUserOverviewDataXLSX } from "@/app/src/modules/export/overview/user/xlsx";
import { getSortedUserOverviewData } from "@/app/src/modules/overview/user";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";

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

    // Get user data
    const userData = await getUserPerID(userID);
    if (!userData) return new NextResponse("404 Not Found", { status: 404 });

    // Get the overview data
    const overviewData = await getSortedUserOverviewData(userID, startCW, startYear, endCW, endYear);
    if (!overviewData) return new NextResponse("404 Not Found", { status: 404 });
    const { mergedData, sortedData } = overviewData;

    // Get the XLSX data (getUserOverviewDataXLSX)
    let { sheetData, sheetName, columeData } = await getUserOverviewDataXLSX(userData.displayname, sortedData, startCW, startYear, endCW, endYear);

    // Add sheet for every Calendar Week
    Object.keys(mergedData).forEach(async (key) => {
        // Get CW and Year from key
        const [year, cw] = key.split("-");
        const cwData = await getAttendedEventsXLSX(user, Number(cw), Number(year))
        columeData.push(cwData.columnData);
        sheetName.push(cw + "-" + year)
        sheetData.push(cwData.sheetData);
    });

    const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetName, columns: columeData })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="overview${userID + "_" + startCW + startYear + "_" + endCW + endYear}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}