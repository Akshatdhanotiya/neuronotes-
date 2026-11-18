const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

let supabase;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (url && key && !url.includes("your-project-id")) {
  try {
    supabase = createClient(url, key, {
      auth: { persistSession: false },
      realtime: { transport: ws },
    });
  } catch (err) {
    console.error("[Supabase Init Error]", err.message);
  }
}

if (!supabase) {
  console.warn("⚠️ SUPABASE_URL / SUPABASE_SERVICE_KEY is missing or placeholder. Running in guest/mock database mode.");
  
  // Create resilient mock chain so app runs smoothly in guest mode
  const createMockChain = () => {
    const chain = {
      select: () => chain,
      insert: () => chain,
      update: () => chain,
      delete: () => chain,
      eq: () => chain,
      neq: () => chain,
      order: () => chain,
      limit: () => chain,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve) => Promise.resolve(resolve({ data: [], error: null, count: 0 })),
      catch: (reject) => chain,
    };
    return chain;
  };

  supabase = {
    from: () => createMockChain(),
    auth: {
      admin: {
        getUserById: async () => ({ data: null, error: null }),
      },
    },
  };
}

module.exports = supabase;
