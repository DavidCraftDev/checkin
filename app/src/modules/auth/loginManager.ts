"use server";

import LDAP from "@/app/src/modules/ldap/ldap";
import { getUserPerUsername } from "@/app/src/modules/userUtilities";
import { getAllUsers } from "@/app/src/modules/ldap/ldapUtilities";
import logger from "@/app/src/modules/logger";
import { createSession, generateSessionToken } from "./sessionManager";
import { setSessionTokenCookie } from "./cookieManager";
import { compare } from "bcryptjs";
import RateLimit from "@/app/src/modules/rateLimit";
import { headers } from "next/headers";
import { config_data } from "@/app/src/modules/data/config";

const rateLimit = new RateLimit();

export async function login(username: string, password: string): Promise<boolean> {
    if (!username || !password || username === "" || password === "") return false;
    const header = await headers();
    if (rateLimit.rateLimit(header.get("x-forwarded-for") ?? "999.999.999.999")) return false;
    const userData = await getUserPerUsername(username, true);
    if (!userData) {
        logger.warn("User " + username + " not found in Database" + " IP:" + header.get("x-forwarded-for"), "Auth");
        return false;
    }
    if (config_data.LDAP.ENABLE && !username.startsWith("local/")) {
        let client: LDAP = new LDAP();
        const ldapUserData = await getAllUsers();
        const ldapUser = ldapUserData.find(entry => entry.sAMAccountName.toString().toLowerCase() === username.toLowerCase());
        if (!ldapUser) {
            logger.warn("User " + username + " not found in LDAP-Data", "Auth");
            return false;
        }
        if (ldapUser.objectGUID !== userData.id) {
            logger.error("User " + username + " has a different GUID in LDAP-Data than the ID in Database", "Auth");
            return false;
        }
        if (await client.bind(ldapUser.dn, password, false)) {
            client.unbind();
            const token = generateSessionToken();
            const session = await createSession(token, userData.id);
            await setSessionTokenCookie(token, session.expiresAt);
            return true;
        } else {
            client.unbind();
            logger.warn("Invalid login credentials for user " + username + " IP:" + header.get("x-forwarded-for"), "Auth");
            return false;
        }
    } else {
        if (!userData.password) {
            logger.info("User " + username + " has no password set", "Auth");
            return false;
        }
        if (await compare(password, userData.password)) {
            const token = generateSessionToken();
            const session = await createSession(token, userData.id);
            await setSessionTokenCookie(token, session.expiresAt);
            return true;
        } else {
            logger.warn("Invalid login credentials for user " + username + " IP:" + header.get("x-forwarded-for"), "Auth");
            return false;
        }
    }
}