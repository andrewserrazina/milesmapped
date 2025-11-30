import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiBaseUrl } from "../../../../../lib/auth";

async function forwardToBackend(req: Request, requestId: string) {
  const token = cookies().get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "Admin authentication required" }, { status: 401 });
  }

  const apiBaseUrl = getApiBaseUrl();
  const backendUrl = `${apiBaseUrl}/admin/search-requests/${requestId}`;

  const response = await fetch(backendUrl, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(req.method === "PATCH" ? { "Content-Type": "application/json" } : {})
    },
    body: req.method === "PATCH" ? await req.text() : undefined,
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);
  return NextResponse.json(data, { status: response.status });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    return await forwardToBackend(req, params.id);
  } catch (error) {
    return NextResponse.json({ detail: "Unable to load request" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    return await forwardToBackend(req, params.id);
  } catch (error) {
    return NextResponse.json({ detail: "Unable to update request" }, { status: 500 });
  }
}
