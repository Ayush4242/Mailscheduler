
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8ef] px-5 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-green-900/5 sm:p-10">
        <Link to="/" className="text-xl font-extrabold text-green-900">
          🌱 GreenGrow
        </Link>

        <h1 className="mt-8 text-3xl font-black text-green-950">
          Welcome back!
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Your greener journey is waiting for you.
        </p>

        <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-gray-700">
              Email address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-700 py-3.5 font-bold text-white transition hover:bg-green-800"
          >
            Log in →
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to GreenGrow?{" "}
          <Link to="/signup" className="font-bold text-green-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
