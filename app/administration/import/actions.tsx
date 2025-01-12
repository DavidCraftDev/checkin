"use server";

import { functionResult } from "@/app/src/interfaces/utilties";
import { saveTeacherCompetenceFile } from "@/app/src/modules/data/competences";

export async function importTeacherCompetenceData(formData: FormData): Promise<functionResult> {
    const file = formData.get("file") as File;
    const result = await saveTeacherCompetenceFile(file);
    return result;
}