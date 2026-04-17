/**
 * Submit sitemap to Google Search Console
 *
 * Usage: npx tsx scripts/gsc-submit-sitemap.ts
 */

import 'dotenv/config';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;
const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:trvel.co';

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('ERROR: Missing GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, or GSC_REFRESH_TOKEN in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });

async function main() {
  const sitemapUrl = 'https://www.trvel.co/sitemap.xml';

  console.log(`\nSubmitting sitemap to Google Search Console...`);
  console.log(`  Site: ${SITE_URL}`);
  console.log(`  Sitemap: ${sitemapUrl}\n`);

  try {
    // Submit the sitemap
    await searchconsole.sitemaps.submit({
      siteUrl: SITE_URL,
      feedpath: sitemapUrl,
    });
    console.log('Sitemap submitted successfully!\n');

    // List all sitemaps to confirm
    const res = await searchconsole.sitemaps.list({
      siteUrl: SITE_URL,
    });

    if (res.data.sitemap && res.data.sitemap.length > 0) {
      console.log('Current sitemaps:');
      for (const sm of res.data.sitemap) {
        console.log(`  ${sm.path}`);
        console.log(`    Last submitted: ${sm.lastSubmitted}`);
        console.log(`    Last downloaded: ${sm.lastDownloaded}`);
        console.log(`    Pending: ${sm.isPending}`);
        console.log(`    Warnings: ${sm.warnings || 0}, Errors: ${sm.errors || 0}`);
        console.log('');
      }
    }
  } catch (error: any) {
    console.error('Failed to submit sitemap:', error.message || error);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

main();
