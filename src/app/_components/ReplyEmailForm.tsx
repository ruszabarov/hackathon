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

const formSchema = z.object({
  to: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  originalContent: z.string().min(1, { message: "Message content is required" }),
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: defaultTo || "",
      subject: defaultSubject.startsWith("Re:")
        ? defaultSubject
        : `Re: ${defaultSubject}`,
      originalContent: "", 
      aiPrompt: "", 
    },
  });


  const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const { to, subject, originalContent, aiPrompt } = form.getValues();

      if (!aiPrompt) { return; }

      try {
        const response = await fetch("/api/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "replyWithAI",
            title: subject,
            sender: to,
            content: originalContent,
            aiPrompt: aiPrompt,
          }),
        });

        const result = await response.json();
        console.log(result)
        if (result.success && result.reply) {
          form.setValue("originalContent", result.reply);
        } else {
          console.error("Failed to generate AI reply:", result.error);
        }
      } catch (error) {
        console.error("Error generating AI reply:", error);
      } finally {
      }
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
              <FormControl>
                <Input
                  placeholder="Generate with AI"
                  className="w-full"
                  {...field}
                  onKeyDown={handleKeyPress}
                />
              </FormControl>
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
