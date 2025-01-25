import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { useRouter } from "next/navigation";

export enum Priority {
  None = "None",
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

interface EmailSummaryProps {
  subject: string;
  content: string;
  priority: Priority;
  from: string;
  id: string;
}

const priorityColorMap = {
  [Priority.None]: "bg-secondary",
  [Priority.Low]: "bg-blue-500",
  [Priority.Medium]: "bg-yellow-500",
  [Priority.High]: "bg-red-600",
};

export function EmailSummaryCard({
  subject,
  content,
  priority,
  from,
  id,
}: EmailSummaryProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/email/${id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className="group relative transform cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    >
      <div
        className={cn(
          "absolute right-3 top-3 h-4 w-4 rounded-full",
          priorityColorMap[priority],
        )}
      />
      <CardHeader>
        <CardTitle>{subject}</CardTitle>
        <CardDescription>{from}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}
