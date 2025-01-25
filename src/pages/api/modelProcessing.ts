import OpenAI from "openai";



console.log(process.env.OPENAI_API_KEY)

const client = new OpenAI({
  apiKey: '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',
});

interface EmailPayload {
  title: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ProcessedEmail {
  summary: string;
  priority: string;
}



export async function processEmail(email: EmailPayload): Promise<ProcessedEmail> {
  try {
    const systemMessage = {
      role: "system",
      content:
        "You are an assistant that extracts a short summary and a priority from an email. " +
        "The email will be provided as user content. " +
        'Return a JSON object with "summary" and "priority" only.',
    };

    const userMessage = {
      role: "user",
      content: `
        Here is the email information:
        Title: ${email.title}
        Sender: ${email.sender}
        Content: ${email.content}
        Timestamp: ${email.timestamp}
        
        Please summarize the email content in one or two sentences, 
        and assign a priority (e.g., "High", "Medium", "Low"). 
        Provide the response ONLY as valid JSON with the keys "summary" and "priority".
      `,
    };

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [{
        role: "system",
        content:
          "You are an assistant that extracts a short summary and a priority from an email. " +
          "The email will be provided as user content. " +
          'Return a JSON object with "summary" and "priority" only.',
        },
        
        {
        role: "user",
        content: `
          Here is the email information:
          Title: ${email.title}
          Sender: ${email.sender}
          Content: ${email.content}
          Timestamp: ${email.timestamp}
          
          Please summarize the email content in one or two sentences, 
          and assign a priority (e.g., "High", "Medium", "Low", "None"). If it's news then put None. 
          Provide the response ONLY as valid JSON with the keys "summary" and "priority".
        `,
      }],
      model: 'gpt-4o-mini',
    };
    const chatCompletion: OpenAI.Chat.ChatCompletion = await client.chat.completions.create(params);
  

    if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
      throw new Error("No choices returned from OpenAI.");
    }

    const assistantMessage = chatCompletion.choices[0]?.message?.content?.trim();
    if (!assistantMessage) {
      throw new Error("No valid response message content from OpenAI.");
    }

    try {
      const parsedJson: ProcessedEmail = JSON.parse(assistantMessage);
      return parsedJson;
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      throw new Error("Invalid JSON response from OpenAI.");
    }
  } catch (error: any) {
    console.error("Error processing email:", error.message);
    throw error;
  }
}

// Example usage
(async () => {
  const emailPayload: EmailPayload = {
    title: "Schedule Meeting Please",
    sender: "Khoa Luong <minhkhoaluong0128@gmail.com>",
    content: "I am Khoa. I demand a meeting with you.",
    timestamp: "2025-01-25T02:12:27.000Z",
  };

  try {
    const result = await processEmail(emailPayload);
    console.log("Processed Email:", result);
  } catch (err) {
    console.error(err);
  }
})();
