
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="overflow-hidden bg-[#fffdf7]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
            🌍 Grow better. Live greener.
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-green-950 md:text-6xl">
            Small steps.
            <br />
            <span className="text-green-600">Greener farms.</span>
            <br />
            Better future.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
            Learn sustainable farming, take on fun challenges, earn rewards,
            and make every step toward a healthier planet count.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="rounded-full bg-green-700 px-7 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-green-800"
            >
              Start growing free →
            </Link>

            <a
              href="#features"
              className="rounded-full border border-green-200 px-7 py-3.5 font-bold text-green-900 transition hover:bg-green-50"
            >
              Explore features
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <span>✓ Learn at your pace</span>
            <span>✓ Earn achievement badges</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[3rem] bg-green-100/70 blur-2xl" />
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85"
            alt="Green fields and a peaceful agricultural landscape"
            className="relative h-[360px] w-full rounded-[2rem] object-cover shadow-xl md:h-[480px]"
          />

          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
            <p className="text-sm text-gray-500">Your journey starts here</p>
            <p className="mt-1 font-bold text-green-900">
              🌱 One action at a time
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
