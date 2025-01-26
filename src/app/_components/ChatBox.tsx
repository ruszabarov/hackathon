"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
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
import {
  ScheduleEventForm,
  type formSchema as scheduleEventFormSchema,
} from "./ScheduleEventForm";
import type { CalendarEventPayload } from "../../server/chat";
import { scheduleEventAction, scheduleWithChatAction } from "~/server/actions";
import { useState } from "react";



const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});


type FormData = z.infer<typeof formSchema>;

export default function ChatBox() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestedEvent, setSuggestedEvent] = useState<
    CalendarEventPayload | undefined
  >(undefined);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: { message: string }) => {
    setIsScheduling(true);
    try {
      const event = await scheduleWithChatAction(data.message)
      setSuggestedEvent(event);
      console.log("Submitted Data:", suggestedEvent);
      form.reset();
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleScheduleSubmit = async (
    values: z.infer<typeof scheduleEventFormSchema>,
  ) => {
    const startDateTime = new Date(values.startDate);
    startDateTime.setHours(
      values.startPeriod === "PM" && values.startHour !== 12
        ? values.startHour + 12
        : values.startPeriod === "AM" && values.startHour === 12
          ? 0
          : values.startHour,
      values.startMinute,
    );

    const endDateTime = new Date(values.endDate);
    endDateTime.setHours(
      values.endPeriod === "PM" && values.endHour !== 12
        ? values.endHour + 12
        : values.endPeriod === "AM" && values.endHour === 12
          ? 0
          : values.endHour,
      values.endMinute,
    );

    const calendarEvent = {
      summary: values.title,
      description: values.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: values.location,
      attendees: values.attendees.map((email) => ({ email })),
    };

    try {
      const result = await scheduleEventAction(calendarEvent);
      if (result.success) {
        setDialogOpen(false);
      } else {
        console.error("Failed to schedule event:", result.error);
      }
    } catch (error) {
      console.error("Error scheduling event:", error);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <Button type="submit" disabled={isScheduling}>
              {isScheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding time...
                </>
              ) : !suggestedEvent ? (
                "Schedule with AI"
              ) : (
                "View Schedule"
              )}
            </Button>
          </DialogTrigger>
        </form>
      </Form>
      <DialogContent>
        <DialogTitle>Schedule Event</DialogTitle>
        <ScheduleEventForm onSubmit={handleScheduleSubmit} suggestedEvent={suggestedEvent} />
      </DialogContent>
    </Dialog>
  );
}
