"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Calendar } from "@components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@lib/utils";
import { format } from "date-fns";
import { useState, useEffect } from "react";

const formSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    startDate: z.date(),
    startHour: z
      .number()
      .min(1, { message: "Hour must be between 1-12" })
      .max(12, { message: "Hour must be between 1-12" }),
    startMinute: z
      .number()
      .min(0, { message: "Minute must be between 0-59" })
      .max(59, { message: "Minute must be between 0-59" }),
    startPeriod: z.enum(["AM", "PM"]),
    endDate: z.date(),
    endHour: z
      .number()
      .min(1, { message: "Hour must be between 1-12" })
      .max(12, { message: "Hour must be between 1-12" }),
    endMinute: z
      .number()
      .min(0, { message: "Minute must be between 0-59" })
      .max(59, { message: "Minute must be between 0-59" }),
    endPeriod: z.enum(["AM", "PM"]),
    location: z.string(),
    attendees: z.array(
      z.string().email({ message: "Please enter a valid email address" }),
    ),
  })
  .refine(
    (data) => {
      const now = new Date();
      const startDateTime = new Date(data.startDate);
      startDateTime.setHours(
        data.startPeriod === "PM" && data.startHour !== 12
          ? data.startHour + 12
          : data.startPeriod === "AM" && data.startHour === 12
            ? 0
            : data.startHour,
        data.startMinute,
      );

      return startDateTime > now;
    },
    {
      message: "Start date and time must be in the future",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      const startDateTime = new Date(data.startDate);
      const endDateTime = new Date(data.endDate);

      startDateTime.setHours(
        data.startPeriod === "PM" && data.startHour !== 12
          ? data.startHour + 12
          : data.startPeriod === "AM" && data.startHour === 12
            ? 0
            : data.startHour,
        data.startMinute,
      );

      endDateTime.setHours(
        data.endPeriod === "PM" && data.endHour !== 12
          ? data.endHour + 12
          : data.endPeriod === "AM" && data.endHour === 12
            ? 0
            : data.endHour,
        data.endMinute,
      );

      return endDateTime > startDateTime;
    },
    {
      message: "End date and time must be after start date and time",
      path: ["endDate"],
    },
  );

interface ScheduleEventFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
  email?: {
    id: string;
    subject: string;
    content: string;
    from: string;
    originalEmail: string;
    email_time: Date;
  };
  suggestedEvent?: {
    summary: string;
    description: string;
    start: {
      dateTime: string;
      timeZone: string;
    };
    end: {
      dateTime: string;
      timeZone: string;
    };
    attendees?: Array<{ email: string }>;
  };
}

export function ScheduleEventForm({
  onSubmit,
  email,
  suggestedEvent,
}: ScheduleEventFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: suggestedEvent?.summary ?? "",
      description: suggestedEvent?.description ?? "",
      startDate: suggestedEvent?.start
        ? new Date(suggestedEvent.start.dateTime)
        : new Date(),
      startHour: suggestedEvent?.start
        ? new Date(suggestedEvent.start.dateTime).getHours() % 12 || 12
        : 12,
      startMinute: suggestedEvent?.start
        ? new Date(suggestedEvent.start.dateTime).getMinutes()
        : 0,
      startPeriod: suggestedEvent?.start
        ? new Date(suggestedEvent.start.dateTime).getHours() >= 12
          ? "PM"
          : "AM"
        : "PM",
      endDate: suggestedEvent?.end
        ? new Date(suggestedEvent.end.dateTime)
        : new Date(),
      endHour: suggestedEvent?.end
        ? new Date(suggestedEvent.end.dateTime).getHours() % 12 || 12
        : 1,
      endMinute: suggestedEvent?.end
        ? new Date(suggestedEvent.end.dateTime).getMinutes()
        : 0,
      endPeriod: suggestedEvent?.end
        ? new Date(suggestedEvent.end.dateTime).getHours() >= 12
          ? "PM"
          : "AM"
        : "PM",
      location: "",
      attendees: suggestedEvent?.attendees?.map((a) => a.email) ?? [],
    },
  });

  useEffect(() => {
    if (suggestedEvent) {
      form.reset({
        title: suggestedEvent.summary,
        description: suggestedEvent.description,
        startDate: new Date(suggestedEvent.start.dateTime),
        startHour:
          new Date(suggestedEvent.start.dateTime).getHours() % 12 || 12,
        startMinute: new Date(suggestedEvent.start.dateTime).getMinutes(),
        startPeriod:
          new Date(suggestedEvent.start.dateTime).getHours() >= 12
            ? "PM"
            : "AM",
        endDate: new Date(suggestedEvent.end.dateTime),
        endHour: new Date(suggestedEvent.end.dateTime).getHours() % 12 || 12,
        endMinute: new Date(suggestedEvent.end.dateTime).getMinutes(),
        endPeriod:
          new Date(suggestedEvent.end.dateTime).getHours() >= 12 ? "PM" : "AM",
        location: "",
        attendees: suggestedEvent.attendees?.map((a) => a.email) ?? [],
      });
    }
  }, [suggestedEvent, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mb-4 flex gap-8">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        fromDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        fromDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="mb-4 flex gap-8">
          <div className="flex-1">
            <FormLabel>Start Time</FormLabel>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="startHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          placeholder="HH"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <span>:</span>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="startMinute"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="MM"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="startPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <FormLabel>End Time</FormLabel>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="endHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          placeholder="HH"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <span>:</span>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="endMinute"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="MM"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="endPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6 flex justify-end space-x-2">
          <Button type="submit">Schedule Event</Button>
        </div>
      </form>
    </Form>
  );
}
