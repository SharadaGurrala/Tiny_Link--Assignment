// app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// GET /api/links -> list all
export async function GET() {
  const res = await db.query("SELECT id, code, url, clicks, last_clicked FROM links ORDER BY id DESC");
  return NextResponse.json(res.rows);
}

// POST /api/links -> create
export async function POST(req: NextRequest) {
  try {
    const { url, code: rawCode } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    // Validate URL (basic)
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Code handling
    let code = rawCode && String(rawCode).trim();
    if (!code) {
      // generate random 7-char code
      code = Math.random().toString(36).slice(2, 9);
      code = code.replace(/[^A-Za-z0-9]/g, "").slice(0, 7);
      if (code.length < 6) code = code.padEnd(6, "a");
    } else {
      // validate custom code
      if (!CODE_REGEX.test(code)) {
        return NextResponse.json({ error: "Code must be 6-8 alphanumeric characters" }, { status: 400 });
      }
    }

    // check duplicate
    const exists = await db.query("SELECT 1 FROM links WHERE code=$1", [code]);
    if (exists.rowCount > 0) {
      return NextResponse.json({ error: "Code already exists" }, { status: 409 });
    }

    const inserted = await db.query(
      "INSERT INTO links (code, url, clicks) VALUES ($1, $2, 0) RETURNING id, code, url, clicks, last_clicked",
      [code, url]
    );

    return NextResponse.json(inserted.rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/links error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
