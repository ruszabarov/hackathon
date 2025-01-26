"use client";

import { RefreshCw, Archive } from "lucide-react";
import { Button } from "@components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";

interface ArchiveButtonProps {
    onArchive: () => void;
    isArchiving: boolean;
  }

  
export default function ArchiveButton({ onArchive, isArchiving }: ArchiveButtonProps) {

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        onArchive();
      };

    return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleClick}
                variant="outline"
                size="icon"
                className="absolute bottom-2 right-2 p-1 h-6 w-6"
                aria-label="Archive"
                disabled={isArchiving} // Disable the button while archiving
              >
                <Archive className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive Email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
}
