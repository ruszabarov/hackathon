import CalendarEventCard from "../_components/CalendarEventCard";
import ChatBox from "../_components/ChatBox";

export default function Schedule() {
  const mockEvents = [
    {
      id: 1,
      title: "Event 1",
      description: "Description 1",
      startTime: new Date(),
      endTime: new Date(),
    },
    {
      id: 2,
      title: "Event 2",
      description: "Description 2",
      startTime: new Date(),
      endTime: new Date(),
    },
  ];

  return (
    <div className="container mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <ChatBox />
      {mockEvents.map((event) => (
        <CalendarEventCard
          key={event.id}
          title={event.title}
          description={event.description}
          startTime={event.startTime}
          endTime={event.endTime}
        />
      ))}
    </div>
  );
}
