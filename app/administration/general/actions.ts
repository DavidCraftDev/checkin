"use server";

import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { config_data, writeConfig } from "@/app/src/modules/config/config";
import db from "@/app/src/modules/db";
import { redirect } from "next/navigation";

export async function saveSchoolName(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const schoolName = formData.get("schoolName") as string;
    config_data.SCHOOL_NAME = schoolName;
    await writeConfig();
    redirect("/administration?successSchoolName=true");
}

export async function enableMaintanceMode(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    config_data.MAINTANCE = true;
    await writeConfig();
    redirect("/");
}

export async function saveDefaultUsername(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const username = formData.get("username") as string;
    config_data.DEFAULT_LOGIN.USERNAME = username;
    await writeConfig();
    redirect("/administration?successUsername=true");
}

export async function saveDefaultPassword(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const password = formData.get("password") as string;
    config_data.DEFAULT_LOGIN.PASSWORD = password;
    await writeConfig();
    redirect("/administration?successPassword=true");
}

export async function deleteAllSessions(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    await db.session.deleteMany();
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
    redirect("/");
}