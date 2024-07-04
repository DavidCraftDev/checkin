import { getSession } from "../src/modules/authUtilities";
import { getMissingStudyTimes, getNeededStudyTimes } from "../src/modules/studytimeUtilities";
import { getNormalEventsAttendances, getStudyTimes } from "../src/modules/eventUtilities";
import moment from "moment";
import MissingStudyTimes from "./dashboardComponents/missingStudyTimes.component";
import CompletedStudyTimes from "./dashboardComponents/completedStudyTimes.component";
import AttendedEventsMinimal from "./dashboardComponents/attendedEventsMinimal.component";
import { studytime } from "../src/modules/config";

export default async function dashboard() {
    const session = await getSession();
    const hasStudyTimes = await getStudyTimes(session.user.id, moment().week(), moment().year());
    const neededStudyTimes = await getNeededStudyTimes(session.user.id);
    const missingStudyTimes = await getMissingStudyTimes(session.user.id);
    const normalEvents = await getNormalEventsAttendances(session.user.id, moment().week(), moment().year());
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Hallo {session.user.name}</p>
            {studytime ? <p>{String(hasStudyTimes.length) + "/" + String(neededStudyTimes.length)} Studienzeiten erledigt</p> : null}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
                {studytime ? <MissingStudyTimes missingStudyTimes={missingStudyTimes} /> : null}
                {studytime ? <CompletedStudyTimes hasStudyTimes={hasStudyTimes} /> : null}
                <AttendedEventsMinimal normalEvents={normalEvents} />
            </div>
        </div>
    );
}