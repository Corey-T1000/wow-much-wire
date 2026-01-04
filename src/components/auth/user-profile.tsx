"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";
import { SignInButton } from "./sign-in-button";

export function UserProfile() {
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Prevent hydration mismatch by waiting until mounted
  // This is a standard pattern for client-only components - the setState triggers
  // a single re-render after hydration which is intentional for this use case
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || isPending) {
    return <div className="h-8 w-8" />; // Placeholder with same dimensions as avatar
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <SignInButton />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage
            src={session.user?.image || ""}
            alt={session.user?.name || "User"}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback>
            {(
              session.user?.name?.[0] ||
              session.user?.email?.[0] ||
              "U"
            ).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Your Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
