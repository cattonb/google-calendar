import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId != null) {
    redirect("/events");
  }

  return (
    <div className="text-center container py-4 mx-auto max-w-sm">
      <h1 className="3xl mb-4">Welcome! Please choose an option:</h1>
      <div className="flex flex-col justify-center items-center gap-3">
        <Button className="w-full" asChild>
          <SignInButton />
        </Button>
        <Button className="w-full" asChild>
          <SignUpButton />
        </Button>
      </div>
    </div>
  );
}
