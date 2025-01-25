"use client";

import { ArrowLeft } from "lucide-react";
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
} from "../../components/ui/dialog";
import { ReplyEmailForm } from "./ReplyEmailForm";
import { ScheduleEventForm } from "./ScheduleEventForm";

interface EmailSummaryProps {
  subject: string;
  content: string;
  priority: number;
  from: string;
  id: string;
}

const priorityColorMap = {
  [3]: "bg-secondary",
  [2]: "bg-blue-500",
  [1]: "bg-yellow-500",
  [0]: "bg-red-600",
};

export function EmailSummary({
  subject,
  content,
  priority,
  from,
  id,
}: EmailSummaryProps) {
  const router = useRouter();

  const handleReplySubmit = async () => {
    // TODO: Implement email sending logic
    console.log("Sending email:");
  };

  const handleScheduleSubmit = async () => {
    // TODO: Implement event scheduling logic
    console.log("Scheduling event:");
  };

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-muted-foreground transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Inbox
      </button>
      <Card className="relative">
        <div
          className={cn(
            "absolute right-3 top-3 h-6 w-6 rounded-full p-4",
            priorityColorMap[priority as keyof typeof priorityColorMap] ??
              "bg-red-600",
          )}
        />
        <CardHeader>
          <CardTitle>{subject ?? ""}</CardTitle>
          <CardDescription>{from ?? ""}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{content}</p>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full rounded-none border-r"
                >
                  Schedule with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Schedule Event</DialogTitle>
                </DialogHeader>
                <ScheduleEventForm onSubmit={handleScheduleSubmit} />
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              className="w-full rounded-none rounded-r-md border-l"
            >
              View Original
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
