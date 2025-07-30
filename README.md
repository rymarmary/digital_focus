# Digital Focus – Diploma Project

A web application to assess digital overload and build mindful tech habits.  
**Diploma project by Mary Rymar (2025–2026): https://digital-focus.vercel.app**

## Overview

The app allows users to:

- Take a short quiz to measure digital stress
- Receive personalized recommendations
- Track daily habits and monitor progress
- Register and manage account (email and name)
- View test results and history
- Send feedback from any page

## Tech Stack

- **Next.js** – React framework
- **TypeScript** – Static typing
- **Tailwind CSS** – Utility-first styling
- **Supabase** – Auth and database
- **FormSubmit** – Lightweight external form handling
- **React Hooks** – State and effect management
- **date-fns** – Date manipulation

## Features

| Section           | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| Home              | Intro text with buttons to start the quiz or access the dashboard           |
| Quiz              | 8 questions with a scoring system to evaluate digital overload              |
| Results           | Score feedback, save option, link to personalized recommendations           |
| Habit Tracker     | 14-day grid to add/remove habits and save to the database                   |
| Dashboard         | Editable name, email, last result, test history, access to tracker          |
| Feedback Form     | Sends feedback to the developer’s email using FormSubmit                    |

## Auth & Account

- Sign up and login via Supabase
- Protected dashboard
- Editable display name

## Getting Started

```bash
npm install
npm run dev
```

## License

This project was created as part of a diploma and is intended for educational and non-commercial purposes only.
No commercial use, distribution, or resale is allowed without permission from the author.
