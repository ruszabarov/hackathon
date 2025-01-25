import CalendarEventCard from "../_components/CalendarEventCard";
import ChatBox from "../_components/ChatBox";
import { getCalendarEventTimes } from "../../server/googleCalendar";
import { addDays } from "date-fns";

export default async function Schedule() {
  const events = await getCalendarEventTimes({
    start: new Date(),
    end: addDays(new Date(), 7),
  });

  return (
    <div className="container mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <ChatBox />
      {events.length}
      {/* {events.map((event) => (
        <CalendarEventCard
          key={event.start.toISOString()}
          title={event.title}
          description={event.description}
          startTime={event.startTime}
          endTime={event.endTime}
        />
      ))} */}
    </div>
  );
}
