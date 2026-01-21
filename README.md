# Tier1 Analytics Dashboard

A production-ready, read-only admin analytics dashboard for Tier1 React Native apps backend, built with Next.js App Router and TypeScript.

## Features

- 🔐 **Dual Authentication** - Session-based auth for admin pages, Basic Auth for metrics dashboard
- 📊 **Metrics Dashboard** - Production-ready read-only metrics dashboard with KPIs, charts, and analytics
- 📈 **Real-Time Analytics** - DAU/WAU/MAU tracking, play metrics, completion rates, and more
- 🔍 **Read-Only Access** - Server-side only database access using Supabase service role key
- 📱 **Responsive Design** - Modern, mobile-friendly UI with Tailwind CSS
- ⚡ **Server-Side Rendering** - Fast page loads with Next.js App Router
- 🚪 **Auto-Redirect** - Unauthenticated users are automatically redirected to login

## Tech Stack

- **Next.js 14** - App Router with Server Components
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database with server-side access
- **CSS Modules** - Component-scoped styling

## Database Schema

The dashboard connects to the following Supabase tables:

- `auth.users` - User accounts
- `user_play_history` - User play history records
- `unified_sessions` - User session data
- `favorites` - User favorites
- `feedback` - User feedback entries

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase project with the required tables
- Supabase service role key (for server-side access)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Copy the environment example file:

```bash
cp .env.example .env.local
```

3. Configure your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Session-Based Auth (for admin pages)
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=your_secure_password_here

# Basic Auth (for metrics dashboard)
DASHBOARD_USER=metrics_admin
DASHBOARD_PASS=your_dashboard_password_here
```

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `BASIC_AUTH_USERNAME` / `BASIC_AUTH_PASSWORD` - Credentials for session-based admin pages
- `DASHBOARD_USER` / `DASHBOARD_PASS` - Credentials for Basic Auth on `/dashboard` and `/api/metrics/*` routes

### Important Notes

- **Service Role Key**: This key bypasses Row Level Security (RLS) and should NEVER be exposed to the client. It's only used server-side.
- **Basic Auth**: Set strong credentials for production use. Consider using environment-specific values.
- **Database Access**: Ensure your Supabase project has the required tables. If `auth.users` is not accessible via the public schema, you may need to create a view or use Supabase's auth admin API.

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to the login page if not authenticated.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Redirects to /dashboard
│   ├── dashboard/         # Metrics dashboard (Basic Auth)
│   │   └── page.tsx       # Dashboard UI with KPIs and charts
│   ├── login/             # Login page (Session Auth)
│   ├── users/              # Users page
│   ├── play-history/       # Play history page
│   ├── sessions/           # Sessions page
│   ├── favorites/          # Favorites page
│   ├── feedback/           # Feedback page
│   └── api/
│       ├── auth/          # Authentication API routes
│       │   ├── login/     # Login endpoint
│       │   └── logout/    # Logout endpoint
│       └── metrics/       # Metrics API (Basic Auth)
│           ├── kpis/      # KPIs endpoint
│           ├── trends/    # Trends endpoint
│           └── top-sessions/ # Top sessions endpoint
├── components/            # React components
│   ├── DashboardLayout.tsx
│   ├── DataTable.tsx
│   └── MetricCard.tsx
├── lib/                   # Utility functions
│   ├── auth.ts            # Authentication utilities
│   ├── metrics.ts          # Metrics calculation functions
│   ├── supabase-server.ts # Server-side Supabase client
│   └── db/
│       ├── queries.ts     # Database query functions
│       └── types.ts       # TypeScript types
├── middleware.ts          # Dual auth middleware (Session + Basic Auth)
├── QA.md                  # SQL validation queries
└── README.md              # This file
```

## Authentication

### Session-Based Auth (Admin Pages)

Most routes use session-based authentication:

1. **Login Page**: Users are redirected to `/login` if not authenticated
2. **Session Management**: After successful login, a secure HTTP-only cookie is set
3. **Auto-Redirect**: After login, users are redirected to their original destination
4. **Logout**: Users can sign out using the logout button in the sidebar
5. **Session Duration**: Sessions last 7 days by default

### Basic Auth (Metrics Dashboard)

The `/dashboard` route and `/api/metrics/*` endpoints use HTTP Basic Authentication:

1. **Basic Auth Required**: Access requires HTTP Basic Auth credentials
2. **Environment Variables**: Set `DASHBOARD_USER` and `DASHBOARD_PASS` in `.env.local`
3. **Browser Prompt**: Browsers will prompt for username/password when accessing `/dashboard`
4. **API Access**: API endpoints also require Basic Auth headers

**Example API call with Basic Auth:**
```bash
curl -u "$DASHBOARD_USER:$DASHBOARD_PASS" http://localhost:3000/api/metrics/kpis
```

## Metrics Dashboard

The `/dashboard` route provides a comprehensive read-only metrics dashboard:

### Available Metrics

- **New Users**: Today, Last 7 Days, Last 30 Days
- **Active Users**: DAU (Daily), WAU (Weekly), MAU (Monthly)
- **Plays**: Today, Last 7 Days, Last 30 Days
- **Minutes Listened**: Today, Last 7 Days, Last 30 Days
- **Completion Rate**: Percentage of completed sessions
- **Favorites**: Last 7 Days, Last 30 Days
- **Feedback**: Last 7 Days, Last 30 Days

### Charts

- **DAU Trend**: Line chart showing daily active users over the last 30 days
- **Top Sessions Table**: Most played sessions with plays, minutes listened, and average progress

### API Endpoints

All endpoints require Basic Auth:

- `GET /api/metrics/kpis` - Get all KPIs
- `GET /api/metrics/trends?days=30` - Get DAU trends (1-365 days)
- `GET /api/metrics/top-sessions?days=7&limit=10` - Get top sessions (1-365 days, limit 1-100)

### Validation

See `QA.md` for SQL queries to validate metrics in the Supabase SQL editor.

## Security Considerations

1. **Service Role Key**: Never commit `.env.local` or expose the service role key to the client. This key bypasses RLS and should only be used server-side.
2. **Credentials**: Use strong, unique passwords for production:
   - `BASIC_AUTH_USERNAME` / `BASIC_AUTH_PASSWORD` - For session-based admin pages
   - `DASHBOARD_USER` / `DASHBOARD_PASS` - For Basic Auth on metrics dashboard
3. **HTTPS**: Always use HTTPS in production to protect credentials and session cookies
4. **Read-Only**: The entire application is read-only by design - no INSERT/UPDATE/DELETE operations are implemented
5. **Session Cookies**: Sessions use HTTP-only cookies for security
6. **Basic Auth**: Basic Auth credentials are sent with every request. Use HTTPS in production to encrypt credentials in transit.

## Customization

### Updating Database Types

Update `lib/db/types.ts` to match your actual database schema. The types should reflect your Supabase table structures.

### Accessing auth.users

If `auth.users` is not accessible via the public schema, you have two options:

1. Create a PostgreSQL view in your Supabase database:
```sql
CREATE VIEW public.users AS SELECT * FROM auth.users;
```

2. Use Supabase's auth admin API (requires additional setup in `lib/db/queries.ts`)

### Adding New Analytics

1. Add query functions in `lib/db/queries.ts`
2. Create a new page in `app/[section]/page.tsx`
3. Add navigation link in `components/DashboardLayout.tsx`

## License

Private - Tier1 Analytics Dashboard

