import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const idCookie = request.cookies.get("id");
  const id = idCookie?.value.toString();

  const refirectToHome = () =>
    NextResponse.redirect(new URL("/home", request.url));
  const refirectToLogin = () =>
    NextResponse.redirect(new URL("/login", request.url));

  if (request.nextUrl.pathname.startsWith("/login")) {
    if (id) {
      return refirectToHome();
    }
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/home")) {
    if (!id) {
      return refirectToLogin();
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}
