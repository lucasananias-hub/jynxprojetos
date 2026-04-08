import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Environment variables
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ---------------------------------------------------------------------------
// Browser / client-side client (uses the anon key, safe to expose)
// ---------------------------------------------------------------------------
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Server-side admin client (uses the service-role key – NEVER expose to the
// browser). Useful for AI pipelines, webhooks, and other trusted server code.
// ---------------------------------------------------------------------------
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// ---------------------------------------------------------------------------
// Server-side helper – creates a one-off Supabase client for use in server
// components / route handlers (pairs well with @supabase/ssr middleware).
// ---------------------------------------------------------------------------
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/** Return the current session (or null). */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error.message);
    return null;
  }

  return session;
}

/** Return the current authenticated user (or null). */
export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  return user;
}
