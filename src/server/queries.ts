"use server";

import { db } from "./db";
import { emails } from "./db/schema";
import { eq } from "drizzle-orm";
import { fetchGmails, processFetchedGmails } from "./gmail";

export async function fetchEmails() {
  return await db.select().from(emails).orderBy(emails.email_time);
}

export async function fetchEmail(emailId: number) {
  return await db.query.emails.findFirst({
    where: eq(emails.emailId, emailId),
  });
}

export async function fetchProcessAndStoreEmails() {
  const rawEmails = await fetchGmails();

  const processedEmails = await processFetchedGmails(rawEmails);

  for (let i = 0; i < rawEmails.length; i++) {
    const raw = rawEmails[i];
    const processed = processedEmails[i];

    await db.insert(emails).values({
      sender: raw?.sender,
      summary: processed?.summary,
      priority: processed?.priority,
      title: raw?.title,
      email_time: new Date(raw?.timestamp || Date.now()),
      originalContent: raw?.content,
    });
  }
  console.log("Successfully inserted emails into DB");
}

export async function updateEmailStatus(emailId: number, repliedStatus: string) {
  await db
    .update(emails)
    .set({ replied: repliedStatus })
    .where(eq(emails.emailId, emailId));
}