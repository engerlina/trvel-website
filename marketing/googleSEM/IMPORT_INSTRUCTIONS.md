# Google Ads Editor Import Instructions

## Files Created

The following CSV files have been created for import into Google Ads Editor:

| File | Contents | Import Order |
|------|----------|--------------|
| `import-ad-groups.csv` | 8 ad groups with Max CPC bids | 1st |
| `import-keywords.csv` | 97 exact match keywords | 2nd |
| `import-negative-keywords.csv` | 42 campaign-level negative keywords | 3rd |
| `import-responsive-search-ads.csv` | 11 RSAs (1-2 per ad group) | 4th |
| `import-sitelinks.csv` | 6 sitelink extensions | 5th |
| `import-callouts.csv` | 10 callout extensions | 6th |
| `google-ads-editor-import.csv` | Combined file (all entities) | Alternative |

## Import Steps

### Option 1: Import Separate Files (Recommended)

1. **Open Google Ads Editor**
2. **Select your account** (866-912-6474)
3. **Import each file in order:**
   - Go to `Account > Import > From CSV`
   - Select the file
   - Map columns if needed
   - Review changes
   - Click "Post" to upload

### Option 2: Import Combined File

1. Open Google Ads Editor
2. Go to `Account > Import > From CSV`
3. Select `google-ads-editor-import.csv`
4. Map columns to Google Ads fields
5. Review and post changes

## Campaign Structure Summary

```
Campaign: Search - Travel eSIM - AU
├── Budget: A$50/day (Maximize Conversions)
│
├── Ad Groups:
│   ├── Travel eSIM - General (Max CPC: $3.00)
│   ├── Japan eSIM (Max CPC: $5.00)
│   ├── Thailand eSIM (Max CPC: $4.00)
│   ├── Indonesia eSIM (Max CPC: $4.00)
│   ├── Singapore eSIM (Max CPC: $3.50)
│   ├── South Korea eSIM (Max CPC: $4.50)
│   ├── Vietnam eSIM (Max CPC: $3.50)
│   └── Malaysia eSIM (Max CPC: $3.50)
│
├── Keywords: 97 total (all Exact Match)
│   ├── 12 general travel keywords
│   └── 10-15 per destination
│
├── Negative Keywords: 42 (campaign-level, Broad Match)
│
├── Ads: 11 RSAs (2 per major destination)
│
└── Extensions:
    ├── 6 Sitelinks
    └── 10 Callouts
```

## Keyword Strategy

All keywords use **Exact Match** `[keyword]` to:
- Control costs during learning phase
- Target high-intent searchers only
- Avoid wasted spend on broad queries

### Max CPC Bids by Ad Group

| Ad Group | Max CPC | Rationale |
|----------|---------|-----------|
| Japan eSIM | A$5.00 | Highest search volume, premium destination |
| South Korea eSIM | A$4.50 | High demand, premium travellers |
| Thailand eSIM | A$4.00 | Popular destination, competitive |
| Indonesia eSIM | A$4.00 | Bali traffic, competitive |
| Singapore eSIM | A$3.50 | Shorter trips, lower LTV |
| Vietnam eSIM | A$3.50 | Emerging market |
| Malaysia eSIM | A$3.50 | Emerging market |
| Travel eSIM - General | A$3.00 | Broader intent, lower conversion |

## Landing Page URLs

| Ad Group | Landing Page |
|----------|-------------|
| Travel eSIM - General | https://www.trvel.co/en-au/ |
| Japan eSIM | https://www.trvel.co/en-au/japan/ |
| Thailand eSIM | https://www.trvel.co/en-au/thailand/ |
| Indonesia eSIM | https://www.trvel.co/en-au/indonesia/ |
| Singapore eSIM | https://www.trvel.co/en-au/singapore/ |
| South Korea eSIM | https://www.trvel.co/en-au/south-korea/ |
| Vietnam eSIM | https://www.trvel.co/en-au/vietnam/ |
| Malaysia eSIM | https://www.trvel.co/en-au/malaysia/ |

## Post-Import Checklist

After importing, verify in Google Ads Editor:

- [ ] All 8 ad groups created
- [ ] Keywords assigned to correct ad groups
- [ ] Negative keywords at campaign level
- [ ] RSAs have 15 headlines and 4 descriptions each
- [ ] Sitelinks linked to campaign
- [ ] Callouts linked to campaign
- [ ] Final URLs are correct
- [ ] Max CPC bids are set

## Notes

1. **Campaign must already exist** - These files add content to existing campaign "Search - Travel eSIM - AU"
2. **Review before posting** - Always review changes in Google Ads Editor before posting
3. **Extensions may need manual setup** - Some extension types require manual configuration in the Google Ads interface
4. **Monitor performance** - After 1-2 weeks, review Search Terms report and add negative keywords as needed
