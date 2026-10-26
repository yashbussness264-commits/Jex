# AI Creator Studio

Android-first app (Expo / React Native) with a Node backend.
- Auth, email verification, password reset: Supabase Auth (real, not simulated)
- Project storage: Supabase Postgres with Row Level Security + server-side ownership checks
- AI generation: Anthropic API, called only from the backend (key never reaches the phone)

## Setup order

1. Supabase (https://supabase.com)
   - Create a project.
   - Authentication > Providers > Email: enabled. Keep "Confirm email" ON.
   - Authentication > URL Configuration: set Site URL and add a redirect URL for password reset (for example aicreatorstudio://reset-password). Deep-link handling in the app is NOT implemented yet.
   - SQL Editor: run backend/supabase-schema.sql.
   - Copy the Project URL, the anon key (mobile app) and the service_role key (backend ONLY, never ship it in the app).
2. Anthropic: create an API key at console.anthropic.com. Put it in backend/.env only.
3. Backend:
   cd backend && cp .env.example .env && (fill in values) && npm install && npm start
   Deploy it to any Node host (Render, Railway, Cloud Run, Fly.io) and note the HTTPS URL.
4. Mobile:
   cd mobile && cp .env.example .env && (fill in values, including EXPO_PUBLIC_API_URL)
   npm install && npx expo install --fix && npx expo start
   Press "a" to open on an Android emulator. On the emulator, localhost is 10.0.2.2, so use http://10.0.2.2:8080 for a local backend.
5. Release build: npx eas build -p android --profile preview

## Security notes
- The Supabase anon key in the app is public by design; RLS protects data.
- The service_role key and ANTHROPIC_API_KEY exist only on the backend.
- Every project route derives the user from a verified Supabase JWT and filters by that user id.
- Tighten CORS and add rate limiting (for example express-rate-limit) before production.
