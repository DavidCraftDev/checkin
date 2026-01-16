import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import CalendarWeekRange from "@/app/src/ui/calendarweekRange";
import { notFound, redirect } from "next/navigation";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { getSortedUserOverviewData } from "@/app/src/modules/overview/user";
import { OverviewChart } from "../../forms";
import UserOverviewTable from "./userOverviewTable.component";
import { Metadata } from "next";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function UserOverviewPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    // Get session user and user data
    const sessionUser = await getSessionUser(1);
    const userID = (await params).slug;
    if (!userID) notFound();
    const userData = await getUserPerID(userID);
    if (!userData) notFound();

    // Check if user is allowed to view this page
    if (sessionUser.permission !== 2 && userData.group.find(group => sessionUser.group.includes(group)) == undefined) redirect("/dashboard/");

    // Decode search params
    const searchParamsData = await searchParams;
    const startCW = Number(searchParamsData.startCW) || dayjs().isoWeek();
    const startYear = Number(searchParamsData.startYear) || dayjs().year();
    const endCW = Number(searchParamsData.endCW) || dayjs().isoWeek();
    const endYear = Number(searchParamsData.endYear) || dayjs().year();

    // Check that start week is not after end week
    if (startYear > endYear || (startYear === endYear && startCW > endCW)) redirect(`/dashboard/overview/user/${userID}/`);

    // Get user overview data
    const overviewData = await getSortedUserOverviewData(userID, startCW, startYear, endCW, endYear);
    if (!overviewData) notFound();
    const { categories, categoriesPerCW } = overviewData.sortedData
    if (!categories) notFound();
    if (!categoriesPerCW) notFound();
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h1>Übersicht {userData.displayname}</h1>
                    {userData.group ? <p>{userData.group.toLocaleString()}</p> : <p>Keine Gruppenzugehörigkeit</p>}
                </div>
                <CalendarWeekRange />
            </div>
            <OverviewChart categories={categories} />
            <UserOverviewTable data={categoriesPerCW} userID={userID} />
            {<p>Exportieren als:
                <a href={`/api/v1/overview/user?userID=${userID}&startCW=${startCW}&startYear${startYear}&endCW=${endCW}&endYear=${endYear}`} download={`overview_${userData.username}_${startCW + startYear}_${endCW + endYear}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/overview/user/xlsx?userID=${userID}&startCW=${startCW}&startYear${startYear}&endCW=${endCW}&endYear=${endYear}`} download={`overview_${userData.username}_${startCW + startYear}_${endCW + endYear}.xlsx`} className="hover:underline mx-1">XLSX</a>
            </p>}
        </>
    );
}

export default UserOverviewPage;

export const metadata: Metadata = {
    title: "Schülerübersicht - CheckIN-System",
    description: "Übersicht über die Anwesenheit eines Schülers"
}