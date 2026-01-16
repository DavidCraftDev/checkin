import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { getUserOverviewDataXLSX } from "@/app/src/modules/export/overview/user/xlsx";
import { getGroupUsers } from "@/app/src/modules/group";
import { getSortedGroupOverviewData } from "@/app/src/modules/overview/group";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile from "write-excel-file/node";

export async function GET(request: NextRequest) {
        // Get the current user and check if there a allowed to access this route
        const { user } = await getCurrentSession();
        if (!user) return new NextResponse("401 Unauthorized", { status: 401 });
        if (user.permission < 1) return new NextResponse("403 Forbidden", { status: 403 });

        // Get search parameters
        const searchParams = request.nextUrl.searchParams;
        const groupID = searchParams.get("groupID") || user.group[0];
        const startCW = Number(searchParams.get("startCW")) || dayjs().isoWeek();
        const startYear = Number(searchParams.get("startYear")) || dayjs().year();
        const endCW = Number(searchParams.get("endCW")) || startCW;
        const endYear = Number(searchParams.get("endYear")) || startYear;

        // Check if the user is allowed to view this data
        if (!user.group.includes(groupID) && user.permission < 2) return new NextResponse("403 Forbidden", { status: 403 });

        // Get the overview data
        const overviewData = await getSortedGroupOverviewData(groupID, startCW, startYear, endCW, endYear);
        if (!overviewData) return new NextResponse("404 Not Found", { status: 404 });
        const { mergedData, sortedData } = overviewData;

        // Get group data
        const group = await getGroupUsers(groupID);
        if (!group) return new NextResponse("404 Not Found", { status: 404 });

        // Initialize the data
        const sheetData: SheetData[] = [];
        const sheetName: string[] = [];
        const columeData: Columns[] = [];

        // Add meta sheet
        const meta: SheetData = [];
        meta.push([{
                "type": String,
                "value": "Übersicht " + groupID,
                "fontWeight": "bold"
        }])
        meta.push([{
                "type": String,
                "value": "Exportiert am:",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Von:",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Bis:",
                "fontWeight": "bold"
        }])
        meta.push([{
                "type": Date,
                "value": new Date(),
                "format": "DD.MM.YYYY HH:mm"
        },
        {
                "type": String,
                "value": startCW + "/" + startYear
        },
        {
                "type": String,
                "value": endCW + "/" + endYear
        }])
        meta.push([{}])
        meta.push([{
                "type": String,
                "value": "Gesamt",
                "fontWeight": "bold"
        }])
        meta.push([{
                "type": String,
                "value": "Normale Studienzeit",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Vertretungen",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Notizen",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Fehlstunden",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Gesamt",
                "fontWeight": "bold"
        }])
        const totalAttendancesGeneral = sortedData.categories.normal + sortedData.categories.parallel + sortedData.categories.notes;
        meta.push([{
                "type": Number,
                "value": sortedData.categories.normal
        },
        {
                "type": Number,
                "value": sortedData.categories.parallel
        },
        {
                "type": Number,
                "value": sortedData.categories.notes
        },
        {
                "type": Number,
                "value": sortedData.categories.absent
        },
        {
                "type": String,
                "value": totalAttendancesGeneral + "/" + sortedData.categories.total
        }])
        meta.push([{}])
        // Add every student to the sheet
        meta.push([{
                "type": String,
                "value": "Schüler",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Normale Studienzeit",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Vertretungen",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Notizen",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Fehlstunden",
                "fontWeight": "bold"
        },
        {
                "type": String,
                "value": "Gesamt",
                "fontWeight": "bold"
        }])
        Object.keys(sortedData.categoriesPerUser).forEach((key) => {
                const user = group.find(user => user.id === key);
                if (!user) return;
                if (user.needs.length === 0 && user.permission !== 0) return;
                const userCategories = sortedData.categoriesPerUser[key].categories;
                const totalAttendances = userCategories.normal + userCategories.parallel + userCategories.notes;
                meta.push([{
                        "type": String,
                        "value": user.displayname
                },
                {
                        "type": Number,
                        "value": userCategories.normal
                },
                {
                        "type": Number,
                        "value": userCategories.parallel
                },
                {
                        "type": Number,
                        "value": userCategories.notes
                },
                {
                        "type": Number,
                        "value": userCategories.absent
                },
                {
                        "type": String,
                        "value": totalAttendances + "/" + userCategories.total
                }])
        });
        sheetData.push(meta);
        sheetName.push("Übersicht " + groupID.substring(0, 23));
        columeData.push([
                { width: 20 },
                { width: 20 },
                { width: 20 },
                { width: 20 },
                { width: 20 },
                { width: 20 }
        ]);

        await Promise.all(Object.keys(mergedData).map(async (key) => {
                const user = group.find(user => user.id === key);
                if (!user) return;
                if (user.needs.length === 0 && user.permission !== 0) return;
                const data = await getUserOverviewDataXLSX(user.displayname, sortedData.categoriesPerUser[key], startCW, startYear, endCW, endYear);
                sheetData.push(data.sheetData[0]);
                sheetName.push(data.sheetName[0]);
                columeData.push(data.columeData[0]);
        }));

        const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetName, columns: columeData })
        return new NextResponse(new Uint8Array(bufferData), {
                status: 200,
                headers: {
                        'Content-Disposition': `attachment; filename="overview${groupID + "_" + startCW + startYear + "_" + endCW + endYear}.xlsx"`,
                        'Content-Type': 'application/vnd.ms-excel',
                }
        })
}