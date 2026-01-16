import { CoursesPerUser } from "@/lib/courses";

function CoursesTable(props: { courses: CoursesPerUser}) {
    const coursesCount = Object.keys(props.courses).length;
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Kursname</th>
                            <th scope="col">Schüler</th>
                            <th scope="col">Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coursesCount > 0 ? (
                            Object.keys(props.courses).sort().map((course) => (
                                <tr key={course}>
                                    <td>{course}</td>
                                    <td>{props.courses[course]} Schüler</td>
                                    <td><a href={`/dashboard/courses/${course}/`} className="hover:underline">Anzeigen</a></td>
                                </tr>
                            ))
                        ) : (<tr><td className="italic">Keine Kurse vorhanden!</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CoursesTable;