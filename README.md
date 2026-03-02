## Cronometer Dashboard (Next.js 14 + Supabase)

Health dashboard that reads from Supabase PostgreSQL tables:
- `cronometer_daily_summary`
- `cronometer_servings`
- `cronometer_biometrics`

### Stack
- Next.js 14 (App Router)
- Tailwind CSS + lightweight shadcn-style UI components
- Recharts
- Supabase client (`@supabase/supabase-js`)

### Environment
Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Run
```bash
npm install
npm run dev
```

### Deploy
Deploy directly on Vercel; set the same env vars in project settings.
