import { NextRequest, NextResponse } from "next/server";

/**
 * Basic Auth tuỳ chọn cho app single-user.
 * Chỉ bật khi BOTH biến BASIC_AUTH_USER và BASIC_AUTH_PASSWORD được đặt.
 * Bỏ trống → cho qua (vd môi trường dev).
 */
// TẠM TẮT đăng nhập — true = cho qua tất cả. Đổi thành false để bật lại Basic Auth.
const AUTH_DISABLED: boolean = true;

export function middleware(req: NextRequest) {
  if (AUTH_DISABLED) return NextResponse.next();

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !pass) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const idx = decoded.indexOf(":");
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === pass) return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Vocabulary App"' },
  });
}

export const config = {
  // Áp dụng cho mọi route trừ tài nguyên tĩnh của Next
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
