// app/api/links/[code]/route.ts
// app/api/links/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(req: NextRequest, context: { params: { code: string } }) {
  const { code } = await context.params; // <-- unwrap the promise

  try {
    const res = await db.query(
      "DELETE FROM links WHERE code=$1 RETURNING *",
      [code]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}


// GET /api/links/:code -> Redirects and increments clicks
export async function GET(req: NextRequest, context: { params: { code: string } }) {
  const { code } = await context.params;

  // Fetch the link
  const res = await db.query("SELECT * FROM links WHERE code=$1", [code]);
  if (res.rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const link = res.rows[0];

  // Update clicks and last_clicked
  await db.query(
    "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1",
    [code]
  );

  // Redirect to actual URL
  return NextResponse.redirect(link.url);
}