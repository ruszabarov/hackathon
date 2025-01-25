/* eslint-disable @typescript-eslint/await-thenable */
import { fetchEmail } from "../../../server/queries";
import { EmailSummary } from "../../components/EmailSummary";

export default async function EmailPage({
  params,
}: {
  params: { id: string };
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
    />
  );
}
