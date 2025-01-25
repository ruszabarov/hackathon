import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

//for schedule events from a json
//const EVENTS_FILE_PATH = path.join(process.cwd(), 'schedule.json');

async function scheduleEvent() {
  try {
    const TOKEN_PATH = path.join(process.cwd(), 'GCal_token.json');

    
    //const data = fs.readFileSync(EVENTS_FILE_PATH, 'utf8');
    //const event = JSON.parse(data);


    if (!fs.existsSync(TOKEN_PATH)) {
      console.error('Token file not found. Please authorize the app first.');
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

    //Date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const date = String(today.getDate()).padStart(2, '0');

    // Define start and end times for 3 PM to 4 PM
    const startTime = `${year}-${month}-${date}T15:00:00`;
    const endTime = `${year}-${month}-${date}T16:00:00`;

    // hardcoded for now 
    const event = {
      summary: 'Google I/O 2015',
      location: '800 Howard St., San Francisco, CA 94103',
      description: "A chance to hear more about Google's developer products.",
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/New_York',
      },
      attendees: [
        { email: 'lpage@example.com' },
        { email: 'sbrin@example.com' },
      ],
    };




    // Insert the event into the calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('Event created: %s', response.data.htmlLink);
  } catch (error) {
    console.error('Error scheduling event:', error);
  }
}

// Call the function (for testing purposes)
void scheduleEvent();
