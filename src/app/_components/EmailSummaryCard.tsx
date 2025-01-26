"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@components/ui/card";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { useRouter } from "next/navigation";
import { Check, Archive } from "lucide-react";
import ArchiveButton from "./ArchiveButton";
import { archiveEmail} from "../../server/queries"

interface EmailSummaryProps {
  subject: string;
  content: string;
  priority: number;
  from: string;
  id: string;
  replied: string; 
}

const priorityColorMap = {
  [3]: "bg-secondary",
  [2]: "bg-blue-500",
  [1]: "bg-yellow-500",
  [0]: "bg-red-600",
};

export function EmailSummaryCard({
  subject,
  content,
  priority,
  from,
  id,
  replied,
}: EmailSummaryProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);

  const handleClick = () => {
    router.push(`/email/${id}`);
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await archiveEmail(Number(id));
      router.refresh()
    } catch (err: any) {
      console.error("Failed to archive email:", err);
    } finally {
      setIsArchiving(false);
    }
  };


  return (
    <Card
      onClick={handleClick}
      className="group relative transform cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="absolute top-3 right-3 flex items-center space-x-1">
        {replied === "Yes" && (
          <Check strokeWidth={3} className="h-4 w-4 text-green-500" aria-hidden="true" />
        )}
        <div
          className={cn(
            "h-4 w-4 rounded-full",
            priorityColorMap[priority as keyof typeof priorityColorMap]
          )}
        />
      </div>
      <CardHeader>
        <CardTitle>{subject}</CardTitle>
        <CardDescription>{from}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{content}</p>
      </CardContent>
      <ArchiveButton onArchive={handleArchive} isArchiving={isArchiving} />
    </Card>
  );
}
