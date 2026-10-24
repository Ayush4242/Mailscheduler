
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-green-100 bg-[#fffdf7]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl">🌱</span>
          <span className="text-2xl font-extrabold tracking-tight text-green-900">
            GreenGrow
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-green-700">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-green-700">
            How it works
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-full px-4 py-2 font-semibold text-green-800 hover:bg-green-50 sm:block"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
