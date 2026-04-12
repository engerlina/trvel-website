/**
 * Google Search Console OAuth2 Token Generator
 *
 * Usage: npx tsx scripts/gsc-auth.ts
 *
 * Prerequisites:
 *   1. npm install googleapis (if not already installed)
 *   2. GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET set in .env
 *   3. In Google Cloud Console, add http://localhost:3333/callback
 *      as an Authorized Redirect URI for your OAuth client.
 *      Go to: https://console.cloud.google.com/apis/credentials
 *      -> Click your OAuth 2.0 Client ID -> Add the URI -> Save
 */

import 'dotenv/config';
import http from 'http';
import { google } from 'googleapis';
import { exec } from 'child_process';
import { platform } from 'os';

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3333/callback';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: Missing GOOGLE_ADS_CLIENT_ID or GOOGLE_ADS_CLIENT_SECRET in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPE,
});

function openBrowser(url: string) {
  const cmd =
    platform() === 'win32' ? `start "" "${url}"` :
    platform() === 'darwin' ? `open "${url}"` :
    `xdg-open "${url}"`;
  exec(cmd);
}

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/callback')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const url = new URL(req.url, `http://localhost:3333`);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`<h1>Authorization failed</h1><p>${error}</p>`);
    console.error(`\nAuthorization failed: ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h1>No authorization code received</h1>');
    server.close();
    process.exit(1);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Success!</h1><p>You can close this tab and return to the terminal.</p>');

    console.log('\n========================================');
    console.log('  Google Search Console - OAuth Token');
    console.log('========================================\n');

    if (tokens.refresh_token) {
      console.log('Refresh token:\n');
      console.log(`  ${tokens.refresh_token}\n`);
      console.log('Add this to your .env file:\n');
      console.log(`  GSC_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
    } else {
      console.log('WARNING: No refresh token returned.');
      console.log('This can happen if you previously authorized this app.');
      console.log('Revoke access at https://myaccount.google.com/permissions');
      console.log('then run this script again.\n');
    }

    if (tokens.access_token) {
      console.log(`Access token (expires in ${tokens.expiry_date ? Math.round((tokens.expiry_date - Date.now()) / 60000) : '?'} min):`);
      console.log(`  ${tokens.access_token}\n`);
    }

    console.log('========================================\n');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>Token exchange failed</h1><p>Check the terminal for details.</p>');
    console.error('\nFailed to exchange code for tokens:', err);
  }

  server.close();
  process.exit(0);
});

server.listen(3333, () => {
  console.log('\n========================================');
  console.log('  GSC OAuth2 Token Generator');
  console.log('========================================\n');
  console.log('IMPORTANT: Make sure http://localhost:3333/callback is added as an');
  console.log('Authorized Redirect URI in your Google Cloud Console OAuth client.');
  console.log('Go to: https://console.cloud.google.com/apis/credentials');
  console.log(`Client ID: ${CLIENT_ID?.substring(0, 20)}...\n`);
  console.log('Opening browser for authorization...\n');
  openBrowser(authUrl);
});
