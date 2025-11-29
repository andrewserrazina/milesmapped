import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl, setAuthCookie } from "../../../../lib/auth";

type LoginPayload = {
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const payload: LoginPayload = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? "")
  };

  if (!payload.email || !payload.password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = (result as { detail?: string }).detail ?? "Unable to sign in.";
      return NextResponse.json({ message }, { status: response.status });
    }

    const token = (result as { access_token?: string }).access_token;

    if (!token) {
      return NextResponse.json({ message: "No access token received from the server." }, { status: 500 });
    }

    const nextResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    setAuthCookie(nextResponse, token);
    return nextResponse;
  } catch (error) {
    return NextResponse.json({ message: "Unexpected error during sign in." }, { status: 500 });
  }
}
