import { getSesession } from "../src/modules/authUtilities";
import { getNeededStudyTimes, isStudyTimeEnabled } from "../src/modules/studytimeUtilities";
import { getStudyTimes } from "../src/modules/eventUtilities";
import moment from "moment";

export default async function dashboard() {
    const session = await getSesession();
    const studyTime: boolean = isStudyTimeEnabled();
    const hasStudyTimes = await getStudyTimes(session.user.id, moment().week(), moment().year()).then((result) => result.length);
    const needsStudyTimes = await getNeededStudyTimes(session.user.id).then((result) => result.length);
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Hallo {session.user.name}</p>
            {studyTime ? <p>{String(hasStudyTimes) + "/" + String(needsStudyTimes)} Studienzeiten erledigt</p> : null}
        </div>
    );
}