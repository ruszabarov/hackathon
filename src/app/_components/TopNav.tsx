"use client";

import { MailCheck, Sun, Moon, Laptop } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";

const TopNav = () => {
  const { setTheme } = useTheme();

  return (
    <nav className="flex w-full items-center justify-between border-b border-zinc-700 p-4 text-xl font-semibold">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center justify-center">
          <span className="ml-2 text-xl font-bold leading-none">
            Monday
          </span>
        </Link>
        <div className="flex items-center justify-center gap-4">
          <Link href="/email" className="flex items-center">
            <span className="text-sm font-normal leading-none text-zinc-600 dark:text-zinc-400">
              Emails
            </span>
          </Link>
          <Link href="/schedule" className="flex items-center">
            <span className="text-sm font-normal leading-none text-zinc-600 dark:text-zinc-400">
              Schedule
            </span>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
};

export default TopNav;
