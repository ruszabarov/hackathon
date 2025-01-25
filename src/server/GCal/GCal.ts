import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

interface BusyEvent {
  start: string;  // Object with dateTime and timeZone
  end: string;    // Object with dateTime and timeZone
  summary: string;

}

interface Event {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: { email: string }[];
}


// Load Google OAuth2 client
function loadOAuth2Client(): any {
  const TOKEN_PATH = path.join(process.cwd(), 'GCal_token.json');
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('GCal_token.json not found on server.');
  }

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// Fetch events from Google Calendar
async function fetchEvents(days = 10): Promise<BusyEvent[]> {
  try {
    const oauth2Client = loadOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(startTime.getDate() + days);

    const minTime = startTime.toISOString();
    const maxTime = endTime.toISOString();

    const listRes = await calendar.events.list({
      calendarId: 'primary',
      timeMin: minTime,
      timeMax: maxTime,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = listRes.data.items;

    if (!events || events.length === 0) {
      console.log('No events found.');
      return [];
    }

    const eventData: BusyEvent[] = events.map((event) => ({
      start: event.start?.dateTime ?? event.start?.date ?? "",
      end: event.end?.dateTime ?? event.end?.date ?? "",
      summary: event.summary ?? "",
    }));

    return eventData

  } catch (error) {
    console.error('Error fetching and saving calendar events:', error);
    throw error;
  }
}

// Schedule events
async function scheduleEvent(event: Event): Promise<void> {
  try {
    const oauth2Client = loadOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('Event created: %s', response.data.htmlLink);
  } catch (error) {
    console.error('Error scheduling event:', error);
    throw error;
  }
}
export { scheduleEvent, fetchEvents };
