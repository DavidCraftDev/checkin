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
    let vertretung: Array<String> = [];
    function addVertretung() {
        vertretung.forEach((vertretung: any) => {
            neededStudyTimes.push("Vertretung:" + vertretung);
        });
    }
    userData.needs.forEach((need: any) => {
        let found = false;
        attendances.forEach((attendance: any) => {
            if(attendance.type === need) {
                found = true;
            }
        });
        if(!found) {
            let foundTeacher = false;
            teacherData.competence.forEach((competence: any) => {
                if(competence === need) {
                    foundTeacher = true;
                }
            });
            if(foundTeacher) {
                neededStudyTimes.push(need);
            } else {
                vertretung.push(need);
            }
        }
        addVertretung();
    })
    return neededStudyTimes;
}