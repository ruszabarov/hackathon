import express from 'express';
import { google } from 'googleapis';
import open from 'open';
import fs from 'fs';

const app = express();
const port = 3001;

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback'; // Make sure this matches
const OAUTH2_CLIENT_ID = '971217795337-11n4d03dtr0g322te4qc6sc7hk50s3ns.apps.googleusercontent.com'; 
const OAUTH2_CLIENT_SECRET = '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';

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  OAUTH2_CLIENT_ID,
  OAUTH2_CLIENT_SECRET,
  REDIRECT_URI
);


app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Offline access gives a refresh token
    scope: SCOPES,
  });
  res.redirect(authUrl);  // Redirect to Google's OAuth2 URL
});

// Step 2: Handle the redirect from Google after authorization
app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code;

  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Save the tokens to a file
      fs.writeFileSync('Gcal_token.json', JSON.stringify(tokens, null, 2));
      res.send('Authorization successful! The token is saved to token.json');
    } catch (error) {
      res.status(500).send('Error exchanging the code for tokens');
      console.error(error);
    }
  } else {
    res.status(400).send('Authorization code missing');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  open(`http://localhost:${port}/auth`);
});
