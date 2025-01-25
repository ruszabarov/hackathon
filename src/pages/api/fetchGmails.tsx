import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Load token.json
    const TOKEN_PATH = path.join(process.cwd(), 'token.json');
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.status(400).json({ error: 'token.json not found on server.' });
    }
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

    // 2. Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // 3. Set the credentials from token.json
    oauth2Client.setCredentials(tokens);

    // 4. Create the Gmail client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 5. Compute time for "past 24 hours" in seconds since epoch
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

    // 6. Build the query for last 24 hours
    const query = `after:${oneDayAgo}`;

    // 7. List messages that match this query
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50, // Adjust or remove as needed
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
      return res.status(200).json([]);
    }

    // 8. Fetch metadata and content for each email
    const emailData: Array<{ title: string; sender: string; content: string; timestamp: string }> = [];

    for (const msg of messages) {
      if (!msg.id) continue;

      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full', // Fetch full email including content
      });

      const headers = detail.data.payload?.headers || [];
      const subjectHeader = headers.find(h => h.name === 'Subject');
      const fromHeader = headers.find(h => h.name === 'From');

      const title = subjectHeader?.value || 'No Subject';
      const sender = fromHeader?.value || 'Unknown Sender';
      const timestamp = detail.data.internalDate
        ? new Date(Number(detail.data.internalDate)).toISOString()
        : 'Unknown Timestamp';

      // Decode the email body (simplified for this example)
      const bodyParts = detail.data.payload?.parts || [];
      const textPart = bodyParts.find(part => part.mimeType === 'text/plain');
      const content = textPart?.body?.data
        ? Buffer.from(textPart.body.data, 'base64').toString('utf-8')
        : 'No Content';

      emailData.push({ title, sender, content, timestamp });
    }

    // 9. Save the data to a file (optional)
    const OUTPUT_PATH = path.join(process.cwd(), 'emails.json');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(emailData, null, 2));

    // 10. Return the fetched email data
    return res.status(200).json(emailData);
  } catch (error) {
    console.error('Error in fetchGmails API:', error);
    return res.status(500).json({ error: String(error) });
  }
}
