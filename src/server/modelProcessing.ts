import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { getPreference } from "./queries";
import type { BusyEvent } from "./googleCalendar";
import { z } from "zod";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EmailPayload {
  id: string;
  title: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface ProcessedEmailPayload {
  summary: string;
  priority: number;
  intention: "Yes" | "No";
}

interface replyEmailPayload {
  title: string;
  reply: string;
}

interface CalendarEventPayload {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
}

const ProcessedEmailSchema = z.object({
  summary: z.string(),
  priority: z.number(),
  intention: z.enum(["Yes", "No"]),
});

const replyEmailSchema = z.object({
  title: z.string(),
  reply: z.string(),
});

const CalendarEventSchema = z.object({
  summary: z.string(),
  description: z.string(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  attendees: z
    .array(
      z.object({
        email: z.string(),
      }),
    )
    .optional(),
});

export async function fetchTimeFromEmail(
  email: EmailPayload,
  busyEvents: BusyEvent[],
): Promise<CalendarEventPayload | undefined> {
  try {
    const preference = await getPreference()
    // System prompt: instruct the model exactly how to respond
    const systemMessage = {
      role: "system" as const,
      content: `
        You are an assistant that extracts event details from emails.
        The email content will be provided, and your task is to propose a single 
        calendar event in valid JSON. 
        - The "start" and "end" must be valid date/time in ISO 8601 format. Do not schedule past 6PM.
        - Schedule a date and time that is free. Here are the user's busy slots:
        ${JSON.stringify(busyEvents, null, 2)}
        - "summary" should be no longer than 120 characters.
        - "timezone" should be determined based on the email or busy events. If not specified, default to "UTC". 
        - "description" is optional but can include extra context (like the original email text or a short summary).
        - If a relevant "preference" is provided, customize the result to align with that preference.
      `,
    };
    console.log(systemMessage);

    // User prompt: includes the raw email
    const userMessage = {
      role: "user" as const,
      content: `
      Here is the email:

      Title: ${email.title}
      Sender: ${email.sender}
      Content: ${email.content}
      Timestamp: ${email.timestamp}

      Here is the preference string: 
      ${preference?.length ? preference : "no preference"}

      Please return only a single JSON object matching the schema above and nothing else.
      `,
    };
    console.log(userMessage);

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [systemMessage, userMessage],
      response_format: zodResponseFormat(CalendarEventSchema, "calendar_event"),
    });

    // 2) Model's proposed event
    const proposedEvent = completion.choices[0]?.message?.parsed;
    if (!proposedEvent) {
      throw new Error("No parsed data returned by the model.");
    }

    const proposedStart = new Date(proposedEvent.start.dateTime);
    const proposedEnd = new Date(proposedEvent.end.dateTime);

    proposedEvent.start.dateTime = proposedStart.toISOString();
    proposedEvent.end.dateTime = proposedEnd.toISOString();

    return proposedEvent;
  } catch (error) {
    console.error("Error fetching time from email:", error);
    return undefined;
  }
}

// takes in the email json and a query and return the suggested
export async function replyWithAI(
  title: string,
  sender: string,
  content: string,
  query: string,
): Promise<replyEmailPayload> {
  try {
    const preference = await getPreference()
    const systemMessage = {
      role: "system" as const,
      content: `
        You are an AI assistant that drafts email replies. The email details will be provided as user content.
        Craft a clear and appropriate response and appropriate title based on the query and the provided email context. 
        If a relevant "preference" is provided, customize the result to align with that preference.
        Users query: ${query}
        User preference: ${preference?.length ? preference : "no preference"}
      `,
    };

    const userMessage = {
      role: "user" as const,
      content: `
        Here is the email information:
        Title: ${title}
        Sender: ${sender}
        Content: ${content}
      `,
    };

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [systemMessage, userMessage],

      response_format: zodResponseFormat(
        replyEmailSchema,
        "reply_email_response",
      ),
    });

    const parsedData = completion.choices[0]?.message?.parsed;
    if (!parsedData) {
      throw new Error("No parsed data returned by the model.");
    }

    return parsedData;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error processing email:", errorMessage);
    throw err;
  }
}

export async function processEmail(
  email: EmailPayload,
): Promise<ProcessedEmailPayload> {
  try {
    const preference = await getPreference()
    // Our system instructions: model must return only JSON with specific keys.
    const systemMessage = {
      role: "system" as const,
      content: `
        You are an assistant that extracts a short summary, a numeric priority, 
        and an intention from an email. The email will be provided as user content. 
        If a "preference" is provided, customize the result to align with that preference.
        Return a JSON object with "summary", "priority", and "intention" only.
      `,
    };

    // Provide the user's email details & the instructions for output format.
    const userMessage = {
      role: "user" as const,
      content: `
        Here is the email information:
        Title: ${email.title}
        Sender: ${email.sender}
        Content: ${email.content}
        Timestamp: ${email.timestamp}
        
        User Preference:  ${preference?.length ? preference : "no preference"}

        Please summarize the email content as concicse as possible. 
        Assign a priority (number 0 = highest, through 3 = lowest). 
        If it's purely informative/news, it gets priority 3. 
        Provide an "intention" of "Yes" or "No" to indicate 
        if the user is requesting a meeting or scheduling something.
      `,
    };

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [systemMessage, userMessage],

      response_format: zodResponseFormat(
        ProcessedEmailSchema,
        "processed_email_response",
      ),
    });

    const parsedData = completion.choices[0]?.message?.parsed;
    if (!parsedData) {
      throw new Error("No parsed data returned by the model.");
    }

    return parsedData;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error processing email:", errorMessage);
    throw err;
  }
}
