"use server";
import { google } from "googleapis";
import { auth } from "@clerk/nextjs/server";
import { getOAuthClient } from "./googleCalendar";
import path from "path";
import fs from "fs";
import {
  EmailPayload,
  ProcessedEmailPayload,
  processEmail,
} from "./modelProcessing";

export async function fetchGmails() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const oAuthClient = await getOAuthClient(userId);
  if (!oAuthClient) {
    throw new Error("Failed to get OAuth client");
  }

  const gmail = google.gmail({ version: "v1", auth: oAuthClient });
  const query = "is:unread";

  try {
    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 50,
    });

    const messages = listRes.data.messages ?? [];
    if (messages.length === 0) {
      console.log("No unread messages found.");
      return [];
    }

    const emailData = [];
    for (const msg of messages) {
      if (!msg.id) continue;

      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const headers = detail.data.payload?.headers ?? [];
      const subjectHeader = headers.find((h) => h.name === "Subject");
      const fromHeader = headers.find((h) => h.name === "From");

      const title = subjectHeader?.value ?? "No Subject";
      const sender = fromHeader?.value ?? "Unknown Sender";
      const timestamp = detail.data.internalDate
        ? new Date(Number(detail.data.internalDate)).toISOString()
        : "Unknown Timestamp";

      const bodyParts = detail.data.payload?.parts ?? [];
      const textPart = bodyParts.find((part) => part.mimeType === "text/plain");
      const content = textPart?.body?.data
        ? Buffer.from(textPart.body.data, "base64").toString("utf-8")
        : "No Content";

      emailData.push({ id: msg.id, title, sender, content, timestamp });

      await gmail.users.messages.modify({
        userId: "me",
        id: msg.id,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });
    }

    return emailData;
  } catch (error) {
    console.error("Error fetching Gmail messages:", error);
    throw error;
  }
}

export async function processFetchedGmails(
  emailData: EmailPayload[],
): Promise<ProcessedEmailPayload[]> {
  try {
    const processedEmails: ProcessedEmailPayload[] = [];

    for (const email of emailData) {
      const processed = await processEmail(email);
      processedEmails.push(processed);
    }

    const OUTPUT_PATH = path.join(process.cwd(), "processed_emails.json");
    fs.writeFileSync(
      OUTPUT_PATH,
      JSON.stringify(processedEmails, null, 2),
      "utf8",
    );

    console.log("Processed emails have been saved to processed_emails.json");
    return processedEmails;
  } catch (error) {
    console.error("Error processing fetched emails:", error);
    throw error;
  }
}

export async function sendEmail(to: string, subject: string, body: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const oAuthClient = await getOAuthClient(userId);
  if (!oAuthClient) {
    throw new Error("Failed to get OAuth client");
  }

  const gmail = google.gmail({ version: "v1", auth: oAuthClient });

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${utf8Subject}`,
    "",
    body,
  ];
  const message = messageParts.join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log("Email sent successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}