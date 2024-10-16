import { getSessionUser } from "../src/modules/auth/cookieManager";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek)

async function general() {
    const user = await getSessionUser();
    return (
        <div>
            <h1>Allgemeine Einstellungen</h1>
            <p>Hallo {user.displayname}</p>
        </div>
    );
}

export default general;