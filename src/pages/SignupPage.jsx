
import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
        /\/+$/,
        ""
      );
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create account.");
      }

      setFeedback({
        type: "success",
        message: result.message || "Account created successfully. You can now log in.",
      });
      form.reset();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof TypeError
            ? "Could not connect to the server. Please try again."
            : error.message || "Unable to create account. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8ef] px-5 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-green-900/5 sm:p-10">
        <Link to="/" className="text-xl font-extrabold text-green-900">
          🌱 GreenGrow
        </Link>

        <h1 className="mt-8 text-3xl font-black text-green-950">
          Start growing with us
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Create your account and take the first step toward greener farming.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-gray-700">
              Email address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              placeholder="At least 8 characters"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {feedback.message && (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className={`text-sm ${
                feedback.type === "error" ? "text-red-700" : "text-green-700"
              }`}
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-green-700 py-3.5 font-bold text-white transition hover:bg-green-800"
          >
            {isSubmitting ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-green-700 hover:underline">
            Log in
          </Link>
        </p>

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          By creating an account, you agree to our terms and privacy policy.
        </p>
      </div>
    </main>
  );
}
