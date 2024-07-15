"use client";

import { Events } from "@prisma/client";

interface AttendedEventsMinimalProps {
    normalEvents: Events[];
}

function AttendedEventsMinimal(props: AttendedEventsMinimalProps) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Teilgenommene Veranstaltungen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.normalEvents.length > 0 ? (props.normalEvents.map((event: Events) => (
                            <tr key={event.id}>
                                <td>{event.name}</td>
                            </tr>
                        ))) : (<tr><td className="italic">Keine Veranstaltungen besucht</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AttendedEventsMinimal;