// ✅ COMPLETED STUDY TIMES COMPONENT! The victory list! 🏆
"use server";

import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events"; // 📊 Event interface!

// 🎉 Component to display study times you actually attended! Good job! 👏
function CompletedStudyTimes(props: { attendances: AttendancePerUserPerEvent[] }) {
    // 🏷️ Function to get the name of the study time based on its type! Label everything! 📝
    function getStudyTimeName(type: string) {
        // 📝 Is it a note? Add "(Notiz)" tag!
        if (type.startsWith("Notiz:")) {
            return type.replace("Notiz:", "") + " (Notiz)" // 📝 Note indicator!
        // 🔀 Is it a substitute? Add "(Vertretung)" tag!
        } else if (type.startsWith("Vertretung:")) {
            return type.replace("Vertretung:", "") + " (Vertretung)" // 🔀 Substitute indicator!
        } else {
            return type // 📚 Regular study time!
        }
    }

    // 🔤 Sort attendances by study time type! Alphabetical organization! 📋
    props.attendances.sort((a, b) => {
        const nameA = getStudyTimeName(a.attendance.type || "").toLowerCase(); // 🔤 Lowercase A!
        const nameB = getStudyTimeName(b.attendance.type || "").toLowerCase(); // 🔤 Lowercase B!
        if (nameA < nameB) return -1; // ⬇️ A first!
        if (nameA > nameB) return 1; // ⬆️ B first!
        return 0; // 🤝 Equal!
    });
    return (
        // 📊 Table with overflow handling! Mobile-friendly! 📱
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            {/* 🎯 Header: "Attended Study Times" - Your hall of fame! */}
                            <th scope="col">Besuchte Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 🔄 Map through attendances OR show empty message! */}
                        {props.attendances.length > 0 ? (props.attendances.map((attendanceData) => (
                            <tr key={attendanceData.attendance.id}>
                                {/* ✅ Display study time name with proper labels! */}
                                <td>{getStudyTimeName(attendanceData.attendance.type || "")}</td>
                            </tr>
                        ))) : (<tr><td className="italic">Keine Studienzeiten besucht</td></tr>)} {/* 😢 No attendance yet! */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CompletedStudyTimes; // 🎁 Export the success tracker! 📈