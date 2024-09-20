"use client";

import { CreatedEventPerUser } from "@/app/src/interfaces/events";
import dayjs from "dayjs";

interface CreatedEventTableProps {
    events: CreatedEventPerUser[]
}

function CreatedEventTable(props: CreatedEventTableProps) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Stammfach</th>
                            <th>Teilnehmer</th>
                            <th>Zeit</th>
                            <th>Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.events.map((event: CreatedEventPerUser) => (
                            <tr key={event.event.id}>
                                <td>{event.event.type}</td>
                                <td>{event.user}</td>
                                <td>{dayjs(event.event.created_at).format("DD.MM. HH:mm")}</td>
                                <td><a href={`/dashboard/events/event?id=${event.event.id}`} className="hover:underline">Anzeigen</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {props.events.length === 0 ? <p className="text-center italic m-2">Keine Studienzeiten erstellt</p> : null}
            </div>
        </div>
    )
}

export default CreatedEventTable;