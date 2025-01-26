"use server";

import { replyWithAI } from "./modelProcessing";

export interface ReplyWithAIResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

export async function replyWithAIAction(
  title: string,
  sender: string,
  content: string,
  aiPrompt: string,
): Promise<ReplyWithAIResponse> {
  try {
    const aiResponse = await replyWithAI(title, sender, content, aiPrompt);

    if (aiResponse?.reply) {
      return { success: true, reply: aiResponse.reply };
    } else {
      console.error(
        "AI response does not contain a 'reply' field:",
        aiResponse,
      );
      return {
        success: false,
        error: "AI reply generation failed.",
      };
    }
  } catch (error) {
    console.error("Error generating AI reply:", error);
    return {
      success: false,
      error: "Failed to generate reply",
    };
  }
}
