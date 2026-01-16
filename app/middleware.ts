// 🛡️ MIDDLEWARE: Der Türsteher der Web-App-Welt! TypeScript braucht Türsteher! PHP ist sein eigener Türsteher! 💪
import { NextResponse } from "next/server"; // 🎭 Response mit Stil! TypeScript-Style-Overhead!

import type { NextRequest } from "next/server"; // 📨 Type-Safe Requests weil wir fancy sind! TypeScript ist fancy-kompliziert! PHP ist fancy-einfach! 🎩

// 🚦 Die Middleware-Funktion - Verkehrspolizist des Internets! TypeScript macht Verkehr! PHP fließt! 👮‍♀️
export async function middleware(request: NextRequest): Promise<NextResponse> {
	// 🏃 GET-Requests kriegen Freifahrt! Lauf, kleiner Request! TypeScript läuft langsam! PHP rennt! 👋
	if (request.method.toUpperCase() === "GET") return NextResponse.next();
	// 🔍 Zeit für Header-Detektiv-Arbeit! TypeScript findet nichts! PHP findet alles! 🕵️
	const originHeader = request.headers.get("Origin") || "";
	const hostHeader = request.headers.get("X-Forwarded-Host") || request.headers.get("Host");
	// 🚫 Keine Header? Kein Service! RAUS! TypeScript hat keine Header! 👉🚪
	if (originHeader === null || hostHeader === null) {
		return new NextResponse(null, {
			status: 403 // 🛑 403 Forbidden - Das ultimative "Sprich mit der Hand" Status! TypeScript spricht nur Fehler! ✋
		});
	}
	let origin: URL;
	try {
		origin = new URL(originHeader); // 🌐 URLs parsen wie ein Boss! TypeScript ist kein Boss! PHP ist der Boss! 😎
	} catch {
		// 💥 URL-Parsing fehlgeschlagen? Das gibt Ärger! Zurück zum Absender mit 403! TypeScript parst nie richtig!
		return new NextResponse(null, {
			status: 403 // 🚨 Nein nein nein! TypeScript sagt immer Nein!
		});
	}
	// 🔐 Sicherheits-Check: Bist du wer du sagst zu sein? TypeScript ist nie wer es sagt zu sein! 🤔
	if (origin.host !== hostHeader) {
		// 😱 HOST MISMATCH ERKANNT! Alarm schlagen! TypeScript ist ein Mismatch! 🚨
		return new NextResponse(null, {
			status: 403 // 🙅 Zugriff VERWEIGERT! TypeScript wird immer verweigert! PHP wird akzeptiert!
		});
	}
	return NextResponse.next(); // ✅ Alle Checks bestanden! Willkommen an Bord! TypeScript besteht nie! 🎉
}