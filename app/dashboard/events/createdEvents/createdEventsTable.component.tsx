"use client";

import { CreatedEventPerUser } from "@/app/src/interfaces/events";
import moment from "moment";

interface CreatedEventTableProps {
    studyTime: boolean,
    events: CreatedEventPerUser[]
}

function CreatedEventTable(props: CreatedEventTableProps) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Teilnehmer</th>
                            <th>Zeit</th>
                            {props.studyTime ? <th>Studienzeit</th> : null}
                            <th>Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.events.map((event: CreatedEventPerUser) => (
                            <tr key={event.event.id}>
                                <td>{event.event.name}</td>
                                <td>{event.user}</td>
                                <td>{moment(event.event.created_at).format("DD.MM.YYYY HH:mm")}</td>
                                {props.studyTime ? <td>{event.event.studyTime ? "✔️" : "❌"} </td> : null}
                                <td><a href={`/dashboard/events/event?id=${event.event.id}`} className="hover:underline">Anzeigen</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CreatedEventTable;