"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { ScheduleEventForm } from "./ScheduleEventForm";
import { fetchEvents } from "~/server/googleCalendar";
import { fetchTimeFromTask } from "~/server/chat";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

const handleScheduleSubmit = async () => {
  // TODO: Implement event scheduling logic
  console.log("Scheduling event:");
};

type FormData = z.infer<typeof formSchema>;

export default function ChatBox() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: { message: string }) => {
    try {
      const busyEvents = await fetchEvents()
      const event = await fetchTimeFromTask(data.message, busyEvents)
      console.log("Submitted Data:", event);
      form.reset();
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  return (
    <Dialog>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="type to schedule an event..."
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogTrigger asChild>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </DialogTrigger>
        </form>
      </Form>
      <DialogContent>
        <DialogTitle>Schedule Event</DialogTitle>
        <ScheduleEventForm onSubmit={handleScheduleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
