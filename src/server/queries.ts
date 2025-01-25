import { db } from "./db";
import { emails } from "./db/schema";
import { eq } from "drizzle-orm";

export async function fetchEmails() {
  return await db.select().from(emails).orderBy(emails.email_time);
}

export async function fetchEmail(emailId: number) {
  return await db.query.emails.findFirst({
    where: eq(emails.emailId, emailId),
  });
}
