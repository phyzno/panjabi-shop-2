# Punjabi Shop — agent context

Use **`PROJECT_DOCS.md`** for architecture, schema, and env vars. Use **`GEMINI.md`** for stack and folder layout.

**Supabase:** Public reads (`getProducts`) use the anon key. Admin mutations require **`SUPABASE_SERVICE_ROLE_KEY`** on the server (see `utils/supabase/service.ts`). Seed sample catalog data with `npm run seed` after adding that key to `.env.local`.
