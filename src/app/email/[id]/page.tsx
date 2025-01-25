"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../../components/ui/card";
import { Priority } from "../../components/EmailSummaryCard";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

// Using the same mock data from the home page
const mockEmails = [
  {
    id: "1",
    subject: "Q4 Financial Report Review",
    content:
      "Please review the attached Q4 financial reports before tomorrow's meeting. Key metrics show positive growth.",
    priority: Priority.High,
    from: "finance@example.com",
  },
  {
    id: "2",
    subject: "Team Building Event",
    content:
      "Join us for the annual team building event next Friday. Activities and lunch will be provided.",
    priority: Priority.Low,
    from: "hr@example.com",
  },
  {
    id: "3",
    subject: "New Project Kickoff",
    content:
      "Exciting new project starting next week. Please prepare your schedules for the kickoff meeting.",
    priority: Priority.Medium,
    from: "project@example.com",
  },
  {
    id: "4",
    subject: "System Maintenance Notice",
    content:
      "Scheduled maintenance will occur this weekend. Please save all work and log off by Friday 6 PM.",
    priority: Priority.High,
    from: "admin@example.com",
  },
  {
    id: "5",
    subject: "Office Supply Request",
    content:
      "Monthly office supply order is due. Submit your requests by Wednesday.",
    priority: Priority.None,
    from: "admin@example.com",
  },
  {
    id: "6",
    subject: "Client Presentation Feedback",
    content:
      "Great work on yesterday's client presentation. Some follow-up items attached for review.",
    priority: Priority.Medium,
    from: "sales@example.com",
  },
];

const priorityColorMap = {
  [Priority.None]: "bg-secondary",
  [Priority.Low]: "bg-blue-500",
  [Priority.Medium]: "bg-yellow-500",
  [Priority.High]: "bg-red-600",
};

export default function EmailPage() {
  const params = useParams();
  const router = useRouter();
  const email = mockEmails.find((email) => email.id === params.id);

  if (!email) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Email not found</h1>
      </div>
    );
  }

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
            priorityColorMap[email.priority],
          )}
        />
        <CardHeader>
          <CardTitle>{email.subject}</CardTitle>
          <CardDescription>{email.from}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{email.content}</p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="inline-flex w-full rounded-md border">
            <Button
              variant="ghost"
              className="w-full rounded-none rounded-l-md border-r"
            >
              Reply with AI
            </Button>
            <Button variant="ghost" className="w-full rounded-none border-r">
              Schedule with AI
            </Button>
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
