import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchTimeFromEmail } from 'src/server/modelProcessing'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Load Google OAuth2 client
function loadOAuth2Client() {
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
async function fetchCalendarEvents(days = 10, fileName = 'calendarEvents.json') {
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
            return;
        }

        const eventData = events.map((event) => ({
            start: event.start?.dateTime ?? event.start?.date,
            end: event.end?.dateTime ?? event.end?.date,
            summary: event.summary,
        }));

        const OUTPUT_PATH = path.join(__dirname, fileName);
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(eventData, null, 2));

        console.log(`Fetched events saved to ${fileName}`);
    } catch (error) {
        console.error('Error fetching and saving calendar events:', error);
        throw error;
    }
}

//schedule events 
async function scheduleEvent(event) {
    try {
        const oauth2Client = loadOAuth2Client();
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        // const EVENTS_FILE_PATH = path.join(__dirname, 'schedule_events.json');
        // const data = fs.readFileSync(EVENTS_FILE_PATH, 'utf8');
        //const event = JSON.parse(data)[0];


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

async function testFunctions() {
    console.log('Testing loadOAuth2Client...');
    try {
        const oauth2Client = loadOAuth2Client();
        console.log('OAuth2 client loaded successfully.');
    } catch (error) {
        console.error('Error loading OAuth2 client:', error);
        return;
    }

    console.log('Testing fetchAndSaveCalendarEvents...');
    try {
        await fetchCalendarEvents(); // Fetch events and save to testEvents.json
        console.log('fetchAndSaveCalendarEvents function executed successfully.');
    } catch (error) {
        console.error('Error in fetchAndSaveCalendarEvents:', error);
    }
}

async function scheduleFromEmail(email) {
    try {
        // Call fetchCalendarEvents and wait for its completion
        await fetchCalendarEvents();
        console.log('Fetching calendar events completed.');

        // Use async readFile to avoid blocking
        const EVENTS_FILE_PATH = path.join(__dirname, 'calendarEvents.json');
        const data = await fs.promises.readFile(EVENTS_FILE_PATH, 'utf8');
        const events = JSON.parse(data);

        // Fetch time from email and schedule event
        try {
            const date = await fetchTimeFromEmail(email, events);
            await scheduleEvent(date);
            console.log('Test suggested time:', date);
        } catch (error) {
            console.error('Error fetching time from email or scheduling event:', error);
        }

    } catch (error) {
        console.error('Error scheduling from email:', error);
    }
}


//TESTING
// const sampleEmail = {
//     id: "2",
//     title: "Urgent: !@#$$%Meeting%",
//     sender: "Jane Smith <jane.smith@example.com>",
//     content: `Let's mee%t & discuss the upcoming proj\\\]ect launch.`,
//     timestamp: "InvalidDate",
// };

// void scheduleFromEmail(sampleEmail);
export { scheduleFromEmail, scheduleEvent };
