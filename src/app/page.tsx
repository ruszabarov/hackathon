"use client";

import { EmailSummaryCard, Priority } from "./components/EmailSummaryCard";
import { useEffect, useState } from "react";

interface Email {
  emailId: number;
  sender: string;
  summary: string;
  priority: string;
  title: string;
  time: string;
  originalContent: string;
}

export default function HomePage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch("/api/emails");
        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }
        const data = (await response.json()) as Email[];
        setEmails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch emails");
      } finally {
        setLoading(false);
      }
    };

    void fetchEmails();
  }, []);

  if (loading) {
    return <div className="p-4">Loading emails...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {emails.map((email) => (
          <EmailSummaryCard
            key={email.emailId}
            id={email.emailId.toString()}
            subject={email.title}
            content={email.summary}
            priority={email.priority as Priority}
            from={email.sender}
          />
        ))}
      </div>
    </div>
  );
}
