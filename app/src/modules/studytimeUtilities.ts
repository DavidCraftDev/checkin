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
    let neededStudyTimes: Array<String> = [];
    neededStudyTimes.push("Deutsch")
    neededStudyTimes.push("Mathe")
    neededStudyTimes.push("Englisch")
    neededStudyTimes.push("Vertretung:Geschichte")
    return neededStudyTimes;
}