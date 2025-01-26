"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { EmailSummaryCard } from "./EmailSummaryCard";
import { useEffect, useState } from "react";
import { fetchArchivedEmails } from "../../server/queries";
import { Button } from "@components/ui/button";

export function ArchivedEmailsModal() {
  const [archivedEmails, setArchivedEmails] = useState<ArchivedEmail[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  type ArchivedEmail = {
    title: string | null;
    summary: string | null;
    priority: number | null;
    emailId: number;
    sender: string | null;
    email_time: Date | null;
    originalContent: string | null;
    replied: string | null;
    is_archived: boolean | null;
  };

  useEffect(() => {
    if (isOpen) {
      fetchArchivedEmails().then((emails) => {
        setArchivedEmails(emails);
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Archived Emails</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Archived Emails</DialogTitle>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto space-y-4">
          {archivedEmails.map((email) => (
            <EmailSummaryCard
              key={email.emailId}
              subject={email.title || ""}
              content={email.summary || ""}
              priority={email.priority || 3}
              from={email.sender || ""}
              id={email.emailId.toString()}
              replied={email.replied || "No"}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}