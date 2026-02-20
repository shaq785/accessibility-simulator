import Link from "next/link";

export const metadata = {
  title: "Accessible Demo - Accessibility Simulator",
  description: "A demo page following accessibility best practices",
};

export default function GoodDemoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-800 text-white px-4 py-2 text-sm flex items-center justify-between">
        <span>Accessible Demo Page</span>
        <Link href="/simulator" className="text-blue-300 hover:text-blue-200 underline">Back to Simulator</Link>
      </div>
      
      <div className="p-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <nav aria-label="Main navigation" className="mb-6">
            <ul className="flex flex-wrap gap-4">
              {["Home", "Products", "About Us", "Contact"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Our Store</h1>
          <p className="text-lg text-slate-700">Discover quality products with excellent customer service.</p>
        </header>

        <section aria-labelledby="products-heading" className="mb-8">
          <h2 id="products-heading" className="text-xl font-semibold text-slate-900 mb-4">Featured Product</h2>
          <article className="border-2 border-slate-200 rounded-lg p-6 bg-slate-50">
            <div className="w-full h-32 bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-slate-500">[Product Image]</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Premium Widget</h3>
            <p className="text-slate-700 mb-4">High-quality widget designed for durability and performance. Perfect for everyday use with a 2-year warranty included.</p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">Add to Cart</button>
              <button className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">Save for Later</button>
            </div>
          </article>
        </section>

        <section aria-labelledby="contact-heading" className="mb-8">
          <h2 id="contact-heading" className="text-xl font-semibold text-slate-900 mb-4">Contact Us</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="good-name" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input type="text" id="good-name" required className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900" placeholder="Enter your full name" />
            </div>
            <div>
              <label htmlFor="good-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input type="email" id="good-email" required className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900" placeholder="your.email@example.com" />
            </div>
            <div>
              <label htmlFor="good-message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea id="good-message" rows={4} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 resize-y" placeholder="How can we help you?" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">Send Message</button>
          </form>
        </section>

        <section aria-labelledby="status-heading">
          <h2 id="status-heading" className="text-xl font-semibold text-slate-900 mb-4">Order Status</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>Order Confirmed</span>
            </li>
            <li className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>Payment Received</span>
            </li>
            <li className="flex items-center gap-2 text-yellow-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              <span>Shipping in Progress</span>
            </li>
            <li className="flex items-center gap-2 text-slate-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" /></svg>
              <span>Delivery Pending</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
