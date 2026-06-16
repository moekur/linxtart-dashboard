import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DASHBOARD_USERNAME = "linxtart-admin";
const DASHBOARD_PASSWORD = "X!9kQ#vR2$mTzL7w";

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(":");
      if (user === DASHBOARD_USERNAME && pass === DASHBOARD_PASSWORD) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="LinXtart Dashboard"' },
  });
}
