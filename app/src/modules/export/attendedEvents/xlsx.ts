import { User } from "@prisma/client";
import { getAttendancesPerUser } from "../../eventUtilities";
import { Columns, SheetData } from "write-excel-file";
import { getSavedNeededStudyTimes } from "../../studytimeUtilities";

async function getAttendedEventsXLSX(user: User, cw: number, year: number) {
    let sheetData: SheetData = new Array()
    let columnData: Columns = []
    const sheetName: string = user.displayname.substring(0, 31)
    const attendances = await getAttendancesPerUser(user.id, cw, year)
    sheetData.push([{
        "type": String,
        "value": "Teilgenommene Studienzeiten von " + user.displayname,
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
        "value": "Exportiert für:",
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
        "value": cw + "/" + year
    }])
    sheetData.push([{}])
    let studyTimes: Array<string> = [];
    attendances.forEach((attendance) => {
        if (attendance.attendance.type) {
            studyTimes.push(attendance.attendance.type);
        }
    });
    const missing = await getSavedNeededStudyTimes(user, cw, year);
    const missingStudyTimes = missing.needs.filter((neededStudyTime) => !attendances.find((attendanceData) => attendanceData.attendance.type && attendanceData.attendance.type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime));
    sheetData.push([{
        "type": String,
        "value": "Erledigte Studienzeiten:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Davon Vertretungen:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Davon nur mit Notizen:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Fehlende Studienzeiten:",
        "fontWeight": "bold"
    }])
    sheetData.push([{
        "type": String,
        "value": studyTimes.toString().replaceAll("Notiz:", "").replaceAll("Vertretung:", "").replaceAll(",", ", "),
        "wrap": true
    },
    {
        "type": Number,
        "value": studyTimes.filter((studyTime) => studyTime.includes("Vertretung:")).length,
    },
    {
        "type": Number,
        "value": studyTimes.filter((studyTime) => studyTime.includes("Notiz:")).length,
    },
    {
        "type": String,
        "value": missingStudyTimes.toString().replaceAll(",", ", "),
        "wrap": true
    }])
    sheetData.push([{}])
    sheetData.push([{
        "type": String,
        "value": "Stammfach",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Lehrer",
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
        "value": "Datum",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Wann hinzugefügt",
        "fontWeight": "bold"
    }])
    attendances.forEach((attendance) => {
        let type: string
        if (!attendance.attendance.type) type = "Keine Ausgewählt"
        else type = attendance.attendance.type
        sheetData.push([{
            "type": String,
            "value": attendance.event.type,
            "wrap": true
        },
        {
            "type": String,
            "value": attendance.eventUser.displayname
        },
        {
            "type": String,
            "value": type,
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
            "value": new Date(attendance.event.created_at),
            "format": "DD.MM.YYYY HH:mm"
        },
        {
            "type": Date,
            "value": new Date(attendance.attendance.created_at),
            "format": "DD.MM.YYYY HH:mm"
        }])
    })
    for (let i = 0; i < 8; i++) {
        columnData.push({
            width: 20
        })
    }
    return { sheetData, columnData, sheetName }
}

export default getAttendedEventsXLSX;
