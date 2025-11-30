import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiBaseUrl } from "../../../../lib/auth";

async function forwardRequest(req: Request) {
  const token = cookies().get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "Admin authentication required" }, { status: 401 });
  }

  const apiBaseUrl = getApiBaseUrl();
  const url = new URL(req.url);
  const backendUrl = new URL(`${apiBaseUrl}/admin/search-requests`);
  backendUrl.search = url.search;

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, { status: response.status });
}

export async function GET(req: Request) {
  try {
    return await forwardRequest(req);
  } catch (error) {
    return NextResponse.json(
      { detail: "Unable to load search requests." },
      { status: 500 }
    );
  }
}
