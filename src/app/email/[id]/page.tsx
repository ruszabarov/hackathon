import { fetchEmail } from "../../../server/queries";
import { EmailSummary } from "../../_components/EmailSummary";

export default async function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const email = await fetchEmail(parseInt(id));

  if (!email) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Email not found</h1>
      </div>
    );
  }

  return (
    <EmailSummary
      id={email.emailId.toString()}
      subject={email.title ?? ""}
      content={email.summary ?? ""}
      priority={email.priority ?? 0}
      from={email.sender ?? ""}
      originalEmail={email.originalContent ?? ""}
      replied={email.replied ?? "No"}
    />
  );
}
