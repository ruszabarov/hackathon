import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { replyWithAIAction } from "~/server/actions";

export const formSchema = z.object({
  to: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  originalContent: z
    .string()
    .min(1, { message: "Message content is required" }),
  aiPrompt: z.string().optional(),
});

interface ReplyEmailFormProps {
  defaultTo?: string;
  defaultSubject?: string;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export function ReplyEmailForm({
  defaultTo = "",
  defaultSubject = "",
  onSubmit,
}: ReplyEmailFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const emailOnly = defaultTo.match(/<(.*)>/)?.[1] || defaultTo;
  const nameOnly = defaultTo.match(/^(.*)</)?.[1]?.trim() || "";
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: emailOnly || "",
      subject: defaultSubject.startsWith("Re:")
        ? defaultSubject
        : `Re: ${defaultSubject}`,
      originalContent: "",
      aiPrompt: "",
    },
  });

  const handlePromptSubmit = async () => {
    const { to, subject, originalContent, aiPrompt } = form.getValues();

    if (!aiPrompt) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await replyWithAIAction(
        subject,
        nameOnly,
        originalContent,
        aiPrompt,
      );

      if (result.success && result.reply) {
        form.setValue("originalContent", result.reply);
      } else {
        console.error("Failed to generate AI reply:", result.error);
      }
    } catch (error) {
      console.error("Error generating AI reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>To</FormLabel>
              <FormControl>
                <Input placeholder="recipient@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aiPrompt"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>AI Prompt</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Generate with AI"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        onClick={handlePromptSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send prompt</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="originalContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type your reply here..."
                  className="h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6 flex justify-end space-x-2">
          <Button type="submit">Send Reply</Button>
        </div>
      </form>
    </Form>
  );
}
