"use client";

function CompletedStudyTimes(props: any) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Erledigte Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.hasStudyTimes.map((studyTime: any) => {
                            let studyTimeName: string;
                            if (studyTime.type.startsWith("note:")) {
                                studyTimeName = studyTime.type.replace("note:", "") + " (Notiz)"
                            } else if (studyTime.type.startsWith("parallel:")) {
                                studyTimeName = studyTime.type.replace("parallel:", "") + " (Vertretung)"
                            } else {
                                studyTimeName = studyTime.type
                            }
                            return (
                                <tr key={studyTime.id}>
                                    <td>{studyTimeName}</td>
                                </tr>
                            )
                        })}
                        {props.hasStudyTimes.length === 0 ? <tr><td className="italic">Keine Studienzeiten erledigt</td></tr> : null}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CompletedStudyTimes;