import Link from "next/link";
import { Zap } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";

export function SiteHeader() {
  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md"
      >
        Skip to main content
      </a>
      <header className="border-b" role="banner">
        <nav
          className="container mx-auto px-4 py-4 flex justify-between items-center"
          aria-label="Main navigation"
        >
          <h1 className="text-2xl font-bold">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              aria-label="WireWise - Go to homepage"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20"
                aria-hidden="true"
              >
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">
                WireWise
              </span>
            </Link>
          </h1>
          <div className="flex items-center gap-6">
            <Link
              href="/diagram"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Diagram Editor
            </Link>
          </div>
          <div className="flex items-center gap-4" role="group" aria-label="User actions">
            <UserProfile />
            <ModeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}
