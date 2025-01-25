"use client";

import { EmailSummaryCard, Priority } from "./components/EmailSummaryCard";

const mockEmails = [
  {
    id: "1",
    subject: "Q4 Financial Report Review",
    content: "Please review the attached Q4 financial reports before tomorrow's meeting. Key metrics show positive growth.",
    priority: Priority.High,
    from: "finance@example.com",
  },
  {
    id: "2",
    subject: "Team Building Event",
    content: "Join us for the annual team building event next Friday. Activities and lunch will be provided.",
    priority: Priority.Low,
    from: "hr@example.com",
  },
  {
    id: "3",
    subject: "New Project Kickoff",
    content: "Exciting new project starting next week. Please prepare your schedules for the kickoff meeting.",
    priority: Priority.Medium,
    from: "project@example.com",
  },
  {
    id: "4",
    subject: "System Maintenance Notice",
    content: "Scheduled maintenance will occur this weekend. Please save all work and log off by Friday 6 PM.",
    priority: Priority.High,
    from: "admin@example.com",
  },
  {
    id: "5",
    subject: "Office Supply Request",
    content: "Monthly office supply order is due. Submit your requests by Wednesday.",
    priority: Priority.None,
    from: "admin@example.com",
  },
  {
    id: "6",
    subject: "Client Presentation Feedback",
    content: "Great work on yesterday's client presentation. Some follow-up items attached for review.",
    priority: Priority.Medium,
    from: "sales@example.com",
  },
];

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEmails.map((email) => (
          <EmailSummaryCard
            key={email.id}
            id={email.id}
            subject={email.subject}
            content={email.content}
            priority={email.priority}
            from={email.from}
          />
        ))}
      </div>
    </div>
  );
}
