import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const payload = await request.json();
  const apiBaseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${apiBaseUrl}/loyalty/balances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "Unable to update balance" }, { status: 500 });
  }
}
