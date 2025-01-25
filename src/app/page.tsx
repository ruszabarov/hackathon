import { SignedOut, SignedIn } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main>
      <SignedOut>
        <div className="h-full w-full text-center text-2xl">
          Please sign in above
        </div>
      </SignedOut>
      <SignedIn>
        <div className="container mx-auto p-4">home</div>;
      </SignedIn>
    </main>
  );
}
