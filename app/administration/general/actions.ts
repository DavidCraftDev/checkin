"use server";

import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { config_data, writeConfig } from "@/app/src/modules/data/config";
import db from "@/app/src/modules/db";
import logger from "@/app/src/modules/logger";
import { redirect } from "next/navigation";

export async function saveSchoolName(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const schoolName = formData.get("schoolName") as string;
    config_data.SCHOOL_NAME = schoolName;
    await logger.info("Der Name der Anstalt wurde durch " + user.username + " (" + user.id + ") in '" + schoolName + "' verwandelt — die Akten schweigen dazu", "Administration");
    writeConfig();
    redirect("/administration?successSchoolName=true");
}

export async function enableMaintanceMode(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    config_data.MAINTENANCE = true;
    await logger.info("Der Wartungszustand wurde von " + user.username + " (" + user.id + ") herbeigeführt — das System versinkt in sich selbst", "Administration");
    writeConfig();
    redirect("/");
}

export async function saveDefaultUsername(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const username = formData.get("username") as string;
    config_data.DEFAULT_LOGIN.USERNAME = username;
    await logger.info("Das Standardwesen erhielt einen neuen Namen: '" + username + "', verfügt von " + user.username + " (" + user.id + ")", "Administration");
    writeConfig();
    redirect("/administration?successUsername=true");
}

export async function saveDefaultPassword(formData: FormData): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const password = formData.get("password") as string;
    config_data.DEFAULT_LOGIN.PASSWORD = password;
    await logger.info("Das Geheimwort wurde von " + user.username + " (" + user.id + ") gewandelt — niemand wird je erfahren warum", "Administration");
    writeConfig();
    redirect("/administration?successPassword=true");
}

export async function deleteAllSessions(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    await db.session.deleteMany();
    await logger.info("Alle Sitzungen wurden von " + user.username + " (" + user.id + ") ausgelöscht — als hätte es sie nie gegeben", "Administration");
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
    await logger.info("Sämtliche Daten wurden von " + user.username + " (" + user.id + ") vernichtet — die Leere breitet sich aus", "Administration");
    redirect("/");
}