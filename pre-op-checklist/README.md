# Pre-Op Equipment Checklist

A Progressive Web App (PWA) for daily pre-operational safety checklists for powered mobile equipment and vehicles, compliant with Part XV Sections 229.2 & 230.5.

## Features

- **Offline Support**: Complete checklists even without internet - data syncs when back online
- **Mobile-First**: Designed for field use on phones and tablets
- **Retro Blue Theme**: Bold, industrial dark theme with high contrast for outdoor visibility
- **Airtable Integration**: Seamlessly sync data to your Airtable base
- **PWA**: Install as a native app on any device

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

### Airtable Setup

1. Create an Airtable base with a table called "Pre-Op Checklist"
2. Copy `.env.example` to `.env.local`
3. Add your Airtable credentials:

```env
NEXT_PUBLIC_AIRTABLE_API_KEY=your_api_key
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id
NEXT_PUBLIC_AIRTABLE_TABLE_NAME=Pre-Op Checklist
```

### Airtable Fields

Your Airtable table should have these fields:
- Date (Date)
- Employee Initials or Name (Single line text)
- Employee ID Number (Single line text)
- Asset Make and Equipment Type (Single line text)
- Asset ID Number (Single line text)
- Hours (Number)
- Kilometers (Number)
- Items Inspected (Multiple select)
- Items Requiring Attention (Multiple select)
- Condition of Equipment (Single select: OK, Requires Attention)
- Comments/Observations (Long text)
- Action Taken (Single select: Equipment Cleared, Reported for Maintenance)

## Inspection Items

The checklist covers these safety items per Part XV regulations:
- Engine Oil
- Hydraulic Oil
- Coolant Level
- Chassis/ROPS (Rollover Protective Structure)
- Fire Extinguisher
- Horn
- Gauges
- Backup Alarm
- Lights/Markers/Beacons
- Glass
- Mirrors

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **PWA**: @ducanh2912/next-pwa
- **Theme**: Custom Retro Blue (industrial dark theme)

## Regulatory Compliance

This checklist supports compliance with:
- **Section 229.2**: Powered Mobile Equipment safety device checks
- **Section 230.5**: Vehicle safety device checks

Operators must check safety devices:
1. Daily before operating equipment
2. Before each shift if multiple operators use equipment
3. Each time a different operator uses the equipment

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

## License

MIT
