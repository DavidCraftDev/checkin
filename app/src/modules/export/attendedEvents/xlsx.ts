import { User } from "@prisma/client";
import { getAttendancesPerUser } from "../../eventUtilities";
import { getSavedMissingStudyTimes, isStudyTimeEnabled } from "../../studytimeUtilities";

async function getAttendedEventsXLSX(user: User, cw: number, year: number) {
    let sheetData: any = new Array()
    let columnData: any = []
    const sheetName: String = user.displayname.substring(0, 31)
    const studyTime: Boolean = await isStudyTimeEnabled()
    const attendances = await getAttendancesPerUser(user.id, cw, year)
    sheetData.push([{
        "type": String,
        "value": "Teilgenommene Veranstaltungen von " + user.displayname,
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
        "value": "Exportiert von:",
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
        "value": user.displayname
    },
    {
        "type": String,
        "value": cw + "/" + year
    }])
    sheetData.push([{}])
    if (studyTime) {
        let studyTimes: Array<String> = [];
        attendances.forEach((attendance: any) => {
            if (attendance.event.studyTime) {
                if (attendance.attendance.type) {
                    studyTimes.push(attendance.attendance.type);
                }
            }
        });
        const missing = await getSavedMissingStudyTimes(user.id, cw, year)
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
            "value": studyTimes.toString().replaceAll(",", ", "),
            "wrap": true
        },
        {
            "type": Number,
            "value": studyTimes.filter((studyTime: any) => studyTime.includes("parallel:")).length,
        },
        {
            "type": Number,
            "value": studyTimes.filter((studyTime: any) => studyTime.includes("note:")).length,
        },
        {
            "type": String,
            "value": missing.toString().replaceAll(",", ", "),
            "wrap": true
        }])
        sheetData.push([{}])
    }
    sheetData.push([{
        "type": String,
        "value": "Veranstaltung",
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
    attendances.forEach((attendance: any) => {
        let type: String
        if (!attendance.event.studyTime) type = "❌"
        else if (!attendance.attendance.type) type = "Keine Ausgewählt"
        else type = attendance.attendance.type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")
        sheetData.push([{
            "type": String,
            "value": attendance.event.name,
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
            "value": attendance.attendance.studentNote,
            "wrap": true
        },
        {
            "type": String,
            "value": attendance.attendance.teacherNote,
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
