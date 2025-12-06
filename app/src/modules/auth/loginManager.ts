"use server";

import LDAP from "../ldap/ldap";
import { getUserPerUsername } from "../userUtilities";
import { getAllUsers } from "../ldap/ldapUtilities";
import logger from "../logger";
import { createSession, generateSessionToken } from "./sessionManager";
import { setSessionTokenCookie } from "./cookieManager";
import { compare } from "bcryptjs";
import RateLimit from "../rateLimit";
import { headers } from "next/headers";
import { config_data } from "../data/config";

const rateLimit = new RateLimit();

function getClientIP(headersList: Headers): string {
    // Try multiple headers in order of reliability
    // X-Real-IP is typically set by reverse proxies
    const realIP = headersList.get("x-real-ip");
    if (realIP) return realIP;
    
    // X-Forwarded-For may contain multiple IPs, take the first one
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
        const ips = forwardedFor.split(",").map(ip => ip.trim());
        if (ips.length > 0 && ips[0]) return ips[0];
    }
    
    // Fallback to a safe default
    return "unknown";
}

export async function login(username: string, password: string): Promise<boolean> {
    if (!username || !password || username === "" || password === "") return false;
    const header = await headers();
    const clientIP = getClientIP(header);
    
    if (rateLimit.rateLimit(clientIP)) return false;
    const userData = await getUserPerUsername(username);
    if (!userData) {
        logger.warn("User " + username + " not found in Database" + " IP:" + clientIP, "Auth");
        return false;
    }
    if (config_data.LDAP.ENABLE && !username.startsWith("local/")) {
        let client: LDAP | null = null;
        try {
            client = new LDAP();
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
                const token = generateSessionToken();
                const session = await createSession(token, userData.id);
                await setSessionTokenCookie(token, session.expiresAt);
                return true;
            } else {
                logger.warn("Invalid login credentials for user " + username + " IP:" + clientIP, "Auth");
                return false;
            }
        } catch (error) {
            logger.error("LDAP login error for user " + username + ": " + error, "Auth");
            return false;
        } finally {
            // Ensure client is always cleaned up
            if (client) {
                try {
                    await client.unbind();
                } catch (unbindError) {
                    logger.error("Error unbinding LDAP client: " + unbindError, "Auth");
                }
            }
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
            logger.warn("Invalid login credentials for user " + username + " IP:" + clientIP, "Auth");
            return false;
        }
    }
}