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
import { fetchProcessAndStoreEmails } from "../../server/queries";

export default function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchProcessAndStoreEmails();
      router.refresh();
    } catch (err) {
      console.error("Failed to refresh:", err);
    } finally {
      setIsRefreshing(false);
    }
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
