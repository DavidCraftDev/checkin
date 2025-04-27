import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getStudentsPerCourse, getStudyTimesDataForAllCourseMembers } from "@/app/src/modules/courses";
import { checkDate, getCurrentWeek } from "@/app/src/modules/date";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import StudyTimeTable from "./studyTimesTable.component";

async function CoursePage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    // Check if the user is logged in and has permission to view this page
    await getSessionUser(1);

    // Decode the course ID from the URL and get the calendar week and year from the search parameters
    const courseID = decodeURIComponent((await params).slug);
    const searchParamsData = await searchParams;
    const calendarWeek: number = Number(searchParamsData.cw) || getCurrentWeek();
    const year: number = Number(searchParamsData.year) || new Date().getFullYear();
    // Check if the date is in a valid range
    if (!checkDate(year, calendarWeek)) redirect("/dashboard/courses/" + courseID);

    // Get the students for the course and check if there are more than 0 students
    const students = await getStudentsPerCourse(courseID);
    if (students.length === 0) redirect("/dashboard/courses");

    // Get the study time data for each student in the course
    const studyTimeData = getStudyTimesDataForAllCourseMembers(courseID, students, calendarWeek, year);
    return (
        <>
            <div>
                <h1>Kurs {courseID}</h1>
                <p>{students.length} Schüler</p>
                <CalendarWeek />
                <p>Anwesenheit kontrollieren</p>
            </div>
            <p>Anwesenheiten</p>
            <div>
                <h2>Studienzeiten</h2>
                <StudyTimeTable students={students} studyTimesPromise={studyTimeData} />
            </div>
        </>
    )
}

export default CoursePage;

export const metadata: Metadata = {
    title: "Kurs - CheckIN-System",
    description: "Ein Kurs im CheckIN-System"
};