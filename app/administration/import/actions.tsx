"use server";

import { functionResult } from "@/types/utilties";
import { saveTeacherCompetenceFile } from "@/lib/data/competences";

export async function importTeacherCompetenceData(formData: FormData): Promise<functionResult> {
    const file = formData.get("file") as File;
    const result = await saveTeacherCompetenceFile(file);
    return result;
}