/**
 * GSC Health Check - Check sitemap, search performance, and URL indexing status
 *
 * Usage: npx tsx scripts/gsc-status.ts
 */

import 'dotenv/config';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });

const sc = google.searchconsole({ version: 'v1', auth: oauth2Client });
const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });
const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:trvel.co';

async function checkSitemaps() {
  console.log('=== SITEMAP STATUS ===');
  const sitemaps = await sc.sitemaps.list({ siteUrl });
  for (const sm of sitemaps.data.sitemap || []) {
    console.log('URL:', sm.path);
    console.log('  Last submitted:', sm.lastSubmitted);
    console.log('  Last downloaded:', sm.lastDownloaded);
    console.log('  Pending:', sm.isPending);
    console.log('  Warnings:', sm.warnings, 'Errors:', sm.errors);
    if (sm.contents) {
      for (const c of sm.contents) {
        console.log('  Type:', c.type, '- Submitted:', c.submitted, '- Indexed:', c.indexed);
      }
    }
  }
}

async function checkPerformance() {
  console.log('\n=== SEARCH PERFORMANCE (last 7 days) ===');
  const perf = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: '2026-04-07',
      endDate: '2026-04-13',
      dimensions: ['date'],
    }
  });
  let totalClicks = 0, totalImpressions = 0;
  for (const row of perf.data.rows || []) {
    const d = row.keys?.[0] || '?';
    console.log(`  ${d}  clicks: ${row.clicks}  impressions: ${row.impressions}  position: ${(row.position || 0).toFixed(1)}`);
    totalClicks += row.clicks || 0;
    totalImpressions += row.impressions || 0;
  }
  console.log(`  TOTAL: ${totalClicks} clicks, ${totalImpressions} impressions`);
}

async function inspectUrls() {
  console.log('\n=== URL INSPECTION ===');
  const urls = [
    'https://www.trvel.co/en-au',
    'https://www.trvel.co/en-au/japan',
    'https://www.trvel.co/en-au/thailand',
    'https://www.trvel.co/en-ca/japan',
    'https://www.trvel.co/en-nz/japan',
  ];
  for (const url of urls) {
    try {
      const res = await sc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl }
      });
      const r = res.data.inspectionResult;
      console.log(url);
      console.log('  Verdict:', r?.indexStatusResult?.verdict);
      console.log('  Coverage:', r?.indexStatusResult?.coverageState);
      console.log('  Last crawl:', r?.indexStatusResult?.lastCrawlTime);
      console.log('  Indexing:', r?.indexStatusResult?.indexingState);
      console.log('');
    } catch (e: any) {
      console.log(url);
      console.log('  Error:', e.message?.substring(0, 100));
      console.log('');
    }
  }
}

async function main() {
  try { await checkSitemaps(); } catch (e: any) { console.error('Sitemap error:', e.message?.substring(0, 150)); }
  try { await checkPerformance(); } catch (e: any) { console.error('Performance error:', e.message?.substring(0, 150)); }
  try { await inspectUrls(); } catch (e: any) { console.error('Inspection error:', e.message?.substring(0, 150)); }
}

main();
