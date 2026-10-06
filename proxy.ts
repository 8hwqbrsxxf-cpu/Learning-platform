import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

// Optional password gate for self-hosting. Set APP_PASSWORD (and optionally APP_USER, default "admin")
// to require HTTP Basic Auth on every page and API route. Unset = open (fine on a trusted LAN only).

const sha256 = (s: string) => createHash("sha256").update(s).digest();

function credentialsMatch(header: string | null, user: string, password: string): boolean {
  if (!header?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const sep = decoded.indexOf(":");
  if (sep < 0) return false;
  // Hash both sides so the comparison is constant-time regardless of input length.
  const userOk = timingSafeEqual(sha256(decoded.slice(0, sep)), sha256(user));
  const passOk = timingSafeEqual(sha256(decoded.slice(sep + 1)), sha256(password));
  return userOk && passOk;
}

export function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();
  if (credentialsMatch(request.headers.get("authorization"), process.env.APP_USER ?? "admin", password)) {
    return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="CertCoach", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg).*)"],
};
