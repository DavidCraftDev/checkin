import moment from "moment";
import { getAttendancesPerUser } from "./eventUtilities";
import { getUserPerID } from "./userUtilities";

export function isStudyTimeEnabled() {
    let result: boolean = false;
    if(process.env.study_time === "true") {
        result = true;
    }
    return result;
}

export async function getNeededStudyTimes(userID: string, teacherID: string) {
    const userData = await getUserPerID(userID);
    const teacherData = await getUserPerID(teacherID);
    const attendances = await getAttendancesPerUser(userID, moment().week(), moment().year());
    let neededStudyTimes: Array<String> = [];
    console.log(userData.needs)
    userData.needs.forEach((need: any) => {
        let found = false;
        attendances.forEach((attendance: any) => {
            if(attendance.type === need) {
                found = true;
            }
        });
        if(!found) {
            neededStudyTimes.push(need);
        }
    });
    return neededStudyTimes;
}