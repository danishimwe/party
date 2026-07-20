# DJ Scorpion — Song Requests

A mobile-first song request page with a private DJ queue, built with Next.js and ready for Vercel.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values.
3. Start the app: `npm run dev`
4. Open `http://localhost:3000`. The DJ queue is at `/admin`.

## Deploy to Vercel

1. Push this project to GitHub and import it in Vercel.
2. Create or select an [Upstash Redis](https://console.upstash.com/) database.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `ADMIN_PASSWORD`
4. Redeploy, then share your Vercel URL or turn it into a QR code for the party.

Requests are kept in an Upstash Redis sorted set. The admin password is checked server-side and stored only in the DJ browser's session storage. The read-only token, `KV_URL`, and `REDIS_URL` are not required.

Guests see the numbered waiting list and the current track. From `/admin`, **Play next** promotes request #1 to the public now-playing display; **Stop & archive** removes it from public view and adds it to the private played history.
