import { getTimegrid, getTimetable, timeUnit } from "@/app/src/modules/untis";
import { table } from "console";
import { Metadata } from "next/types";
import React from "react";

async function UntisPage() {
    const { days, timegrid } = await getTimegrid();
    const columnCount = days.length;
    const timetable = await getTimetable();
    // 20251031 = Freitag, 20251030 = Donnerstag, 20251029 = Mittwoch, 20251028 = Dienstag, 20251027 = Montag
    // Montag = 0, Dienstag = 1, Mittwoch = 2, Donnerstag = 3, Freitag = 4
    const daysMap: Record<number, number> = { 0: 20251201, 1: 20251202, 2: 20251203, 3: 20251204, 4: 20251205 };
    return (
        <div>
            <h1>Untis Integration</h1>
            <p>Diese Seite befindet sich noch im Aufbau.</p>
            <table className="border-collapse border border-gray-400">
                <colgroup>
                    <col span={1} className="w-1/11" />
                    <col span={1} className="w-2/11" />
                    <col span={1} className="w-2/11" />
                    <col span={1} className="w-2/11" />
                    <col span={1} className="w-2/11" />
                    <col span={1} className="w-2/11" />
                </colgroup>
                <caption className="caption-bottom">
                    Zuletzt aktualisiert: {new Date().toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" })}
                </caption>
                <thead>
                    <tr className="border border-gray-300">
                        <th className="font-bold border border-gray-300">Zeit</th>
                        {days.map((day) => (
                            <th key={day} className="font-bold border border-gray-300">
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>

                    {timegrid.map((unit) => {
                        const startTime: string = String(unit.startTime).padStart(4, "0");
                        const endTime: string = String(unit.endTime).padStart(4, "0");
                        return (
                            <tr key={unit.name}>
                                <td className="border border-gray-300 p-1 align-top text-center">
                                    <span className="font-bold">{startTime.substring(0, 2) + ":" + startTime.substring(2)}</span>
                                    -{endTime.substring(0, 2) + ":" + endTime.substring(2)}
                                </td>
                                {Array.from({ length: columnCount }).map((_, i) => {
                                    if (!timetable[daysMap[i]]) timetable[daysMap[i]] = {};
                                    if (!timetable[daysMap[i]][unit.startTime]) timetable[daysMap[i]][unit.startTime] = [];
                                    return (
                                        <td key={i} className="border border-gray-300">
                                            <LeasonGroup entries={timetable[daysMap[i]][unit.startTime]} />
                                        </td>
                                    )
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default UntisPage;

export const metadata: Metadata = {
    title: "Studienzeitplan - CheckIN-System",
    description: "Die Übersicht des Studienzeitplans im CheckIN-System",
}

function LeasonElement(props: { entry: timeUnit }) {
    const { entry } = props;
    return (
        <div key={entry.subjects[0]} className={`border p-1 mb-1 ${entry.roomChanged ? "border-lime-600 border-2 border-dashed" : ""} ${entry.cancelled ? "border-red-600 border-2 border-dashed" : ""} ${entry.closed ? "border-orange-600 border-2 border-dashed" : ""}`}>
            <div className="font-bold">{entry.teacher}</div>
            <div>
                {entry.subjects.map((subject) => (
                    <span key={subject} className="mr-1">{subject}</span>
                ))}
            </div>
            <div>{entry.room}</div>
            <div>{entry.name}</div>
            {entry.note ? <div className="italic text-sm mt-1">{entry.note}</div> : null}
            {entry.cancelled ? <div className="text-red-600 font-bold mt-1">Entfällt</div> : null}
            {entry.roomChanged ? <div className="text-lime-600 font-bold mt-1">Raumänderung</div> : null}
            {entry.closed ? <div className="text-orange-600 font-bold mt-1">Geschlossen</div> : null}
        </div>
    )
}

function LeasonGroup(props: { entries: timeUnit[] }) {
    const { entries } = props;
    return (
        <div>
            {entries.map((entry) => (
                <LeasonElement key={entry.subjects[0]} entry={entry} />
            ))}
        </div>
    )
}
