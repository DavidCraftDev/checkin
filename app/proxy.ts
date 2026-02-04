import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest): Promise<NextResponse> {
	if (request.method.toUpperCase() === "GET") return NextResponse.next();
	const originHeader = request.headers.get("Origin") || "";
	const hostHeader = request.headers.get("X-Forwarded-Host") || request.headers.get("Host");
	if (originHeader === null || hostHeader === null) {
		return new NextResponse(null, {
			status: 403
		});
	}
	let origin: URL;
	try {
		origin = new URL(originHeader);
	} catch {
		return new NextResponse(null, {
			status: 403
		});
	}
	if (origin.host !== hostHeader) {
		return new NextResponse(null, {
			status: 403
		});
	}
	return NextResponse.next();
}