<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1DAb_QvhLJyThgqVRT8D19hV4GuRW6Qrg

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Bot ingest API

Repo ini sekarang punya endpoint serverless untuk menerima data lamaran dari bot tanpa Playwright:

- `GET /api/health`
- `POST /api/applications/ingest`

Payload minimal:

```json
{
  "secret": "TRACK_INGEST_SECRET",
  "company": "PT Contoh",
  "position": "Staff Legal",
  "location": "Surabaya",
  "platform": "Email",
  "job_url": "https://example.com/job",
  "status": "applied",
  "notes": "Dikirim via bot",
  "applied_at": "2026-04-23T12:00:00+07:00",
  "source": "manual",
  "email_type": "applied",
  "local_id": 146
}
```

Endpoint ini akan menulis ke collection Firestore `applications`, jadi dashboard frontend langsung membaca data yang sama seperti input manual.

### Environment variables Vercel

Tambahkan env berikut di Vercel:

- `TRACK_INGEST_SECRET`
- `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON`

Atau kalau tidak mau JSON penuh:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Client env Firebase untuk frontend tetap perlu:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
