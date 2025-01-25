"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";

export default function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Refresh the current route
    router.refresh();
    // Add a small delay before enabling the button again
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="sr-only">Refresh emails</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh emails</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
