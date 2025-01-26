"use client";

import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@components/ui/card";
import { cn } from "../../lib/utils";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import {
  ReplyEmailForm,
  type formSchema as replyEmailFormSchema,
} from "./ReplyEmailForm";
import {
  ScheduleEventForm,
  type formSchema as scheduleEventFormSchema,
} from "./ScheduleEventForm";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import type { z } from "zod";
import { sendEmail } from "../../server/gmail";
import { updateEmailStatus } from "~/server/queries";
import {
  scheduleWithAIAction,
  scheduleEventAction,
} from "../../server/actions";
import type { CalendarEventPayload } from "../../server/chat";
import { useToast } from "../../hooks/use-toast";
interface EmailSummaryProps {
  subject: string;
  content: string;
  priority: number;
  from: string;
  id: string;
  originalEmail: string;
  replied: string;
  email_time: Date;
}

const priorityColorMap = {
  [3]: "bg-secondary",
  [2]: "bg-blue-500",
  [1]: "bg-yellow-500",
  [0]: "bg-red-600",
};

const priorityLabels = {
  [3]: "Low Priority",
  [2]: "Medium Priority",
  [1]: "High Priority",
  [0]: "Urgent",
};

export function EmailSummary({
  subject,
  content,
  priority,
  from,
  id,
  originalEmail,
  email_time,
  replied,
}: EmailSummaryProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showOriginal, setShowOriginal] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [suggestedEvent, setSuggestedEvent] = useState<
    CalendarEventPayload | undefined
  >(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleReplySubmit = async (
    values: z.infer<typeof replyEmailFormSchema>,
  ) => {
    const { to, subject, originalContent } = values;

    try {
      const response = await sendEmail(to, subject, originalContent);

      if (response) {
        toast({
          title: "Success",
          description: "Email sent successfully!",
        });
        await updateEmailStatus(Number(id), "Yes");
        router.back();
      } else {
        toast({
          title: "Error",
          description: "Failed to send email",
          variant: "destructive",
        });
        console.error("Failed to send email");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
      console.error("Error in handleReplySubmit:", error);
    }
  };

  const handleScheduleClick = async () => {
    if (suggestedEvent) {
      setDialogOpen(true);
      return;
    }

    setIsScheduling(true);
    try {
      const event = await scheduleWithAIAction(
        id,
        subject,
        from,
        originalEmail,
        email_time.toISOString(),
      );
      setSuggestedEvent(event);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error scheduling event:", error);
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
        toast({
          title: "Success",
          description: "Event scheduled successfully!",
        });
        setDialogOpen(false);
        router.refresh();
      } else {
        console.error("Failed to schedule event:", result.error);
      }
    } catch (error) {
      console.error("Error scheduling event:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inbox
      </button>
      <Card className="relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-3 top-3 flex items-center space-x-1">
                {replied === "Yes" && (
                  <Check
                    className="h-4 w-4 text-green-500"
                    aria-hidden="true"
                  />
                )}
                <div
                  className={cn(
                    "h-4 w-4 rounded-full",
                    priorityColorMap[priority as keyof typeof priorityColorMap],
                  )}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {priorityLabels[priority as keyof typeof priorityLabels] ??
                  "Unknown Priority"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <CardHeader>
          <CardTitle>{subject ?? ""}</CardTitle>
          <CardDescription>{from ?? ""}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={showOriginal ? "original" : "summary"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p>{showOriginal ? originalEmail : content}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="inline-flex w-full rounded-md border">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full rounded-none rounded-l-md border-r"
                >
                  Reply with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Reply to Email</DialogTitle>
                </DialogHeader>
                <ReplyEmailForm
                  defaultTo={from}
                  defaultSubject={subject}
                  onSubmit={handleReplySubmit}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button
                variant="ghost"
                className="w-full rounded-none border-r"
                onClick={handleScheduleClick}
                disabled={isScheduling}
              >
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
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Schedule Event</DialogTitle>
                </DialogHeader>
                <ScheduleEventForm
                  onSubmit={handleScheduleSubmit}
                  email={{
                    id,
                    subject,
                    content,
                    from,
                    originalEmail,
                    email_time,
                  }}
                  suggestedEvent={suggestedEvent}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              className="w-full rounded-none rounded-r-md border-l"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              {showOriginal ? "View summary" : "View original"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
