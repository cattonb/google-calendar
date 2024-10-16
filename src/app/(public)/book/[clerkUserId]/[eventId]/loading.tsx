import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex gap-4 justify-center items-center mx-auto mt-8">
      <div className="text-muted-foreground text-xl font-bold text-center">Loading...</div>
      <LoaderCircle className="text-muted-foreground size-10 animate-spin" />
    </div>
  );
}
