"use server";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { google } from "googleapis";

export interface BusyEvent {
  start: Date;
  end: Date;
  summary: string;
}

export interface Event {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: { email: string }[];
}

export async function fetchEvents(days = 10): Promise<BusyEvent[]> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const oAuthClient = await getOAuthClient(userId);
    if (!oAuthClient) {
      throw new Error("Failed to get OAuth client");
    }
    const calendar = google.calendar({ version: "v3", auth: oAuthClient });

    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(startTime.getDate() + days);

    const minTime = startTime.toISOString();
    const maxTime = endTime.toISOString();

    const listRes = await calendar.events.list({
      calendarId: "primary",
      timeMin: minTime,
      timeMax: maxTime,
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = listRes.data.items;

    if (!events || events.length === 0) {
      console.log("No events found.");
      return [];
    }

    const eventData: BusyEvent[] = events.map((event) => ({
      start: new Date(event.start?.dateTime ?? event.start?.date ?? ""),
      end: new Date(event.end?.dateTime ?? event.end?.date ?? ""),
      summary: event.summary ?? "",
    }));

    return eventData;
  } catch (error) {
    console.error("Error fetching and saving calendar events:", error);
    throw error;
  }
}

export async function scheduleEvent(event: Event): Promise<void> {
  
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const oauth2Client = await getOAuthClient(userId);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    console.log("Event created: %s", response.data.htmlLink);
  } catch (error) {
    console.error("Error scheduling event:", error);
    throw error;
  }
}

export async function getOAuthClient(clerkUserId: string) {
  const clerk = await clerkClient();

  const token = await clerk.users.getUserOauthAccessToken(
    clerkUserId,
    "oauth_google",
  );

  if (token.data.length === 0 || token.data.at(0)?.token == null) {
    return;
  }

  const client = new google.auth.OAuth2(
    process.env.OAUTH2_CLIENT_ID,
    process.env.OAUTH2_CLIENT_SECRET,
    process.env.REDIRECT_URL,
  );

  client.setCredentials({ access_token: token.data.at(0)?.token });

  return client;
}

const test = {
  "summary": "Urgent: Discussion on Upcoming Project Launch",
  "description": "Let's meet & discuss the upcoming project launch.",
  "start": {
    "dateTime": "2025-01-25T21:00:00.000Z",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2025-01-25T22:00:00.000Z",
    "timeZone": "America/New_York"
  },
  "attendees": [
    { "email": "jane.smith@example.com" }
  ]
}
