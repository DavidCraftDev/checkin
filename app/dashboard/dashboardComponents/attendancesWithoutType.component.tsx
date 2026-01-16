// 🤷 ATTENDANCES WITHOUT TYPE COMPONENT! The mystery box! 🎁
"use server";

import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events"; // 📊 Event interface!

// 🔮 Component for unassigned study times! What are you, mysterious attendance? 👻
function AttendancesWithoutType(props: { attendances: AttendancePerUserPerEvent[] }) {
    // 🔤 Sort attendances by event type and user display name! Double sorting! 📊
    props.attendances.sort((a, b) => {
        // 🏷️ Combine event type + user name for sorting! The ultimate combo! 🎪
        const nameA = a.event.type.toLowerCase() + " " + a.eventUser.displayname.toLowerCase();
        const nameB = b.event.type.toLowerCase() + " " + b.eventUser.displayname.toLowerCase();
        if (nameA < nameB) return -1; // ⬇️ A comes first!
        if (nameA > nameB) return 1; // ⬆️ B comes first!
        return 0; // 🤝 They're equal!
    });
    return (
        // 📊 Table with horizontal scroll! Works everywhere! 📱💻
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            {/* 🎯 Header: "Unassigned Study Times" - Need some love! */}
                            <th scope="col">Nicht zugeordnete Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 🔄 Map through unassigned attendances OR show success message! */}
                        {props.attendances.length > 0 ? (props.attendances.map((data) => (
                            <tr key={data.attendance.id}>
                                {/* 🏷️ Display event type + teacher name! */}
                                <td>Studienzeit {data.event.type + " " + data.eventUser.displayname} </td>
                            </tr>
                        ))) : (<tr><td className="italic">Alle Studienzeiten zugeordnet!</td></tr>)} {/* ✅ Everything assigned! Perfect! 🎉 */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AttendancesWithoutType; // 🎁 Export the mystery solver! 🕵️