import { fetchEmails } from "../../server/queries";
import { EmailSummaryCard } from "../_components/EmailSummaryCard";
import RefreshButton from "../_components/RefreshButton";
import { Separator } from "@components/ui/separator";

export default async function Emails() {
  const emails = await fetchEmails();

  // Sort emails by priority (lower number = higher priority)
  const sortedEmails = [...emails].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
  );
  const regularEmails = sortedEmails.filter(
    (email) => (email.priority ?? 0) < 3,
  );
  const lowPriorityEmails = sortedEmails.filter(
    (email) => (email.priority ?? 0) === 3,
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-start">
        <RefreshButton />
        <h2 className="text-l ml-4 font-semibold">
          Here are your latest emails, summarized and organized by priority
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {regularEmails.map((email) => (
          <EmailSummaryCard
            key={email.emailId}
            id={email.emailId.toString()}
            subject={email.title ?? ""}
            content={email.summary ?? ""}
            priority={email.priority ?? 0}
            from={email.sender ?? ""}
          />
        ))}
      </div>

      {lowPriorityEmails.length > 0 && (
        <>
          <Separator className="my-8" />
          <h3 className="mb-4 text-lg font-medium text-muted-foreground">
            Low Priority
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lowPriorityEmails.map((email) => (
              <EmailSummaryCard
                key={email.emailId}
                id={email.emailId.toString()}
                subject={email.title ?? ""}
                content={email.summary ?? ""}
                priority={email.priority ?? 0}
                from={email.sender ?? ""}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
