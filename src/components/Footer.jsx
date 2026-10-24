
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-green-950 px-6 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <Link to="/" className="text-xl font-extrabold">
          🌱 GreenGrow
        </Link>

        <p className="text-sm text-green-100/75">
          Growing a greener future, one farm at a time.
        </p>

        <p className="text-sm text-green-100/60">
          © {new Date().getFullYear()} GreenGrow
        </p>
      </div>
    </footer>
  );
}
