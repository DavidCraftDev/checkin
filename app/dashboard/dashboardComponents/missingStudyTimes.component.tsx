
function MissingStudyTimes(props: { missingStudyTimes: string[] }) {
    // Sort missing study times by name
    props.missingStudyTimes.sort((a, b) => {
        const nameA = a.toLowerCase();
        const nameB = b.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Fehlende Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.missingStudyTimes.length > 0 ? (props.missingStudyTimes.map((studyTime) => (
                            <tr key={studyTime}>
                                <td>{studyTime}</td>
                            </tr>
                        ))) : (<tr><td className="italic">Alle Studienzeiten besucht!</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default MissingStudyTimes;