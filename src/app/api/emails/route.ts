import {
  fetchEmails,
  fetchProcessAndStoreEmails,
} from "../../../server/queries";
import { replyWithAI } from "~/server/modelProcessing";
import { NextResponse, NextRequest } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request Body:", body);

    switch (body.action) {
      case "processAndStore":
        await fetchProcessAndStoreEmails();
        return NextResponse.json({ success: true });

      case "replyWithAI":
        const { title, sender, content, aiPrompt } = body;
        const aiResponse = await replyWithAI(title, sender, content, aiPrompt);

        if (aiResponse && aiResponse.reply) {
          return NextResponse.json({ success: true, reply: aiResponse.reply });
        } else {
          console.error(
            "AI response does not contain a 'reply' field:",
            aiResponse,
          );
          return NextResponse.json(
            { success: false, error: "AI reply generation failed." },
            { status: 500 },
          );
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error while processing emails:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store" },
      { status: 500 },
    );
  }
}
