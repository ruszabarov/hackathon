import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getPreference } from "./queries";
import type { BusyEvent } from "./googleCalendar";

console.log(process.env.OPENAI_API_KEY);

export interface CalendarEventPayload {
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

const client = new OpenAI({
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
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

export async function fetchTimeFromTask(
  task: string,
  busyEvents: BusyEvent[],
): Promise<CalendarEventPayload | undefined> {
  try {
    const preference = await getPreference()
    // System prompt: instruct the model exactly how to respond
    const systemMessage = {
      role: "system" as const,
      content: `
        You are an assistant that schedule events given task. 
        The task content will be provided, and your task is to propose a single 
        calendar event in valid JSON. 
        - The "start" and "end" must be valid date/time in ISO 8601 format.
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
      Here is the task:

      Title: ${task}


      Here is the user preference:
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
    console.error("Error fetching time from task:", error);
    return undefined;
  }
}
