import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { supabase } from "@lib/supabase";

type AuthState = "checking" | "allowed" | "denied";

const adminEmail =
  import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() ?? "admin@admin.com";

export default function AdminLayout() {
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      const email = user?.email?.trim().toLowerCase() ?? "";
      const isConfiguredAdmin = Boolean(user?.id && email === adminEmail);

      if (!user?.id) {
        if (isMounted) setAuthState("denied");
        return;
      }

      if (isConfiguredAdmin) {
        const { error: upsertError } = await supabase.from("profiles").upsert({
          id: user.id,
          email,
          role: "admin",
        });

        if (upsertError) {
          console.error("Admin profile upsert error:", upsertError);
        }
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Admin profile check error:", error);
      }

      if (isMounted) {
        setAuthState(profile?.role === "admin" || isConfiguredAdmin ? "allowed" : "denied");
      }
    };

    void verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState === "checking") {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-light text-sm font-semibold text-gray-700">
        Checking admin session...
      </div>
    );
  }

  if (authState === "denied") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-bg-light flex-col">
      <AdminNavbar />
      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
