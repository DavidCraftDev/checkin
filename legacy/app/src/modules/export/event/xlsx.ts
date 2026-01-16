import "server-only";

import { Events, User } from "@prisma/client";
import dayjs from "dayjs";
import { Columns, SheetData } from "write-excel-file";
import { getAttendancesPerEvent } from "../../eventUtilities";

async function getEventXLSX(user: User, event: Events, cw: number, year: number) {
    let sheetData: SheetData = new Array()
    let columnData: Columns = []

    const attendances = await getAttendancesPerEvent(event.id)
    sheetData.push([{
        "type": String,
        "value": "Studienzeit " + event.type + " " + dayjs(event.created_at).format("DD.MM.YYYY"),
        "fontWeight": "bold"
    }])
    sheetData.push([{
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
        "value": "Lehrer:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Erstellt am:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "CW/Jahr:",
        "fontWeight": "bold"
    }])
    sheetData.push([{
        "type": Date,
        "value": new Date(),
        "format": "DD.MM.YYYY HH:mm"
    },
    {
        "type": Number,
        "value": attendances.length
    },
    {
        "type": String,
        "value": user.displayname
    },
    {
        "type": Date,
        "value": new Date(event.created_at),
        "format": "DD.MM.YYYY HH:mm"
    },
    {
        "type": String,
        "value": cw + "/" + year
    }])
    sheetData.push([{}])
    sheetData.push([{
        "type": String,
        "value": "Schüler",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Studienzeit",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Schülernotiz",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Lehrernotiz",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Wann hinzugefügt",
        "fontWeight": "bold"
    }])
    attendances.forEach((attendance) => {
        sheetData.push([{
            "type": String,
            "value": attendance.user.displayname
        },
        {
            "type": String,
            "value": attendance.attendance.type || "Keine Ausgewählt",
            "wrap": true
        },
        {
            "type": String,
            "value": attendance.attendance.studentNote || "",
            "wrap": true
        },
        {
            "type": String,
            "value": attendance.attendance.teacherNote || "",
            "wrap": true
        },
        {
            "type": Date,
            "value": new Date(attendance.attendance.created_at),
            "format": "DD.MM.YYYY HH:mm"
        }])
    })
    columnData.push({
        width: 20
    },
        {
            width: 20
        },
        {
            width: 20
        },
        {
            width: 20
        },
        {
            width: 20
        },
        {
            width: 20
        })

    return { sheetData, columnData }
}

export default getEventXLSX;
