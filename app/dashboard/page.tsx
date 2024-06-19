import { getSession } from "../src/modules/authUtilities";
import { getNeededStudyTimes, isStudyTimeEnabled } from "../src/modules/studytimeUtilities";
import { getNormalEventsAttendances, getStudyTimes } from "../src/modules/eventUtilities";
import moment from "moment";
import MissingStudyTimes from "./dashboardComponents/missingStudyTimes.component";
import CompletedStudyTimes from "./dashboardComponents/completedStudyTimes.component";
import AttendedEventsMinimal from "./dashboardComponents/attendedEventsMinimal.component";

export default async function dashboard() {
    const session = await getSession();
    const studyTime: boolean = await isStudyTimeEnabled();
    const hasStudyTimes = await getStudyTimes(session.user.id, moment().week(), moment().year());
    const neededStudyTimes = await getNeededStudyTimes(session.user.id);
    const normalEvents = await getNormalEventsAttendances(session.user.id, moment().week(), moment().year());
    console.log(normalEvents)
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Hallo {session.user.name}</p>
            {studyTime ? <p>{String(hasStudyTimes.length) + "/" + String(neededStudyTimes.length)} Studienzeiten erledigt</p> : null}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
                <MissingStudyTimes />
                <CompletedStudyTimes hasStudyTimes={hasStudyTimes} />
                <AttendedEventsMinimal normalEvents={normalEvents} />
            </div>
        </div>
    );
}