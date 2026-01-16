// ❌ MISSING STUDY TIMES COMPONENT! The "oops you missed it" list! 😅
"use server";

// 📋 Component to display study times you should have attended but didn't! Shame! 🔔
function MissingStudyTimes(props: { missingStudyTimes: string[] }) {
    // 🔤 Sort missing study times by name! Alphabetical order because we're civilized! 📚
    props.missingStudyTimes.sort((a, b) => {
        const nameA = a.toLowerCase(); // 🔤 Lowercase for comparison!
        const nameB = b.toLowerCase(); // 🔤 Same here!
        if (nameA < nameB) return -1; // ⬇️ A comes first!
        if (nameA > nameB) return 1; // ⬆️ B comes first!
        return 0; // 🤷 They're equal!
    });
    return (
        // 📊 Table wrapper with horizontal scroll! Responsive design FTW! 📱
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            {/* 📛 Header: "Missing Study Times" - The hall of missed opportunities! */}
                            <th scope="col">Fehlende Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 🔄 Map through missing study times OR show success message! */}
                        {props.missingStudyTimes.length > 0 ? (props.missingStudyTimes.map((studyTime) => (
                            <tr key={studyTime}>
                                <td>{studyTime}</td> {/* ❌ Each missed study time! Try better next time! */}
                            </tr>
                        ))) : (<tr><td className="italic">Alle Studienzeiten besucht!</td></tr>)} {/* ✅ Perfect attendance! You're a star! 🌟 */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default MissingStudyTimes; // 🎁 Export the component of shame (or glory!)! 🎭