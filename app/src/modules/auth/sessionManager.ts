// 🔐 SESSION MANAGER! Creating and validating sessions like a boss! 💪
import "server-only"; // 🚫 Server-only! No client access!

// 🎪 Import party! Database and crypto utilities! 🎭
import db from "../db"; // 🗄️ Database connection!
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding"; // 🔤 Encoding utilities!
import { sha256 } from "@oslojs/crypto/sha2"; // 🔐 SHA-256 hashing! Crypto magic! ✨
import type { User, Session } from "@prisma/client"; // 👤 User and Session types!

// 🎲 Generate session token! Random goodness! 🎰
export function generateSessionToken(): string {
	const bytes = new Uint8Array(20); // 📦 20 random bytes!
	crypto.getRandomValues(bytes); // 🎲 Fill with random values! Crypto-secure! 🔐
	const token = encodeBase32LowerCaseNoPadding(bytes); // 🔤 Encode to Base32! Readable!
	return token; // 🎁 Here's your shiny new token! ✨
}

// ➕ Create session! Start a new session! 🎪
export async function createSession(token: string, userID: string): Promise<Session> {
	const sessionID = encodeHexLowerCase(sha256(new TextEncoder().encode(token))); // 🔐 Hash the token! SHA-256 FTW!
	// 💾 Save session to database! 
	const session = await db.session.create({
		data: {
			id: sessionID, // 🆔 Session ID (hashed token)!
			userID: userID, // 👤 User ID!
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 31) // ⏰ Expires in 31 days! A whole month! 📅
		}
	});
	return session; // 🎁 Return the session object! ✅
}

// ✅ Validate session token! Is this token legit? 🔍
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionID = encodeHexLowerCase(sha256(new TextEncoder().encode(token))); // 🔐 Hash token for lookup!
	// 🔍 Find session in database!
	const result = await db.session.findUnique({
		where: {
			id: sessionID // 🆔 Match session ID!
		},
		include: {
			user: true // 👤 Include user data! We want the full package!
		}
	});
	if (result === null) {
		return { session: null, user: null }; // 🚫 Session not found! Invalid! 
	}
	const { user, ...session } = result; // 📦 Destructure user and session!
	// ⏰ Check if session expired! Time's up! ⏰
	if (Date.now() >= session.expiresAt.getTime()) {
		// 🗑️ Session expired! Delete it! Clean up! 🧹
		await db.session.delete({
			where: {
				id: sessionID // 🆔 Delete by ID!
			}
		});
		return { session: null, user: null }; // 🚫 Expired session! Return null!
	}
	return { session, user }; // ✅ Valid session! Return the goods! 🎁
}

// 🗑️ Invalidate session! Destroy that session! 💥
export async function invalidateSession(sessionId: string): Promise<void> {
	await db.session.delete({
		where: {
			id: sessionId // 🆔 Delete by session ID! Gone! 💨
		}
	});
}

// 🎯 Session validation result type! Either success or failure! 
export type SessionValidationResult =
	| { session: Session; user: User } // ✅ Valid session with user!
	| { session: null; user: null }; // 🚫 Invalid session!