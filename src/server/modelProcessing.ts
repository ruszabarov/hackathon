import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {z} from 'zod';


console.log(process.env.OPENAI_API_KEY)

const client = new OpenAI({
  apiKey: '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',
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

const ProcessedEmailSchema = z.object({
  summary: z.string(),
  priority: z.number(),                
  intention: z.enum(["Yes", "No"]),    
});

const replyEmailSchema = z.object({
  title: z.string(),
  reply: z.string(),
})


interface CalendarEvent {
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime: string;
  };
  end?: {
    dateTime: string;
  };
  attendees?: { email: string }[];
}

// takes in the email json and a query and return the suggested 
export async function replyWithAI (email: EmailPayload, query: string): Promise<replyEmailPayload> {
  try {
    const systemMessage = {
      role: "system" as const,
      content: `
        You are an AI assistant that drafts professional email replies. The email details will be provided as user content.
        Craft a polite and clear response and appropriate title based on the query and the provided email context.
      `,
    };

    const userMessage = {
      role: "user" as const,
      content: `
        Here is the email information:
        Title: ${email.title}
        Sender: ${email.sender}
        Content: ${email.content}
        Timestamp: ${email.timestamp}
      `,
    };

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-mini", 
      messages: [systemMessage, userMessage],

      response_format: zodResponseFormat(
        replyEmailSchema,
        "reply_email_response"
      ),
    });

    const parsedData = completion.choices[0]?.message?.parsed;
    if (!parsedData) {
      throw new Error("No parsed data returned by the model.");
    }

    return parsedData;


  } catch (err: any) {
    console.error("Error processing email:", err.message);
    throw err;
  }


}

export async function createCalendarEventFromEmail(email: EmailPayload): Promise<CalendarEvent> {

  const calendarEvent: CalendarEvent = {};

  if (email.title) {
    calendarEvent.summary = `Meeting Request: ${email.title}`;
  }

  if (email.content) {
    calendarEvent.description = `Sender: ${email.sender}\n\nMessage:\n${email.content}`;
  }

  if (email.content.toLowerCase().includes("location")) {
    const locationMatch = email.content.match(/location[:\s]*(.*)/i);
    if (locationMatch && locationMatch[1]) {
      calendarEvent.location = locationMatch[1].trim();
    }
  }

  if (email.timestamp) {
    // fetch from Google calander API to see open slots 
    // 
    
  }

  if (email.sender) {
    const senderEmail = email.sender.match(/<(.+)>/); // Extract email from "Name <email>" format
    if (senderEmail && senderEmail[1]) {
      calendarEvent.attendees = [{ email: senderEmail[1] }];
    }
  }

  return calendarEvent;
}


export async function processEmail(
  email: EmailPayload
): Promise<ProcessedEmailPayload> {
  try {
    // Our system instructions: model must return only JSON with specific keys.
    const systemMessage = {
      role: "system" as const,
      content: `
        You are an assistant that extracts a short summary, a numeric priority, 
        and an intention from an email. The email will be provided as user content. 
        Return a JSON object with "summary", "priority", and "intention" only.
      `,
    };

    // Provide the user’s email details & the instructions for output format.
    const userMessage = {
      role: "user" as const,
      content: `
        Here is the email information:
        Title: ${email.title}
        Sender: ${email.sender}
        Content: ${email.content}
        Timestamp: ${email.timestamp}
        
        Please summarize the email content in one or two sentences. 
        Assign a priority (number 0 = highest, through 3 = lowest). 
        If it's purely informative/news, it gets priority 3. 
        Additionally, provide an "intention" of "Yes" or "No" to indicate 
        if the user is requesting a meeting or scheduling something.
        
        Provide the response ONLY as valid JSON with keys:
        "summary", "priority", and "intention".
      `,
    };

    const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-mini", 
      messages: [systemMessage, userMessage],

      response_format: zodResponseFormat(
        ProcessedEmailSchema,
        "processed_email_response"
      ),
    });

    const parsedData = completion.choices[0]?.message?.parsed;
    if (!parsedData) {
      throw new Error("No parsed data returned by the model.");
    }

    return parsedData;
  } catch (err: any) {
    console.error("Error processing email:", err.message);
    throw err;
  }
}



(async () => {
  const sampleEmail = {
    "id": "1949bdd5489a3256",
    "title": "Schedule Meeting Please",
    "sender": "Khoa Luong <minhkhoaluong0128@gmail.com>",
    "content": "I am Khoa. I demand a meeting with you on\r\n",
    "timestamp": "2025-01-25T05:09:09.000Z"
  };

  const query = "Please provide a professional reply confirming the next meeting time.";

  try {
    const responseReplyWithAI = await replyWithAI(sampleEmail, query);
    const processEmailAI = await processEmail(sampleEmail)
    console.log("Generated Reply with AI:", responseReplyWithAI);
    console.log("Processed Email with AI", processEmailAI);
  } catch (error) {
    console.error("Test Error:", error);
  }
})();
