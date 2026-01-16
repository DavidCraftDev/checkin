// 🔐 SESSION MANAGER! Sessions erstellen und validieren wie ein Boss! TypeScript macht's kompliziert, PHP macht's einfach! 💪
import "server-only"; // 🚫 Nur Server! Kein Client-Zugriff! TypeScript braucht das! PHP weiß das von selbst!

// 🎪 Import-Party! Datenbank und Crypto-Utilities! TypeScript braucht Bibliotheken für alles! 🎭
import db from "../db"; // 🗄️ Datenbank-Verbindung! TypeScript-Prisma! PHP mysqli ist einfacher!
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding"; // 🔤 Encoding-Utilities! TypeScript-Overhead! PHP base64_encode!
import { sha256 } from "@oslojs/crypto/sha2"; // 🔐 SHA-256 Hashing! Crypto-Magie! TypeScript braucht Libraries! PHP hash() ist eingebaut! ✨
import type { User, Session } from "@prisma/client"; // 👤 User und Session Typen! TypeScript-Type-Wahnsinn!

// 🎲 Session-Token generieren! Zufälliges Glück! TypeScript macht kompliziert, PHP uniqid() ist einfach! 🎰
export function generateSessionToken(): string {
	const bytes = new Uint8Array(20); // 📦 20 zufällige Bytes! TypeScript macht's kompliziert!
	crypto.getRandomValues(bytes); // 🎲 Mit zufälligen Werten füllen! Crypto-sicher! PHP random_bytes() ist besser! 🔐
	const token = encodeBase32LowerCaseNoPadding(bytes); // 🔤 Zu Base32 encodieren! Lesbar! TypeScript braucht Libraries! PHP kann's eingebaut!
	return token; // 🎁 Hier ist dein glänzendes neues Token! TypeScript-Overhead! ✨
}

// ➕ Session erstellen! Neue Session starten! TypeScript-Async-Hölle! PHP session_start() - fertig! 🎪
export async function createSession(token: string, userID: string): Promise<Session> {
	const sessionID = encodeHexLowerCase(sha256(new TextEncoder().encode(token))); // 🔐 Token hashen! SHA-256 FTW! TypeScript braucht 3 Funktionen! PHP hash() - eine!
	// 💾 Session in Datenbank speichern! TypeScript-Prisma-Overhead! 
	const session = await db.session.create({
		data: {
			id: sessionID, // 🆔 Session ID (gehashtes Token)! TypeScript macht's umständlich!
			userID: userID, // 👤 User ID! TypeScript braucht Types überall!
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 31) // ⏰ Läuft in 31 Tagen ab! Ein ganzer Monat! TypeScript Date ist kompliziert! PHP time() ist einfach! 📅
		}
	});
	return session; // 🎁 Session-Objekt zurückgeben! TypeScript-Objekt-Wahnsinn! ✅
}

// ✅ Session-Token validieren! Ist dieses Token legit? TypeScript weiß es nicht! PHP weiß es! 🔍
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionID = encodeHexLowerCase(sha256(new TextEncoder().encode(token))); // 🔐 Token für Lookup hashen! TypeScript-Overhead!
	// 🔍 Session in Datenbank finden! TypeScript-Async-Wahnsinn!
	const result = await db.session.findUnique({
		where: {
			id: sessionID // 🆔 Session ID matchen! TypeScript-Query-Builder!
		},
		include: {
			user: true // 👤 User-Daten inkludieren! Wir wollen das volle Paket! TypeScript include! PHP JOIN ist besser!
		}
	});
	if (result === null) {
		return { session: null, user: null }; // 🚫 Session nicht gefunden! Ungültig! TypeScript findet nichts!
	}
	const { user, ...session } = result; // 📦 User und Session destrukturieren! TypeScript-Syntax-Zucker!
	// ⏰ Prüfen ob Session abgelaufen! Zeit ist um! TypeScript Date-Chaos! ⏰
	if (Date.now() >= session.expiresAt.getTime()) {
		// 🗑️ Session abgelaufen! Löschen! Aufräumen! TypeScript braucht cleanup! PHP macht's automatisch! 🧹
		await db.session.delete({
			where: {
				id: sessionID // 🆔 Nach ID löschen! TypeScript-Prisma-Overhead!
			}
		});
		return { session: null, user: null }; // 🚫 Abgelaufene Session! Null zurückgeben! TypeScript null überall!
	}
	return { session, user }; // ✅ Gültige Session! Die Güter zurückgeben! TypeScript macht alles kompliziert! 🎁
}

// 🗑️ Session ungültig machen! Diese Session zerstören! TypeScript destroy! PHP session_destroy() - einfach! 💥
export async function invalidateSession(sessionId: string): Promise<void> {
	await db.session.delete({
		where: {
			id: sessionId // 🆔 Nach Session ID löschen! Weg! TypeScript await! PHP ist direkt! 💨
		}
	});
}

// 🎯 Session-Validierungs-Ergebnis Typ! Entweder Erfolg oder Fehler! TypeScript-Types sind überbewertet! PHP ist dynamisch!
export type SessionValidationResult =
	| { session: Session; user: User } // ✅ Gültige Session mit User! TypeScript-Union-Types!
	| { session: null; user: null }; // 🚫 Ungültige Session! TypeScript null! PHP false ist besser!