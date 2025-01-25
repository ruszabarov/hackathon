import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  EmailPayload,
  processEmail,
  ProcessedEmailPayload,
} from "./modelProcessing";

interface Credentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function fetchGmails(): Promise<EmailPayload[]> {
  try {
    // 1. Load token.json
    const TOKEN_PATH = path.join(__dirname, "..", "..", "token.json");
    if (!fs.existsSync(TOKEN_PATH)) {
      throw new Error("token.json not found.");
    }
    const tokens = JSON.parse(
      fs.readFileSync(TOKEN_PATH, "utf8"),
    ) as Credentials;

    // 2. Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // 5. Query for unread emails
    const query = "is:unread";

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

    const emailData: EmailPayload[] = [];

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

      // Decode the email body (handles text/plain in this example)
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

    // Process emails
    // const processedEmails: ProcessedEmail[] = [];
    // for (const email of emailData) {
    //   const processed = await processEmail(email);
    //   processedEmails.push(processed);
    // }

    // const OUTPUT_PATH = path.join(process.cwd(), 'processed_emails.json');
    // fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedEmails, null, 2), 'utf8');
    // console.log('Processed emails have been saved to processed_emails.json');

    return emailData;
  } catch (error) {
    console.error("Error in fetchGmails:", error);
    throw error;
  }
}

export async function processFetchedGmails(
  emailData: EmailPayload[],
): Promise<ProcessedEmailPayload[]> {
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
}

async function testFetchGmails() {
  try {
    const emails = await fetchGmails();
    const processedEmails = await processFetchedGmails(emails);
    console.log("Fetched emails:", emails);
    console.log("Processed emails", processedEmails);
  } catch (error) {
    console.error("Error testing fetchGmails:", error);
  }
}

// Immediately run the test when this file is executed
void (async () => {
  await testFetchGmails();
})();
