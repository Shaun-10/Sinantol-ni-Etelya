import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      error:
        "Supabase service role configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  const { userId, newPassword } = req.body || {};

  if (
    !userId ||
    typeof newPassword !== "string" ||
    newPassword.trim().length === 0
  ) {
    return res.status(400).json({
      error: "Missing userId or newPassword in request body.",
    });
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword.trim(),
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
