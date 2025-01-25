import { fetchEvents, scheduleEvent } from "../../../server/GCal/GCal";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const events = await fetchEvents();
    console.log(events);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
    try {
      const eventData = await request.json(); 
      console.log(eventData); 
  
      await scheduleEvent(eventData);
  
      return NextResponse.json({ success: true, event: eventData }, { status: 201 });
    } catch (error) {
      console.error("Failed to schedule event:", error);
      return NextResponse.json(
        { error: "Failed to schedule event" },
        { status: 500 }
      );
    }
  }
