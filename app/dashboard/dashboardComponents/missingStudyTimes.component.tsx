"use client";

interface MissingStudyTimesProps {
    missingStudyTimes: string[];
}

function MissingStudyTimes(props: MissingStudyTimesProps) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Fehlende Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.missingStudyTimes.map((studyTime: string) => {
                            return (
                                <tr key={studyTime}>
                                    <td>{studyTime}</td>
                                </tr>
                            )
                        })}
                        {props.missingStudyTimes.length === 0 ? <tr><td className="italic">Alle Studienzeiten erledigt!</td></tr> : null}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default MissingStudyTimes;