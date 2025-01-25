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
  content: z.string().min(1, { message: "Message content is required" }),
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
      to: defaultTo,
      subject: defaultSubject.startsWith("Re:")
        ? defaultSubject
        : `Re: ${defaultSubject}`,
      content: "",
    },
  });

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
          name="content"
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
