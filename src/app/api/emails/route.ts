import { fetchEmails } from "../../../server/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const emails = await fetchEmails();
    return NextResponse.json(emails);
  } catch (error) {
    console.error("Failed to fetch emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 },
    );
  }
}

