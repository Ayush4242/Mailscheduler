
const features = [
  {
    icon: "📚",
    title: "Learn by doing",
    description:
      "Explore practical lessons and quizzes that make sustainable farming easier to understand.",
    color: "bg-amber-50",
  },
  {
    icon: "🏆",
    title: "Earn as you grow",
    description:
      "Complete challenges, collect points, unlock badges, and celebrate your progress.",
    color: "bg-green-50",
  },
  {
    icon: "💧",
    title: "Track your impact",
    description:
      "Record water conservation, composting, and other sustainable farming activities.",
    color: "bg-sky-50",
  },
  {
    icon: "🌾",
    title: "Make smarter choices",
    description:
      "Discover data-driven farming suggestions designed to support better decisions.",
    color: "bg-orange-50",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-6 py-20 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-bold uppercase tracking-[0.2em] text-green-700">
            Everything in one place
          </p>
          <h2 className="mt-3 text-3xl font-black text-green-950 md:text-4xl">
            A little progress goes a long way
          </h2>
          <p className="mt-4 leading-7 text-gray-600">
            Build better farming habits through learning, action, and rewards.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${feature.color}`}
              >
                {feature.icon}
              </div>

              <h3 className="mt-5 text-xl font-bold text-green-950">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
