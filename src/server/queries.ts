"use server";

import { db } from "./db";
import { emails } from "./db/schema";
import { preference } from "./db/schema";
import { eq } from "drizzle-orm";
import { fetchGmails, processFetchedGmails } from "./gmail";

export async function fetchEmails() {
  return await db.select().from(emails).where(eq(emails.is_archived, false)).orderBy(emails.email_time);
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
      email_time: new Date(raw?.timestamp || new Date().toISOString()),
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

export async function archiveEmail(emailId: number) {
  await db
    .update(emails)
    .set({ is_archived: true })
    .where(eq(emails.emailId, emailId));
}


export async function fetchArchivedEmails() {
  return await db
    .select()
    .from(emails)
    .where(eq(emails.is_archived, true))
    .orderBy(emails.email_time);
}

export async function getPreference(){
  const preferenceData = await db.select().from(preference);
  return preferenceData[0]?.summary
}

export async function updatePreference(newPreference: string) {
  try {
    // Update the single row in the preferences table
    await db.update(preference)
      .set({ summary: newPreference }) // Replace 'value' with your column name
      .execute();
    console.log("Preference updated successfully");
  } catch (error) {
    console.error("Error updating preference:", error);
    throw error;
  }
}