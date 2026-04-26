# NexaStudio — Freelance Website (Frontend + Backend Contact Form)

## What you get
- Your original NexaStudio UI (moved into `public/index.html`)
- CSS extracted to `public/assets/css/styles.css`
- JS extracted to `public/assets/js/main.js`
- A working backend endpoint: `POST /api/contact`

## Run locally
1) Install Node.js (LTS)
2) In this folder:

```bash
npm install
npm run dev
```

Open: http://localhost:3000

## Make the contact form send emails
Copy `.env.example` to `.env` and fill SMTP settings.

Notes
- For Gmail you must use an App Password (not your normal password).
- If SMTP is not set, messages are still accepted and logged in the server console.

## Deploy
Works on Render, Railway, Fly.io, or any Node hosting.

## Customize
- Change WhatsApp link in `public/index.html` (replace `91XXXXXXXXXX`)
- Change brand name/text sections
