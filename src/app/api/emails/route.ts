import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { emails } from "../../../server/db/schema";
import { db } from "../../../server/db";

export async function GET() {
  try {
    const allEmails = await db.select().from(emails).orderBy(desc(emails.time));

    return NextResponse.json(allEmails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 },
    );
  }
}
