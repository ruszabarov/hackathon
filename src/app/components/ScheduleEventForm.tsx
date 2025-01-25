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

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  startDate: z.date(),
  startHour: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, { message: "Hour must be between 1-12" }),
  startMinute: z
    .string()
    .regex(/^([0-5]?[0-9])$/, { message: "Minute must be between 0-59" }),
  startPeriod: z.enum(["AM", "PM"]),
  endDate: z.date(),
  endHour: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, { message: "Hour must be between 1-12" }),
  endMinute: z
    .string()
    .regex(/^([0-5]?[0-9])$/, { message: "Minute must be between 0-59" }),
  endPeriod: z.enum(["AM", "PM"]),
  location: z.string(),
  attendees: z.array(
    z.string().email({ message: "Please enter a valid email address" }),
  ),
});

interface ScheduleEventFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export function ScheduleEventForm({ onSubmit }: ScheduleEventFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      startHour: "12",
      startMinute: "00",
      startPeriod: "PM",
      endDate: new Date(),
      endHour: "1",
      endMinute: "00",
      endPeriod: "PM",
      location: "",
      attendees: [],
    },
  });

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
            <FormLabel>Start Time</FormLabel>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="startHour"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
              <span>:</span>
              <FormField
                control={form.control}
                name="startMinute"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
              <FormField
                control={form.control}
                name="startPeriod"
                render={({ field }) => (
                  <FormItem className="flex-1">
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

          <div className="flex-1">
            <FormLabel>End Time</FormLabel>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="endHour"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
              <span>:</span>
              <FormField
                control={form.control}
                name="endMinute"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
              <FormField
                control={form.control}
                name="endPeriod"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
