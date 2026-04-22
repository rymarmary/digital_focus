# Digital Focus

**A web application for assessing the level of digital load and building mindful device-usage habits.**

Deployment: [digital-focus.vercel.app](https://digital-focus.vercel.app) · Graduation project · Maria Rymar · 2025–2026

---

## Who this product is for

Digital Focus is designed for people who want to understand how much time and attention they give to screens — and gradually change that. The app requires no complex setup: the user takes a short quiz, receives a result with recommendations, and starts tracking their habits in the tracker.

The key technical feature is a built-in event analytics pipeline powered by ClickHouse and Yandex Metrika, which makes it possible to collect behavioral data and build product metrics without relying on external SaaS platforms.

---

## Thesis topic

> "Applying event analytics in a web application for controlling screen-time habits"

The project demonstrates a full cycle of working with event data: from user actions on the frontend — to writing into an analytical database and the ability to build funnels, engagement metrics, and user journeys.

---

## Features

| Section | Description |
|---------|-------------|
| **Quiz** | 8 questions, scoring system that evaluates digital load |
| **Result** | Final score, interpretation, saved to personal account |
| **Recommendations** | Personalized advice across three load levels |
| **Habit tracker** | 14-day grid, add/remove habits, synced with the database |
| **Personal account** | Test history, trend chart, latest result, name editing |
| **PDF export** | Save a report from the personal account |
| **Authentication** | Sign-up and sign-in via Supabase with email confirmation |
| **Feedback** | Feedback form available on any page |

---

## Tech stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (pages router) |
| Language | TypeScript |
| Styles | Tailwind CSS |
| Database / Auth | Supabase (PostgreSQL) |
| Analytical DB | ClickHouse |
| Product analytics | Yandex Metrika |
| Charts | Recharts |
| PDF | jsPDF + html2canvas |

---

## Analytics architecture

### Pipeline

```
User action (click, view, submit)
       ↓
trackEvent(event, params) — utils/analytics.ts
       ↓
   ┌───┴────────────────────────┐
   ↓                            ↓
Yandex Metrika            navigator.sendBeacon()
ym.reachGoal(event)        POST /api/events
                                ↓
                     Next.js API Route (serverless)
                     pages/api/events.ts
                                ↓
                     ClickHouse HTTP API
                     INSERT INTO analytics.events_raw
                                ↓
                     SQL queries / analytics
```

### How it works

**1. Frontend** (`utils/analytics.ts`) — the `trackEvent(event, params)` function:
- sends the event to Yandex Metrika via `ym.reachGoal`
- sends the payload through `navigator.sendBeacon` to the API route (works reliably even when the tab is closing)
- automatically adds: `user_id`, `uid` (cookie), `page` (current path)
- the timestamp is set on the server, not on the client

**2. API route** (`pages/api/events.ts`) — Next.js serverless function:
- accepts a POST request, validates that `event` is present
- builds a row with a server-side `ts` and inserts it into ClickHouse via the HTTP API (`FORMAT JSONEachRow`)
- if ClickHouse is unavailable, returns `200` with an error flag — the client flow is not interrupted

**3. ClickHouse** (`analytics.events_raw`):
- stores all events: `ts`, `event`, `page_url`, `uid`, `user_id`, `params_json`
- chosen as the analytical database for its columnar storage, aggregation speed on large volumes, and native schema-less JSON parameter support

**4. Yandex Metrika**:
- duplicates all events as goals (`reachGoal`) — enabling the standard Metrika interface for quick browsing
- automatically records page transitions (`hit`) via `routeChangeComplete`

### User identification

| Type | `user_id` value | Storage |
|------|-----------------|---------|
| Authenticated | UUID from Supabase Auth | Supabase database |
| Anonymous guest | UUID generated on first visit | `localStorage` (`df_anon_id`) |

The anonymous ID is created via `crypto.randomUUID()` and kept indefinitely — this makes it possible to track repeat visits without authentication.

---

## Project structure

```
digital_focus/
├── pages/
│   ├── index.tsx              # Home page
│   ├── quiz.tsx               # Quiz
│   ├── result.tsx             # Quiz result
│   ├── recommendations.tsx    # Recommendations
│   ├── tracker.tsx            # Habit tracker
│   ├── dashboard.tsx          # Personal account
│   ├── _app.tsx               # Global layout, page_view tracking
│   ├── _document.tsx          # Yandex Metrika script
│   ├── auth/
│   │   ├── signin.tsx
│   │   ├── signup.tsx
│   │   └── confirmed.tsx
│   └── api/
│       └── events.ts          # API route → ClickHouse
├── components/
│   ├── AuthGuard.tsx
│   ├── FeedbackWidget.tsx     # Feedback form
│   └── Footer.tsx
└── utils/
    ├── analytics.ts           # trackEvent, trackPageView, getUserId
    └── supabaseClient.ts      # Supabase client
```

---

## Running locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```bash
cp .env.example .env.local  # if present, otherwise create manually
```

Fill in the variables (see the section below).

### 3. Start the dev server

```bash
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

---

## ClickHouse table schema

```sql
CREATE TABLE IF NOT EXISTS analytics.events_raw (
  ts          DateTime,
  event       String,
  page_url    Nullable(String),
  uid         Nullable(String),
  user_id     Nullable(String),
  params_json String DEFAULT '{}'
) ENGINE = MergeTree()
ORDER BY ts;
```

---

## Environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Yandex Metrika
NEXT_PUBLIC_METRIKA_ID=your-counter-id

# ClickHouse
CLICKHOUSE_HOST=http://localhost:8123
CLICKHOUSE_USER=analytics_user
CLICKHOUSE_PASSWORD=your-password
CLICKHOUSE_DB=analytics
CLICKHOUSE_TABLE=events_raw
```

> `.env.local` is not committed to the repository.

---

## Key analytics events

### Quiz

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | Every page transition | `url` |
| `quiz_start` | Opening the quiz page | — |
| `quiz_answer` | Selecting an answer option | `question`, `score` |
| `quiz_complete` | Finishing the quiz | `score` |

### Result and recommendations

| Event | Trigger | Parameters |
|-------|---------|------------|
| `result_view` | Viewing the result page | `score` |
| `recommendations_view` | Viewing the recommendations page | `score` |
| `recommendations_open_from_result` | Navigating to recommendations from the result page | `score` |
| `recommendations_open_from_dashboard` | Navigating to recommendations from the personal account | `score` |

### Habit tracker

| Event | Trigger | Parameters |
|-------|---------|------------|
| `tracker_view` | Opening the tracker | — |
| `habit_add` | Adding a new habit | — |
| `habit_toggle` | Marking completion for a day | `value` |
| `habit_delete` | Deleting a habit | — |

### Personal account

| Event | Trigger | Parameters |
|-------|---------|------------|
| `dashboard_open` | Opening the personal account | — |
| `pdf_export` | Exporting the report to PDF | — |

### Authentication and feedback

| Event | Trigger | Parameters |
|-------|---------|------------|
| `sign_in_success` | Successful sign-in | — |
| `sign_in_error` | Sign-in error | — |
| `sign_up_success` | Successful sign-up | — |
| `sign_up_error` | Sign-up error | — |
| `feedback_submit` | Feedback form submission | — |

---

## Example analytical queries

### Quiz funnel

```sql
SELECT
  countIf(event = 'quiz_start')        AS started,
  countIf(event = 'quiz_complete')     AS completed,
  countIf(event = 'recommendations_view') AS saw_recommendations,
  round(countIf(event = 'quiz_complete') / countIf(event = 'quiz_start') * 100, 1) AS completion_rate_pct
FROM analytics.events_raw
WHERE ts >= now() - INTERVAL 30 DAY;
```

### Top events over the last 7 days

```sql
SELECT
  event,
  count() AS total,
  uniq(user_id) AS unique_users
FROM analytics.events_raw
WHERE ts >= now() - INTERVAL 7 DAY
GROUP BY event
ORDER BY total DESC;
```

### Guest-to-authenticated-user conversion

```sql
SELECT
  countIf(event = 'sign_up_success')                             AS registrations,
  countIf(event = 'quiz_complete')                               AS quiz_completions,
  round(countIf(event = 'sign_up_success') /
        countIf(event = 'quiz_complete') * 100, 1)               AS quiz_to_signup_pct
FROM analytics.events_raw
WHERE ts >= now() - INTERVAL 30 DAY;
```

---

## What can be analyzed

**Funnel and drop-off**
- The quiz step where users most often leave (`quiz_answer` by question number)
- How many users progress from `quiz_start` to `recommendations_view`
- Where the user journey breaks: result → recommendations → account → tracker

**Engagement**
- Return frequency for a single `user_id` — a signal that the tracker is being used regularly
- Ratio of `habit_toggle` to `tracker_view` — how actively users fill in the tracker
- Volume of `habit_add` and `habit_delete` as a proxy for personalization

**Feature usage**
- How often PDF export (`pdf_export`) is used — how much that feature is actually needed
- How many users revisit recommendations
- The ratio of authenticated to anonymous users

**Auth funnel**
- Conversion of `sign_up_success` / `sign_in_error` — onboarding quality
- Share of users who complete the quiz before registering

---

## Limitations and assumptions

- **Data volume** — the project works with a test sample of users; production-scale loads have not been tested
- **Retention** — data is collected during the thesis period; long-term retention is not measured
- **Anonymous users** — the `localStorage` UUID is lost when the browser is cleared; cross-device tracking is not implemented
- **Yandex Metrika** — events are duplicated, but visualization is limited to the standard Metrika interface

---

## Possible improvements

- **User segmentation** — splitting by load level (score), device type, traffic source
- **A/B tests** — testing the wording of recommendations or the order of quiz questions
- **ML recommendations** — personalization based on an individual user's habit history
- **Real-time dashboard** — visualizing events in Grafana or Metabase on top of ClickHouse
- **Push notifications** — reminders for users who haven't opened the tracker in a while
- **Data export** — CSV/Excel export of history for independent analysis

---

## Project status

| Feature | Status |
|---------|--------|
| Quiz + result | Done |
| Recommendations | Done |
| Habit tracker | Done |
| Personal account + history | Done |
| PDF export | Done |
| Authentication (Supabase) | Done |
| Event analytics (ClickHouse) | Done |
| Yandex Metrika | Done |
| Anonymous users (localStorage UUID) | Done |

---

## Thesis value

The project addresses a problem relevant to product development: **how to build your own event analytics pipeline that does not depend on external platforms**.

Delivered:
- Full pipeline: frontend → serverless API → ClickHouse
- Dual-track tracking: Yandex Metrika (quick browsing) + own database (raw data and ad-hoc queries)
- User identification: authenticated users (Supabase UUID) and anonymous users (localStorage UUID)
- Analytics coverage across all key user actions (19 events)
- Ready-to-use SQL queries for funnels, conversions, and feature usage

---

## License

The project was created as a graduation thesis and is intended exclusively for educational and non-commercial purposes.
Commercial use, distribution, and resale without the author's permission are prohibited.
