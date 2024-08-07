import { getSessionUser } from "@/app/src/modules/authUtilities"
import db from "@/app/src/modules/db";
import { NextResponse } from "next/server";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile from "write-excel-file/node";

export async function GET() {
    const user = await getSessionUser(2);
    const users = await db.user.findMany()
    const data: SheetData = new Array()
    data.push([{
        "type": String,
        "value": "Alle Nutzer",
        "fontWeight": "bold"
    }])
    data.push([{
        "type": String,
        "value": "Exportiert am:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Exportierte Einträge:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Exportiert von:",
        "fontWeight": "bold"
    }])
    data.push([{
        "type": Date,
        "value": new Date(),
        "format": "DD.MM.YYYY HH:mm"
    },
    {
        "type": Number,
        "value": users.length
    },
    {
        "type": String,
        "value": user.displayname
    }])
    data.push([{}])
    data.push([{
        "type": String,
        "value": "Name",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Nutzername",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Rechte",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Gruppe",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Benötigte Studienzeiten",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Kompetenzen",
        "fontWeight": "bold"
    }])
    users.forEach((userData) => {
        data.push([{
            "type": String,
            "value": userData.displayname,
            "wrap": true
        },
        {
            "type": String,
            "value": userData.username,
        },
        {
            "type": Number,
            "value": userData.permission,
        },
        {
            "type": String,
            "value": userData.group || "",
            "wrap": true
        },
        {
            "type": String,
            "value": userData.needs?.toString().replaceAll(",", ", ") || "",
            "wrap": true
        },
        {
            "type": String,
            "value": userData.competence?.toString().replaceAll(",", ", ") || "",
            "wrap": true
        }])
    })
    const columns: Columns = [
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 24 },
        { width: 24 }
    ];
    const bufferData = await writeXlsxFile(data, { buffer: true, sheet: "Nutzer", columns: columns })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="users.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}