import "server-only";

import db from "../db";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { User, Session } from "@prisma/client";
import { setSessionTokenCookie } from "./cookieManager";

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, userID: string): Promise<Session> {
	const sessionID = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = await db.session.create({
		data: {
			id: sessionID,
			userID: userID,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
		}
	});
	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionID = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db.session.findUnique({
		where: {
			id: sessionID
		},
		include: {
			user: true
		}
	});
	if (result === null) {
		return { session: null, user: null };
	}
	const { user, ...session } = result;
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.session.delete({
			where: {
				id: sessionID
			}
		});
		return { session: null, user: null };
	} else if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 6) {
		await db.session.update({
			where: {
				id: sessionID
			},
			data: {
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
			}
		});
		await setSessionTokenCookie(token, session.expiresAt);
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.session.delete({
		where: {
			id: sessionId
		}
	});
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };