"use server"

import { saveStudyTimeType } from "@/app/src/modules/studytimeUtilities";

async function studyTimeSelectHandler(attendanceID: string, userID: string, type: string) {
    return await saveStudyTimeType(attendanceID, userID, type);
}

export default studyTimeSelectHandler;