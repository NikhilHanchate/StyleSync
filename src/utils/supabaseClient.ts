import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn("Supabase URL or Anon Key is missing from client environment configurations.");
}

// A simple recursive Proxy that returns a resolved promise with { data: [], error: null } for any chained call.
const createMockSupabase = () => {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === "auth") {
        return {
          signInWithPassword: async () => ({ data: { user: null }, error: new Error("Supabase is not configured.") }),
          signUp: async () => ({ data: { user: null }, error: new Error("Supabase is not configured.") }),
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
        };
      }
      if (prop === "then") {
        return (resolve: any) => resolve({ data: [], error: null });
      }
      const dummyFunc = () => new Proxy({}, handler);
      return new Proxy(dummyFunc, handler);
    },
    apply(target, thisArg, argumentsList) {
      return new Proxy({}, handler);
    }
  };
  return new Proxy({}, handler) as any;
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabase();
