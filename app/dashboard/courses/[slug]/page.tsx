import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getStudentsPerCourse, getStudyTimesDataForAllCourseMembers } from "@/app/src/modules/courses";
import { checkDate, getCurrentWeek } from "@/app/src/modules/date";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import StudyTimeTable from "./studyTimesTable.component";
import { Permission } from "@/app/src/constants/permissions";

async function CoursePage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    // Check if the user is logged in and has permission to view this page
    await getSessionUser(Permission.TEACHER);

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
            <div className="grid grid-rows-2 md:grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Kurs {courseID}</h1>
                    <p>{students.length} Schüler</p>
                </div>
                <CalendarWeek />
                {/*<p>Anwesenheit kontrollieren</p>*/}
            </div>
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