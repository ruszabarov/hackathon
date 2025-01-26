import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface CalendarEventCardProps {
  title: string;
  start: Date;
  end: Date;
}

export default function CalendarEventCard({
  title,
  start,
  end,
}: CalendarEventCardProps) {
  return (
    <Card className="group relative cursor-pointer">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {/* <CardDescription>{description}</CardDescription> */}
      </CardHeader>
      <CardContent>
        <p>
          from {start.toLocaleTimeString()} to {end.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
