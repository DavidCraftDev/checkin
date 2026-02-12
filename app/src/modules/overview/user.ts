"use server";

import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import db, { Attendances, StudyTimeData } from "@/app/src/modules/db";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

export async function getUserOverviewData(userID: string, startCW: number, startYear: number, endCW: number, endYear: number) {
    // Get session user & user data
    const sessionUser = await getSessionUser(1);
    const userData = await getUserPerID(userID);
    if (!userData) return null;

    // Check if user is allowed to get this data
    if (sessionUser.permission !== 2 && userData.group.find(group => sessionUser.group.includes(group)) == undefined) return null;

    // Get all attendances between start and end week (inclusive year)
    const startDate = dayjs().year(startYear).isoWeek(startCW).startOf("isoWeek").toDate();
    const endDate = dayjs().year(endYear).isoWeek(endCW).endOf("isoWeek").toDate();
    const attendances = await db.attendances.findMany({
        where: {
            userID: userID,
            created_at: {
                gte: startDate,
                lte: endDate
            },
            cw: {
                gte: startCW,
                lte: endCW
            }
        }
    });

    // Get needed study times in this period
    const studyTimeData = await db.studyTimeData.findMany({
        where: {
            userID: userID,
            year: {
                gte: startYear,
                lte: endYear
            },
            cw: {
                gte: startCW,
                lte: endCW
            }
        }
    });

    return { attendances, studyTimeData };
}

export interface OverviewUserDataPerCW {
    [key: string]: { attendances: Attendances[], studyTimeData: StudyTimeData };
}

export async function mergeUserDataPerCW(attendances: Attendances[], studyTimeData: StudyTimeData[]) {
    // Initialize data
    const data: OverviewUserDataPerCW = {};

    // Sort attendances by CW
    attendances.map(attendance => {
        const key = `${attendance.created_at.getFullYear()}-${attendance.cw}`;
        if (!data[key]) data[key] = { attendances: [], studyTimeData: { id: "", needs: [], userID: attendance.userID, cw: attendance.cw, year: attendance.created_at.getFullYear() } };
        data[key].attendances.push(attendance);
    });

    // Sort study time data by CW
    studyTimeData.map(studyTime => {
        const key = `${studyTime.year}-${studyTime.cw}`;
        if (!data[key]) data[key] = { attendances: [], studyTimeData: studyTime };
        else data[key].studyTimeData = studyTime;
    });

    return data;
}

export interface Categories {
    normal: number;
    parallel: number;
    notes: number;
    absent: number;
    total: number;
}

export interface SortedData {
    categories: Categories;
    categoriesPerCW: {
        [key: string]: Categories;
    };
}

export async function sortUserOverviewDataIntoCaterogies(data: OverviewUserDataPerCW) {
    // Initialize categories
    const categories: Categories = {
        normal: 0,
        parallel: 0,
        notes: 0,
        absent: 0,
        total: 0
    };
    const categoriesPerCW: { [key: string]: Categories } = {};

    // Sort data into categories
    for (const key in data) {
        const { attendances, studyTimeData } = data[key];

        // Initialize categories for this CW and add total
        if (!categoriesPerCW[key]) categoriesPerCW[key] = { normal: 0, parallel: 0, notes: 0, absent: 0, total: 0 };
        categoriesPerCW[key].total = studyTimeData.needs.length;
        categories.total += studyTimeData.needs.length;

        studyTimeData.needs.map(need => {
            const attendance = attendances.find(attendance => attendance.type && attendance.type.includes(need));
            if (attendance && attendance.type) {
                let type = attendance.type;
                if (type.startsWith("Notiz:")) {
                    categories.notes += 1;
                }
                else if (type.startsWith("Vertretung:")) {
                    categories.parallel += 1;
                    categoriesPerCW[key].parallel += 1;
                } else {
                    categories.normal += 1;
                    categoriesPerCW[key].normal += 1;
                }
            } else {
                categories.absent += 1;
                categoriesPerCW[key].absent += 1;
            }
        });
    }

    return { categories, categoriesPerCW };
}

export async function getSortedUserOverviewData(userID: string, startCW: number, startYear: number, endCW: number, endYear: number) {
    // Get user Overview data
    const overviewData = await getUserOverviewData(userID, startCW, startYear, endCW, endYear);
    if (!overviewData) return null;
    const { attendances, studyTimeData } = overviewData;

    // Merge data by CW
    const mergedData = await mergeUserDataPerCW(attendances, studyTimeData);

    // Sort data into categories
    const sortedData = await sortUserOverviewDataIntoCaterogies(mergedData);

    return { mergedData, sortedData };
}