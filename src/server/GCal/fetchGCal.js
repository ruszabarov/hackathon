import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchCalendarEvents(startTime, endTime) {
  try {
    
    const TOKEN_PATH = path.join(process.cwd(), 'GCal_token.json');
    if (!fs.existsSync(TOKEN_PATH)) {
      console.error('token.json not found on server.');
      process.exit(1); // Exit with error code
    }
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

    const listRes = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startTime,
      timeMax: endTime,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = listRes.data.items;

    if (!events || events.length === 0) {
      console.log('No events found for today.');
      return;
    }

    // 7. Collect event data
    const eventData = events.map((event) => ({
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      summary: event.summary,
    }));

    const OUTPUT_PATH = path.join(__dirname, 'calendarEvents.json');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(eventData, null, 2));

    console.log('Fetched events saved to calendarEvents.json');
  } catch (error) {
    console.error('Error in fetchCalendarEvents:', error);
    process.exit(1); // Exit with error code
  }
}

const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
const todayEnd = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

fetchCalendarEvents(todayStart, todayEnd);
