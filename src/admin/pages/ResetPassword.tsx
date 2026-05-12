import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setErrorMessage("Session error. Please try again.");
          setHasToken(false);
        } else if (data.session) {
          setHasToken(true);
        } else {
          setErrorMessage(
            "Invalid or expired reset link. Please request a new password reset.",
          );
          setHasToken(false);
        }
      } catch (err) {
        setErrorMessage("Failed to verify session.");
        setHasToken(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword.trim()) {
      setErrorMessage("Password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage(
          "Password updated successfully! Redirecting to login...",
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setErrorMessage("Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-gray-700 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Reset Password
        </h1>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-semibold">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-semibold">
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                className="text-xs font-semibold text-green-700 hover:text-green-800"
                aria-pressed={showPasswords}
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
              >
                {showPasswords ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPasswords ? "text" : "password"}
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewPassword(e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-green-600 hover:text-green-700 font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
