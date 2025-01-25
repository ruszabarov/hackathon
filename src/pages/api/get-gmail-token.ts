// pages/api/get-gmail-token.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    if (!code) {
      // 1) No code? Redirect to Google
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });

      // Do NOT: return res.redirect(authUrl);
      // Instead:
      res.redirect(authUrl);
      return; // <-- End the function here

    } else {
      // 2) We have a code, exchange for tokens
      const { tokens } = await oauth2Client.getToken(code as string);

      // Save to file
      const TOKEN_PATH = path.join(process.cwd(), 'token.json');
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens), 'utf8');

      // Then send a response
      res.status(200).send(`
        <h1>Success!</h1>
        <p>token.json has been saved on the server.</p>
      `);
      return; // <-- End here as well
    }
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).json({ error: (error as Error).message });
    return; // <-- Make sure we don't return anything else
  }
}
