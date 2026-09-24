# Deployment

The database remains on Supabase. Do not run Prisma migrations during deployment.

## Render Backend

Create a Render **Node** web service from the `Sih-2026` repository with these settings:

- Root directory: `.`
- Build command: `npm run build:render`
- Start command: `node backend/dist/main.js`
- Health check path: `/api/health`
- Node version: `20.x`

Required Render environment variables:

- `DATABASE_URL`: Supabase pooled connection string
- `JWT_SECRET`: production JWT signing secret
- `NODE_ENV`: `production`
- `PORT`: provided by Render; do not hard-code it
- `FRONTEND_URL`: the Vercel URL, or comma-separated Vercel URLs

`build:render` runs `npx prisma generate` before TypeScript compilation. The generated client is written to `backend/src/generated/prisma`.

## Vercel Frontend

Import the `mandi-mitra` directory as a separate Vercel project:

- Framework preset: `Next.js`
- Root directory: `.`
- Build command: `npm run build`
- Environment variable: `NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com/api`

Set the environment variable for the Production, Preview, and Development environments as needed. The frontend has no production localhost fallback.

## Local Verification

From PowerShell, set the required backend variables in the shell, then run:

```powershell
$env:DATABASE_URL = "<supabase-connection-string>"
$env:JWT_SECRET = "<local-test-secret>"
$env:PORT = "4100"
$env:FRONTEND_URL = "http://localhost:3000"
$env:NODE_ENV = "production"
npm run build:render
node backend/dist/main.js
```

In another PowerShell window:

```powershell
Invoke-RestMethod http://localhost:4100/api/health
Invoke-RestMethod http://localhost:4100/api/crops
```

Never commit real environment files or secrets.