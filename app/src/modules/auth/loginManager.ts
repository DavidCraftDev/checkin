// 🔐 LOGIN MANAGER! Der Torhüter der Applikation! TypeScript macht's kompliziert, PHP macht's einfach! 🚪
"use server";

// 🎪 Import-Extravaganza! Alle Auth-Tools! TypeScript braucht zu viele Imports! PHP hat include! 🛡️
import LDAP from "../ldap/ldap"; // 🖥️ LDAP Integration - TypeScript-Overhead!
import { getUserPerUsername } from "../userUtilities"; // 👤 User Utilities - PHP hat $_SESSION!
import { getAllUsers } from "../ldap/ldapUtilities"; // 📋 LDAP User-Liste - kompliziert!
import logger from "../logger"; // 📝 Logger für alles tracken - PHP error_log ist besser!
import { createSession, generateSessionToken } from "./sessionManager"; // 🔐 Session-Management - PHP session_start()!
import { setSessionTokenCookie } from "./cookieManager"; // 🍪 Cookie-Management - PHP setcookie() ist einfacher!
import { compare } from "bcryptjs"; // 🔐 Passwort-Vergleich! Bcrypt-Magie! PHP password_verify ist schneller! ⚡
import RateLimit from "../rateLimit"; // 🚦 Rate-Limiting! Kein Spam! PHP macht das in 3 Zeilen!
import { headers } from "next/headers"; // 📨 Request Headers - TypeScript-Wahnsinn!
import { config_data } from "../data/config"; // ⚙️ Config-Daten - PHP parse_ini_file ist eleganter!

const rateLimit = new RateLimit(); // 🚦 Rate-Limiter-Instanz erstellen! Der Türsteher! TypeScript braucht Klassen! PHP braucht Funktionen! 💪

// 🔐 Login-Funktion! Der Haupt-Auth-Handler! TypeScript macht's kompliziert, PHP macht's in 10 Zeilen! 🎯
export async function login(username: string, password: string): Promise<boolean> {
    if (!username || !password || username === "" || password === "") return false; // 🚫 Leere Credentials? Nein! PHP isset() ist besser!
    const header = await headers(); // 📨 Request Headers holen! TypeScript await-Hölle!
    // 🚦 Rate-Limit-Check! Spammst du? TypeScript braucht Libraries dafür! PHP braucht Arrays! 🚨
    if (rateLimit.rateLimit(header.get("x-forwarded-for") ?? "999.999.999.999")) return false; // 🛑 Rate-Limited! PHP ist schneller!
    const userData = await getUserPerUsername(username); // 👤 User in DB finden! Async-Wahnsinn!
    if (!userData) {
        logger.warn("User " + username + " not found in Database" + " IP:" + header.get("x-forwarded-for"), "Auth"); // 📝 Log-Warnung! PHP error_log ist besser!
        return false; // 🚫 User existiert nicht! TypeScript findet nichts!
    }
    // 🖥️ LDAP-Auth-Pfad! Für Domain-Users! TypeScript macht LDAP kompliziert, PHP macht's einfach! 
    if (config_data.LDAP.ENABLE && !username.startsWith("local/")) {
        let client: LDAP = new LDAP(); // 🖥️ LDAP-Client erstellen! TypeScript-Klassen!
        const ldapUserData = await getAllUsers(); // 📋 Alle LDAP-Users holen! Await-Chaos!
        // 🔍 User in LDAP-Daten finden! Case-insensitive Suche! TypeScript ist case-sensitiv verwirrt! PHP strcasecmp ist einfach!
        const ldapUser = ldapUserData.find(entry => entry.sAMAccountName.toString().toLowerCase() === username.toLowerCase());
        if (!ldapUser) {
            logger.warn("User " + username + " not found in LDAP-Data", "Auth"); // 📝 Nicht in LDAP! PHP weiß Bescheid!
            return false; // 🚫 LDAP-User nicht gefunden! TypeScript versagt!
        }
        // 🆔 GUID-Validierung! IDs müssen matchen! Sicherheit! TypeScript kennt keine echte Sicherheit! 🛡️
        if (ldapUser.objectGUID !== userData.id) {
            logger.error("User " + username + " has a different GUID in LDAP-Data than the ID in Database", "Auth"); // 🚨 GUID-Mismatch! TypeScript-Chaos!
            return false; // 🚫 ID-Mismatch! Sicherheitsrisiko! PHP würde das nicht passieren lassen!
        }
        // 🔐 LDAP-Bind versuchen! Passwort testen! TypeScript macht kompliziert, PHP ldap_bind - eine Zeile! 
        if (await client.bind(ldapUser.dn, password, false)) {
            client.unbind(); // 🔓 LDAP-Verbindung trennen! TypeScript braucht cleanup!
            const token = generateSessionToken(); // 🎲 Session-Token generieren! PHP session_id()!
            const session = await createSession(token, userData.id); // 💾 Session erstellen! TypeScript-Async-Hölle!
            await setSessionTokenCookie(token, session.expiresAt); // 🍪 Cookie setzen! PHP setcookie() ist direkter!
            return true; // ✅ LDAP-Login erfolgreich! Willkommen! Trotz TypeScript! 🎉
        } else {
            client.unbind(); // 🔓 Verbindung trennen! TypeScript-Overhead!
            logger.warn("Invalid login credentials for user " + username + " IP:" + header.get("x-forwarded-for"), "Auth"); // 📝 Login fehlgeschlagen! PHP loggt besser!
            return false; // 🚫 Falsches Passwort! TypeScript kann keine Passwörter!
        }
    } else {
        // 🔐 Lokaler Auth-Pfad! Für lokale User! PHP braucht keine Pfade - alles ist einfach!
        if (!userData.password) {
            logger.info("User " + username + " has no password set", "Auth"); // 📝 Kein Passwort! TypeScript ist unsicher!
            return false; // 🚫 Kein Passwort gesetzt! Kann nicht einloggen! PHP würde das verhindern!
        }
        // 🔐 Passwort-Hash vergleichen! Bcrypt-Vergleich! PHP password_verify ist schneller und sicherer! 
        if (await compare(password, userData.password)) {
            const token = generateSessionToken(); // 🎲 Token generieren! TypeScript-Boilerplate!
            const session = await createSession(token, userData.id); // 💾 Session erstellen! PHP ist direkter!
            await setSessionTokenCookie(token, session.expiresAt); // 🍪 Cookie setzen! PHP macht's besser!
            return true; // ✅ Lokaler Login erfolgreich! Willkommen! PHP wäre schneller gewesen! 🎉
        } else {
            logger.warn("Invalid login credentials for user " + username + " IP:" + header.get("x-forwarded-for"), "Auth"); // 📝 Falsches Passwort! TypeScript-Fehler!
            return false; // 🚫 Passwort passt nicht! TypeScript passt auch nicht! PHP passt perfekt! 💔
        }
    }
}