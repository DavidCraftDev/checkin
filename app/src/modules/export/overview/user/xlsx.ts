import "server-only";

import { Columns, SheetData } from "write-excel-file";
import { SortedData } from "../../../overview/user";

export async function getUserOverviewDataXLSX(userDisplayname: string, sortedData: SortedData, startCW: number, startYear: number, endCW: number, endYear: number) {
    // Initialize data
    const sheetData: SheetData[] = [];
    const sheetName: Array<string> = [];
    const columeData: Columns[] = new Array();

    // Add meta sheet
    const meta = new Array()
    meta.push([{
        "type": String,
        "value": "Übersicht " + userDisplayname,
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
    meta.push([{
        "type": String,
        "value": "Kalenderwoche",
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
    for (const key in sortedData.categoriesPerCW) {
        const { normal, parallel, notes, absent, total } = sortedData.categoriesPerCW[key];
        const totalAttendancesPerWeek = normal + parallel + notes;
        meta.push([{
            "type": String,
            "value": key
        },
        {
            "type": Number,
            "value": normal
        },
        {
            "type": Number,
            "value": parallel
        },
        {
            "type": Number,
            "value": notes
        },
        {
            "type": Number,
            "value": absent
        },
        {
            "type": String,
            "value": totalAttendancesPerWeek + "/" + total
        }])
    }

    columeData.push([
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 }
    ]);
    sheetName.push("Übersicht " + userDisplayname.substring(0, 23));
    sheetData.push(meta)

    return { sheetData, sheetName, columeData };
}