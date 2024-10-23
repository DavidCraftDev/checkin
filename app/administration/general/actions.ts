"use server";

import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { config_data, writeConfig } from "@/app/src/modules/config/config";
import db from "@/app/src/modules/db";
import logger from "@/app/src/modules/logger";
import { redirect } from "next/navigation";

export async function saveSchoolName(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const schoolName = formData.get("schoolName") as string;
    config_data.SCHOOL_NAME = schoolName;
    await logger.info("School name changed to " + schoolName + " by " + user.username + " (" + user.id + ")", "Administration");
    await writeConfig();
    redirect("/administration?successSchoolName=true");
}

export async function enableMaintanceMode(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    config_data.MAINTANCE = true;
    await logger.info("Maintance mode enabled by " + user.username + " (" + user.id + ")", "Administration");
    await writeConfig();
    redirect("/");
}

export async function saveDefaultUsername(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const username = formData.get("username") as string;
    config_data.DEFAULT_LOGIN.USERNAME = username;
    await logger.info("Default username changed to " + username + " by " + user.username + " (" + user.id + ")", "Administration");
    await writeConfig();
    redirect("/administration?successUsername=true");
}

export async function saveDefaultPassword(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const password = formData.get("password") as string;
    config_data.DEFAULT_LOGIN.PASSWORD = password;
    await logger.info("Default password changed by " + user.username + " (" + user.id + ")", "Administration");
    await writeConfig();
    redirect("/administration?successPassword=true");
}

export async function deleteAllSessions(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    await db.session.deleteMany();
    await logger.info("All sessions deleted by " + user.username + " (" + user.id + ")", "Administration");
    redirect("/")
}

export async function deleteData(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    await Promise.all([
        db.studyTimeData.deleteMany(),
        db.session.deleteMany(),
        db.events.deleteMany(),
        db.attendances.deleteMany()
    ]);
    await logger.info("All data deleted by " + user.username + " (" + user.id + ")", "Administration");
    redirect("/");
}