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
                    {props.normalEvents.map((event: Events) => {
                            return (
                                <tr key={event.id}>
                                    <td>{event.name}</td>
                                </tr>
                            );
                        })}
                        {props.normalEvents.length === 0 ? <tr><td className="italic">Keine Veranstaltungen besucht</td></tr> : null}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AttendedEventsMinimal;