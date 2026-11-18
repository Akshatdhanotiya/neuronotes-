const supabase = require("../db/supabase");

// Supabase-backed History helper (keeps same .create() API as before)
const History = {
  create: async ({ userId, input, summary, language }) => {
    const { data, error } = await supabase
      .from("history")
      .insert({ user_id: userId || "guest", input, summary, language })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

module.exports = History;