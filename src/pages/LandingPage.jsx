
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />

        <section
          id="how-it-works"
          className="bg-green-50 px-6 py-20 text-center"
        >
          <div className="mx-auto max-w-3xl">
            <span className="text-4xl">🌍</span>
            <h2 className="mt-4 text-3xl font-black text-green-950">
              Better habits. Healthier farms.
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Start learning, put sustainable ideas into practice, and
              celebrate every step forward.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
