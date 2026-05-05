import { useState, ChangeEvent, FormEvent, ReactNode } from "react";
import { FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AdminAuthLayout from "./AdminAuthLayout";
import { supabase } from "@lib/supabase";

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface AuthCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "default" | "large";
}

function AuthCard({
  title,
  children,
  footer,
  size = "default",
}: AuthCardProps) {
  const isLarge = size === "large";

  return (
    <section
      className={`fade-in-card w-full rounded-2xl bg-[#eff2e8f2] px-7 py-8 shadow-[0_22px_34px_-20px_rgba(23,85,30,0.65)] backdrop-blur-[1px] sm:px-10 sm:py-9 ${isLarge ? "max-w-lg" : "max-w-md"}`}
    >
      <div
        className={`mx-auto flex w-full flex-col items-center ${isLarge ? "max-w-sm" : "max-w-xs"}`}
      >
        <FaUserCircle className="text-5xl text-[#083813]" />
        <h1 className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1c2e23]">
          {title}
        </h1>

        <div className="mt-5 w-full">{children}</div>

        {footer ? (
          <div className="mt-4 text-center text-sm text-[#222]">{footer}</div>
        ) : null}
      </div>
    </section>
  );
}

interface InputFieldProps {
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
}

function InputField({
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  disabled,
}: InputFieldProps) {
  return (
    <div className="mb-3 w-full">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        className="w-full rounded-lg border border-transparent bg-[#d9ddd6] px-3 py-2 text-sm text-[#1f2d23] outline-none transition focus:border-[#1c5d2a]"
      />
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

interface PasswordFieldProps {
  name?: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
}

function PasswordField({
  name = "password",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  disabled,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3 w-full">
      <div className="flex items-center rounded-lg border border-transparent bg-[#d9ddd6] px-3 py-2 transition focus-within:border-[#1c5d2a]">
        <input
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-[#1f2d23] outline-none"
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          className="pl-2 text-[#244229]"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

const defaultValues: FormValues = {
  email: "",
  password: "",
};

const adminEmail =
  import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() ?? "admin@admin.com";

export default function AdminLoginPage() {
  const [form, setForm] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.password) nextErrors.password = "Password is required.";

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        setIsSubmitting(false);
        setSubmitError(error.message || "Unable to log in with Supabase.");
        return;
      }

      const userId = data.user?.id;
      const signedInEmail =
        data.user?.email?.trim().toLowerCase() ?? form.email.trim().toLowerCase();

      if (!userId) {
        setIsSubmitting(false);
        setSubmitError("Signed in, but no user record was returned.");
        return;
      }

      // If the admin auth user has no readable profile row yet, keep the
      // seeded admin account usable after Supabase validates the password.
      const isConfiguredAdmin = signedInEmail === adminEmail;

      try {
        if (isConfiguredAdmin) {
          const { error: upsertError } = await supabase.from("profiles").upsert({
            id: userId,
            email: signedInEmail,
            role: "admin",
          });

          if (upsertError) {
            console.error("Admin profile upsert error:", upsertError);
          }
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);

          if (isConfiguredAdmin) {
            navigate("/dashboard");
            setIsSubmitting(false);
            return;
          }

          setIsSubmitting(false);
          setSubmitError(
            "Unable to verify admin access. Please contact support.",
          );
          return;
        }

        if (profile?.role === "admin" || isConfiguredAdmin) {
          navigate("/dashboard");
          setIsSubmitting(false);
          return;
        }

        // Non-admin users should use rider login instead
        setIsSubmitting(false);
        setSubmitError(
          "This login is for admin users only. Please use the rider login.",
        );
        // Sign out the non-admin user
        await supabase.auth.signOut();
      } catch (err) {
        // If query fails due to RLS policy, reject access
        console.error("Auth check error:", err);
        setIsSubmitting(false);
        setSubmitError("Unable to verify admin access. Please try again.");
      }
    }
  };

  return (
    <AdminAuthLayout>
      <AuthCard title="WELCOME BACK ADMIN!" size="large">
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
            disabled={isSubmitting}
          />
          <PasswordField
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
            disabled={isSubmitting}
          />
          {submitError ? (
            <p className="mb-2 text-sm text-red-700">{submitError}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg bg-[#3f7f2f] px-4 py-2 text-base font-semibold text-white transition hover:bg-[#2f6422] disabled:opacity-50"
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </button>
        </form>
      </AuthCard>
    </AdminAuthLayout>
  );
}
