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

// Dummy hash for timing attack mitigation
const DUMMY_HASH = "$2b$12$fNlgQb5/7eojbPoGV4yDJOt7bTBXPfdgbKX5exsadZQK28nCxf/flm";

export async function login(username: string, password: string): Promise<boolean> {
    if (!username || !password || username === "" || password === "") return false;
    const header = await headers();
    if (rateLimit.rateLimit(header.get("x-forwarded-for") ?? "999.999.999.999")) return false;
    const userData = await getUserPerUsername(username, true);
    if (!userData) {
        logger.warn("Das Wesen '" + username + "' existiert nicht in den Registern der Datenbank. IP:" + header.get("x-forwarded-for"), "Auth");
        // Compare with dummy hash to mitigate timing attacks
        await compare(password, DUMMY_HASH);
        return false;
    }
    if (config_data.LDAP.ENABLE && !username.startsWith("local/")) {
        let client: LDAP = new LDAP();
        const ldapUserData = await getAllUsers();
        const ldapUser = ldapUserData.find(entry => entry.sAMAccountName.toString().toLowerCase() === username.toLowerCase());
        if (!ldapUser) {
            logger.warn("Das Wesen '" + username + "' konnte im LDAP-Verzeichnis nicht aufgefunden werden — die Akten schweigen", "Auth");
            // Compare with dummy hash to mitigate timing attacks
            await compare(password, DUMMY_HASH);
            return false;
        }
        if (ldapUser.objectGUID !== userData.id) {
            logger.error("Das Wesen '" + username + "' besitzt im LDAP eine andere Identität als in der Datenbank — ein Doppelgänger wurde entdeckt", "Auth");
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
            logger.warn("Die Anmeldedaten für '" + username + "' wurden als ungültig befunden. IP:" + header.get("x-forwarded-for"), "Auth");
            return false;
        }
    } else {
        if (!userData.password) {
            logger.info("Das Wesen '" + username + "' besitzt kein Geheimwort — es steht nackt vor den Toren der Behörde", "Auth");
            // Compare with dummy hash to mitigate timing attacks
            await compare(password, DUMMY_HASH);
            return false;
        }
        if (await compare(password, userData.password)) {
            const token = generateSessionToken();
            const session = await createSession(token, userData.id);
            await setSessionTokenCookie(token, session.expiresAt);
            return true;
        } else {
            logger.warn("Die Anmeldedaten für '" + username + "' wurden als ungültig befunden. IP:" + header.get("x-forwarded-for"), "Auth");
            return false;
        }
    }
}