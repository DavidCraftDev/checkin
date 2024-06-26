"use client";

import moment from "moment";

function CreatedEventTable(props: any) {
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
                        {props.events.map((event: any) => (
                            <tr key={event.event.id}>
                                <td>{event.event.name}</td>
                                <td>{event.user}</td>
                                <td>{moment(Date.parse(event.event.created_at)).format("DD.MM.YYYY HH:mm")}</td>
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