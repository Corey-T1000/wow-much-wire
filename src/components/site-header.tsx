import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link
            href="/"
            className="bg-clip-text text-transparent [background-image:linear-gradient(90deg,color-mix(in_oklab,var(--primary)_85%,white_0%),color-mix(in_oklab,var(--primary)_50%,white_0%))] hover:opacity-90"
          >
            Next.js Boilerplate
          </Link>
        </h1>
        <div className="flex items-center gap-4">
          <UserProfile />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
