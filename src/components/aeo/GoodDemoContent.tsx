export function GoodDemoContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">What is Compost?</h1>
      <p className="text-lg text-gray-700 mb-6">
        Compost is decayed organic matter—such as leaves, food scraps, and yard waste—that is used to enrich soil and improve plant growth. It is often called &ldquo;black gold&rdquo; because it adds nutrients and improves soil structure, helping gardens thrive without chemical fertilizers.
      </p>
      <p className="text-gray-700 mb-6">
        Composting also reduces landfill waste and cuts greenhouse gas emissions. In a 2023 survey, 32% of gardeners reported better soil quality within one season. These practices help both your garden and the environment.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Benefits of Composting</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
        <li>Reduces landfill waste and greenhouse gases.</li>
        <li>Improves soil structure and water retention.</li>
        <li>Provides nutrients for plants without synthetic fertilizers.</li>
      </ul>

      <h2 id="how-to-start" className="text-xl font-semibold text-gray-900 mt-8 mb-3">How to Start Composting</h2>
      <p className="text-gray-700 mb-4">
        Start with a bin or a pile in a dry, shaded spot. Add browns (leaves, paper) and greens (kitchen scraps, grass). Keep it moist and turn it occasionally. In a few months you&rsquo;ll have rich compost.
      </p>

      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>
      <dl className="space-y-4">
        <div>
          <dt className="font-semibold text-gray-900">What can I put in compost?</dt>
          <dd className="text-gray-700 mt-1">You can add fruit and vegetable scraps, coffee grounds, eggshells, leaves, grass clippings, and small amounts of paper. Avoid meat, dairy, and oily foods.</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-900">How long does composting take?</dt>
          <dd className="text-gray-700 mt-1">A simple pile may take 6 months to 2 years. With proper turning and moisture, hot compost can be ready in a few weeks to a few months.</dd>
        </div>
        <div>
          <dt className="font-semibold text-gray-900">Do I need a bin to compost?</dt>
          <dd className="text-gray-700 mt-1">No. You can use a simple pile, a wire bin, or a purchased compost bin. Choose based on space and how much material you have.</dd>
        </div>
      </dl>

      <footer className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600">
        <p className="mb-2">GreenLife — Helping you grow sustainably.</p>
        <nav aria-label="Footer">
          <a id="about" href="#about" className="text-indigo-600 hover:underline mr-4">About GreenLife</a>
          <a id="contact" href="#contact" className="text-indigo-600 hover:underline mr-4">Contact us</a>
          <a href="#how-to-start" className="text-indigo-600 hover:underline">Composting guide</a>
        </nav>
      </footer>
    </div>
  );
}
