import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:8000";
const API_SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/meal-plan/regenerate-meal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_SECRET ? { "X-Api-Secret": API_SECRET } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
