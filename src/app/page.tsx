import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import { BookmarkIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#cad3ff] min-h-screen h-full">
      <Button>
        <BookmarkIcon /> Bookmark
      </Button>
    </div>
  );
}
