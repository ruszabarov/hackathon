import CalendarEventCard from "../_components/CalendarEventCard";
import ChatBox from "../_components/ChatBox";
import { fetchEvents } from "../../server/googleCalendar";

export default async function Schedule() {
  const events = await fetchEvents();

  return (
    <div className="container mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h2 className="text-xl font-semibold">
        Here is your schedule for today:
      </h2>
      <ChatBox />
      {events.map((event) => (
        <CalendarEventCard
          key={event.summary}
          title={event.summary}
          start={event.start}
          end={event.end}
        />
      ))}
    </div>
  );
}
