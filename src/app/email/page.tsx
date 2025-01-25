import { fetchEmails } from "../../server/queries";
import { EmailSummaryCard } from "../_components/EmailSummaryCard";
import RefreshButton from "../_components/RefreshButton";

export default async function Emails() {
  const emails = await fetchEmails();
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-start">
        <RefreshButton />
        <h2 className="text-l ml-4 font-semibold">
          Here are your latest emails, summarized and organized by priority
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {emails.map((email) => (
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
    </div>
  );
}
