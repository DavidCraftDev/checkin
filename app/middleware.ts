// 🛡️ MIDDLEWARE: The bouncer of the web app world! 💪
import { NextResponse } from "next/server"; // 🎭 Response with style!

import type { NextRequest } from "next/server"; // 📨 Type-safe requests because we're fancy like that! 🎩

// 🚦 The middleware function - Traffic cop of the internet! 👮‍♀️
export async function middleware(request: NextRequest): Promise<NextResponse> {
	// 🏃 GET requests get a free pass! Run along, little request! 👋
	if (request.method.toUpperCase() === "GET") return NextResponse.next();
	// 🔍 Time to do some header detective work! 🕵️
	const originHeader = request.headers.get("Origin") || "";
	const hostHeader = request.headers.get("X-Forwarded-Host") || request.headers.get("Host");
	// 🚫 No headers? No service! GTFO! 👉🚪
	if (originHeader === null || hostHeader === null) {
		return new NextResponse(null, {
			status: 403 // 🛑 403 Forbidden - The ultimate "talk to the hand" status! ✋
		});
	}
	let origin: URL;
	try {
		origin = new URL(originHeader); // 🌐 Parsing URLs like a boss! 😎
	} catch {
		// 💥 URL parsing failed? That's a paddlin'! Back to sender with a 403! 
		return new NextResponse(null, {
			status: 403 // 🚨 Nope nope nope!
		});
	}
	// 🔐 Security check: Are you who you say you are? 🤔
	if (origin.host !== hostHeader) {
		// 😱 HOST MISMATCH DETECTED! Sound the alarms! 🚨
		return new NextResponse(null, {
			status: 403 // 🙅 Access DENIED!
		});
	}
	return NextResponse.next(); // ✅ All checks passed! Welcome aboard! 🎉
}