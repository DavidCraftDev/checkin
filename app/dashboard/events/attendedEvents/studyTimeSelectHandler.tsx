"use server"

import { saveStudyTimeType } from "@/app/src/modules/studytimeUtilities";

async function studyTimeSelectHandler(attendanceID: string, type: string) {
    return await saveStudyTimeType(attendanceID, type);
}

export default studyTimeSelectHandler;