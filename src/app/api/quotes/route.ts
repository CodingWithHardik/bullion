import { getQuotes } from "@/lib/market";
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(
        { quotes: getQuotes(), ts: Date.now() },
        { headers: { "Cache-Control": "no-store" }}
    )
}