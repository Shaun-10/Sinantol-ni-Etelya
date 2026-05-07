import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@lib/supabase";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

type AuthState = "checking" | "allowed" | "denied";

const adminEmail =
  import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() ?? "admin@admin.com";

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void verifyAdmin();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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
    return <Navigate to="/login" replace state={{ message: "Please log in to continue." }} />;
  }

  return <>{children}</>;
}