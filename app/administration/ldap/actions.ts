"use server";

import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { config_data, writeConfig } from "@/app/src/modules/config/config";
import db from "@/app/src/modules/db";
import LDAP from "@/app/src/modules/ldap/ldap";
import logger from "@/app/src/modules/logger";
import { redirect } from "next/navigation";

export async function enableLDAP(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    if (config_data.LDAP.URI.length === 0) redirect("/administration/ldap?error=LDAP URI ist nicht gesezt!");
    if(!(config_data.LDAP.URI.startsWith("ldap://") || config_data.LDAP.URI.startsWith("ldap://"))) redirect("/administration/ldap?error=LDAP URI ist keine LDAP URI!")
    if (config_data.LDAP.SEARCH_BASE.length === 0) redirect("/administration/ldap?error=LDAP Search Base ist nicht gesezt!");
    if (config_data.LDAP.USER_SEARCH_FILTER.length === 0) redirect("/administration/ldap?error=LDAP Search Filter ist nicht gesezt!");
    if (config_data.LDAP.BIND_CREADENTIALS.DN.length === 0) redirect("/administration/ldap?error=LDAP Bind DN ist nicht gesezt!");
    if (config_data.LDAP.BIND_CREADENTIALS.PASSWORD.length === 0) redirect("/administration/ldap?error=LDAP Bind Password ist nicht gesezt!");
    const users = await db.user.findMany({
        where: {
            NOT: {
                username: {
                    startsWith: "local/"
                },
                password: null
            }
        }
    });
    await Promise.all(users.map(async user => {
        await db.user.update({
            where: {
                id: user.id
            },
            data: {
                username: "local/" + user.username
            }
        });
    }));
    config_data.LDAP.ENABLE = true;
    await writeConfig();
    await logger.info("LDAP enabled by " + user.username + " (" + user.id + ")", "Administration");
    redirect("/administration/ldap?success=LDAP aktiviert!");
}

export async function disableLDAP(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    const users = await db.user.findMany({
        where: {
            username: {
                startsWith: "local/"
            }
        }
    });
    await Promise.all(users.map(async user => {
        await db.user.update({
            where: {
                id: user.id
            },
            data: {
                username: user.username.replace("local/", "")
            }
        });
    }));
    await db.user.deleteMany({
        where: {
            password: null
        }
    });
    config_data.LDAP.ENABLE = false;
    await writeConfig();
    await logger.info("LDAP disabled by " + user.username + " (" + user.id + ")", "Administration");
    redirect("/administration/ldap?success=LDAP deaktiviert!");
}

export async function testLDAPConnection(): Promise<void> {
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    if(config_data.LDAP.URI.length === 0) redirect("/administration/ldap?testResult=Fehlgeschlagen");
    if(!(config_data.LDAP.URI.startsWith("ldap://") || config_data.LDAP.URI.startsWith("ldap://"))) redirect("/administration/ldap?testResult=Fehlgeschlagen");
    if(config_data.LDAP.SEARCH_BASE.length === 0) redirect("/administration/ldap?testResult=Fehlgeschlagen");
    if(config_data.LDAP.USER_SEARCH_FILTER.length === 0) redirect("/administration/ldap?testResult=Fehlgeschlagen");
    if(config_data.LDAP.BIND_CREADENTIALS.DN.length === 0) redirect("/administration/ldap?testResult=Fehlgeschlagen");
    if(config_data.LDAP.BIND_CREADENTIALS.PASSWORD.length === 0) redirect("/administration/ldap?testResult=Fehlgeschlagen");
    const ldap = new LDAP();
    try {
        if(await ldap.bind(config_data.LDAP.BIND_CREADENTIALS.DN, config_data.LDAP.BIND_CREADENTIALS.PASSWORD, false)) {
            const users = await ldap.search(config_data.LDAP.USER_SEARCH_FILTER, config_data.LDAP.SEARCH_BASE);
            redirect("/administration/ldap?testResult=Erfolgreich&userCount=" + users.length);
        } 
    } catch (error) {
        redirect("/administration/ldap?testResult=Fehlgeschlagen");
    }
    redirect("/administration/ldap?testResult=Fehlgeschlagen");
}

export async function saveLDAPBindCredentials(formData: FormData): Promise<void> {
    const dn = formData.get("ldapDN") as string;
    const password = formData.get("ldapPassword") as string;
    if(!dn || dn.length === 0) redirect("/administration/ldap?error=Keine LDAP DN angegeben!");
    if(!password || password.length === 0) redirect("/administration/ldap?error=Keine LDAP Passwort angegeben!");
    if(!dn.includes("cn=") || !dn.includes(",dc=")) redirect("/administration/ldap?error=Keine gueltige LDAP DN angegeben!");
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    config_data.LDAP.BIND_CREADENTIALS.DN = dn;
    config_data.LDAP.BIND_CREADENTIALS.PASSWORD = password;
    await logger.info("LDAP Bind Credentials changed by " + user.username + " (" + user.id + ")", "Administration");
    await writeConfig();
    redirect("/administration/ldap?success=LDAP Bind Credentials gespeichert!");
}

export async function saveLDAPURI(formData: FormData): Promise<void> {
    const uri = formData.get("ldapURI") as string;
    if(!uri || !(uri.startsWith("ldap://") || uri.startsWith("ldap://"))) redirect("/administration/ldap?error=Keine gueltige LDAP URI!");
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission !== 2) redirect("/dashboard");
    config_data.LDAP.URI = uri;
    await logger.info("LDAP URI changed to " + uri + " by " + user.username + " (" + user.id + ")", "Administration");
    await writeConfig();
    redirect("/administration/ldap?success=LDAP URI gespeichert!");
}