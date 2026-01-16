// 🔐 LOGIN MANAGER! The gatekeeper of the application! 🚪
"use server";

// 🎪 Import extravaganza! All the authentication tools! 🛡️
import LDAP from "../ldap/ldap"; // 🖥️ LDAP integration!
import { getUserPerUsername } from "../userUtilities"; // 👤 User utilities!
import { getAllUsers } from "../ldap/ldapUtilities"; // 📋 LDAP user list!
import logger from "../logger"; // 📝 Logger for tracking everything!
import { createSession, generateSessionToken } from "./sessionManager"; // 🔐 Session management!
import { setSessionTokenCookie } from "./cookieManager"; // 🍪 Cookie management!
import { compare } from "bcryptjs"; // 🔐 Password comparison! Bcrypt magic!
import RateLimit from "../rateLimit"; // 🚦 Rate limiting! No spamming!
import { headers } from "next/headers"; // 📨 Request headers!
import { config_data } from "../data/config"; // ⚙️ Configuration data!

const rateLimit = new RateLimit(); // 🚦 Create rate limiter instance! The bouncer! 💪

// 🔐 Login function! The main authentication handler! 🎯
export async function login(username: string, password: string): Promise<boolean> {
    if (!username || !password || username === "" || password === "") return false; // 🚫 Empty credentials? Nope!
    const header = await headers(); // 📨 Get request headers!
    // 🚦 Rate limit check! Are you spamming? 🚨
    if (rateLimit.rateLimit(header.get("x-forwarded-for") ?? "999.999.999.999")) return false; // 🛑 Rate limited!
    const userData = await getUserPerUsername(username); // 👤 Find user in database!
    if (!userData) {
        logger.warn("User " + username + " not found in Database" + " IP:" + header.get("x-forwarded-for"), "Auth"); // 📝 Log warning!
        return false; // 🚫 User doesn't exist!
    }
    // 🖥️ LDAP authentication path! For domain users! 
    if (config_data.LDAP.ENABLE && !username.startsWith("local/")) {
        let client: LDAP = new LDAP(); // 🖥️ Create LDAP client!
        const ldapUserData = await getAllUsers(); // 📋 Get all LDAP users!
        // 🔍 Find user in LDAP data! Case-insensitive search! 
        const ldapUser = ldapUserData.find(entry => entry.sAMAccountName.toString().toLowerCase() === username.toLowerCase());
        if (!ldapUser) {
            logger.warn("User " + username + " not found in LDAP-Data", "Auth"); // 📝 Not in LDAP!
            return false; // 🚫 LDAP user not found!
        }
        // 🆔 GUID validation! Make sure IDs match! Security! 🛡️
        if (ldapUser.objectGUID !== userData.id) {
            logger.error("User " + username + " has a different GUID in LDAP-Data than the ID in Database", "Auth"); // 🚨 GUID mismatch!
            return false; // 🚫 ID mismatch! Security risk!
        }
        // 🔐 Try LDAP bind! Test the password! 
        if (await client.bind(ldapUser.dn, password, false)) {
            client.unbind(); // 🔓 Unbind LDAP connection!
            const token = generateSessionToken(); // 🎲 Generate session token!
            const session = await createSession(token, userData.id); // 💾 Create session!
            await setSessionTokenCookie(token, session.expiresAt); // 🍪 Set cookie!
            return true; // ✅ LDAP login successful! Welcome! 🎉
        } else {
            client.unbind(); // 🔓 Unbind connection!
            logger.warn("Invalid login credentials for user " + username + " IP:" + header.get("x-forwarded-for"), "Auth"); // 📝 Failed login!
            return false; // 🚫 Wrong password!
        }
    } else {
        // 🔐 Local authentication path! For local users! 
        if (!userData.password) {
            logger.info("User " + username + " has no password set", "Auth"); // 📝 No password!
            return false; // 🚫 No password set! Can't login!
        }
        // 🔐 Compare password hash! Bcrypt comparison! 
        if (await compare(password, userData.password)) {
            const token = generateSessionToken(); // 🎲 Generate token!
            const session = await createSession(token, userData.id); // 💾 Create session!
            await setSessionTokenCookie(token, session.expiresAt); // 🍪 Set cookie!
            return true; // ✅ Local login successful! Welcome! 🎉
        } else {
            logger.warn("Invalid login credentials for user " + username + " IP:" + header.get("x-forwarded-for"), "Auth"); // 📝 Wrong password!
            return false; // 🚫 Password doesn't match!
        }
    }
}