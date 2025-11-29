import { NextResponse } from "next/server";
import { clearAuthCookie } from "../../../../lib/auth";

export async function POST() {
  const response = NextResponse.redirect("/");
  clearAuthCookie(response);
  return response;
}
