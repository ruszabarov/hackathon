import { fetchEmails } from "../server/queries";
import { EmailSummaryCard } from "./components/EmailSummaryCard";

async function Emails() {
  const emails = await fetchEmails();
  return (
    <div className="container mx-auto p-4">
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

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <Emails />
    </div>
  );
}
