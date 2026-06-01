# NaxaStudio Backend

Node.js + Express + MongoDB backend for the NaxaStudio/NexaStudio website contact form.

Production backend URL:

```text
https://naxastudio-backend.onrender.com
```

GitHub repository:

```text
https://github.com/techanshu777-av/naxastudio-backend
```

## Features

- Serves the static frontend from `public/`
- Contact API built with Node.js and Express
- Contact submissions stored in MongoDB
- Ready for Render backend deployment
- Ready for Netlify frontend deployment

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set your MongoDB connection:

```env
APP_NAME=NaxaStudioBackend
APP_ENV=development
APP_DEBUG=true
PORT=5001
APP_URL=https://naxastudio-backend.onrender.com
API_BASE_URL=https://naxastudio-backend.onrender.com
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=nexastudio
```

3. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

Open locally:

```text
http://localhost:5001
```

## Render Deployment

Upload/deploy the full backend repository to Render:

```text
backend/
public/
Dockerfile
.dockerignore
package.json
package-lock.json
render.yaml
.env.example
```

Render settings for Node runtime:

```text
Build command: npm install
Start command: node backend/server.js
```

Render settings for Docker runtime:

```text
Dockerfile path: Dockerfile
```

Set these environment variables in Render:

```env
NODE_ENV=production
APP_URL=https://naxastudio-backend.onrender.com
API_BASE_URL=https://naxastudio-backend.onrender.com
MONGODB_URI=your_mongodb_atlas_connection_string
# Or use DATABASE_URL instead of MONGODB_URI if your host provides that name.
MONGODB_DB=nexastudio
ADMIN_API_KEY=your_private_admin_key_optional
```

Do not manually set `PORT` on Render. Render provides it automatically, and the server already uses `process.env.PORT`.

## Netlify Frontend

Netlify should publish:

```text
public
```

`netlify.toml` is already configured:

```toml
[build]
  publish = "public"

[[redirects]]
  from = "/api/*"
  to = "https://naxastudio-backend.onrender.com/api/:splat"
  status = 200
```

The contact form posts to same-origin `/api/contact`. On Render this is handled by the backend directly; on Netlify, `netlify.toml` proxies `/api/*` to Render.

```text
/api/contact
```

## API Endpoints

### GET `/api/health`

Returns API health status.

### POST `/api/contact`

Accepts contact form submissions.

Request body:

```json
{
  "name": "Ansh",
  "email": "ansh@example.com",
  "phone": "+91 9876543210",
  "service": "Business Website",
  "budget": "₹10,000 - ₹20,000",
  "message": "I need a website for my shop."
}
```

Response:

```json
{
  "success": true,
  "message": "Thank you. Your message has been saved and we will contact you soon.",
  "id": "..."
}
```

### GET `/api/contact`

Returns the latest 25 contact submissions only when `ADMIN_API_KEY` is configured and the request includes the matching `x-admin-key` header. Without the key, this endpoint returns 404.

## File Structure

```text
.
├── backend
│   ├── config
│   │   ├── database.js
│   │   └── env.js
│   ├── models
│   │   └── contactModel.js
│   ├── routes
│   │   └── contactRoutes.js
│   └── server.js
├── public
│   ├── assets
│   └── index.html
├── .env.example
├── netlify.toml
├── package.json
├── package-lock.json
├── render.yaml
└── README.md
```
