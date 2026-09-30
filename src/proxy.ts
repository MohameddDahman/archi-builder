import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first) || first === "admin") return;

  const prefersArabic = /^ar\b/i.test(request.headers.get("accept-language") ?? "");
  const locale = prefersArabic ? "ar" : defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|brand|favicon.ico|icon|.*\\..*).*)"],
};
