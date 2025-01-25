import { google } from 'googleapis';
import fs from 'fs';
import open from 'open'; 

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']; // Set the scopes you need
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback'; // You can change this URL
const OAUTH2_CLIENT_ID = '971217795337-11n4d03dtr0g322te4qc6sc7hk50s3ns.apps.googleusercontent.com'; // Replace with your Google client ID
const OAUTH2_CLIENT_SECRET = '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'; // Replace with your Google client secret

const oauth2Client = new google.auth.OAuth2(
  OAUTH2_CLIENT_ID,
  OAUTH2_CLIENT_SECRET,
  REDIRECT_URI
);

// Generate the authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // This gives us a refresh token
  scope: SCOPES, // Define what access you are requesting
});

console.log('Authorize this app by visiting this URL:');
console.log(authUrl);

// Open the URL in the default browser
open(authUrl);

// This function will handle the code received in the redirect
async function getToken(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code); // Get the tokens using the code
    oauth2Client.setCredentials(tokens); // Set the tokens to the OAuth2 client

    // Save the tokens to a file for later use
    fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2)); // Saves in a formatted way
    console.log('Token saved to token.json');
  } catch (error) {
    console.error('Error getting tokens:', error);
  }
}

getToken()