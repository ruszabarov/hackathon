"use server";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { endOfDay, startOfDay } from "date-fns";

export async function getCalendarEventTimes({
  start,
  end,
}: {
  start: Date;
  end: Date;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const oAuthClient = await getOAuthClient(userId);
  if (!oAuthClient) {
    throw new Error("Failed to get OAuth client");
  }

  const events = await google.calendar("v3").events.list({
    calendarId: "primary",
    eventTypes: ["default"],
    singleEvents: true,
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 2500,
    auth: oAuthClient,
  });

  return (
    events.data.items
      ?.map((event) => {
        if (event.start?.date != null && event.end?.date != null) {
          return {
            start: startOfDay(event.start.date),
            end: endOfDay(event.end.date),
          };
        }

        if (event.start?.dateTime != null && event.end?.dateTime != null) {
          return {
            start: new Date(event.start.dateTime),
            end: new Date(event.end.dateTime),
          };
        }
      })
      .filter((date) => date != null) ?? []
  );
}

async function getOAuthClient(clerkUserId: string) {
  const clerk = await clerkClient();

  const token = await clerk.users.getUserOauthAccessToken(
    clerkUserId,
    "oauth_google",
  );

  if (token.data.length === 0 || token.data[0].token == null) {
    return;
  }

  const client = new google.auth.OAuth2(
    process.env.OAUTH2_CLIENT_ID,
    process.env.OAUTH2_CLIENT_SECRET,
    process.env.OAUTH2_REDIRECT_URL,
  );

  client.setCredentials({ access_token: token.data[0].token });

  return client;
}
