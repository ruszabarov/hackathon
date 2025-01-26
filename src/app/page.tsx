import { SignedOut, SignedIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function HomePage() {
  return (
    <main>
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please sign in above
        </div>
      </SignedOut>
      <SignedIn>{redirect("/email")}</SignedIn>
    </main>
  );
}
