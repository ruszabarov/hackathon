"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { ScheduleEventForm } from "./ScheduleEventForm";
import { useState } from "react";

interface CalendarEventCardProps {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export default function CalendarEventCard({
  title,
  description,
  startTime,
  endTime,
}: CalendarEventCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group relative cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg">
          <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
            <Edit className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              from {startTime.toLocaleTimeString()} to{" "}
              {endTime.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <ScheduleEventForm
          onSubmit={(values) => {
            console.log(values);
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
