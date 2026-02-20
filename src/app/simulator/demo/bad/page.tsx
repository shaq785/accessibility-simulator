import Link from "next/link";

export const metadata = {
  title: "Inaccessible Demo - Accessibility Simulator",
  description: "A demo page with common accessibility issues",
};

export default function BadDemoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-800 text-white px-4 py-2 text-sm flex items-center justify-between">
        <span>Inaccessible Demo Page (Intentionally Flawed)</span>
        <Link href="/simulator" className="text-blue-300 hover:text-blue-200 underline">Back to Simulator</Link>
      </div>
      
      <div className="p-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <nav className="mb-6">
            <div className="flex flex-wrap gap-4">
              <span className="text-blue-500 cursor-pointer">Home</span>
              <span className="text-blue-500 cursor-pointer">Products</span>
              <span className="text-blue-500 cursor-pointer">About Us</span>
              <span className="text-blue-500 cursor-pointer">Contact</span>
            </div>
          </nav>
          <div className="text-2xl text-gray-400 mb-2 animate-pulse-demo">Welcome to Our Store</div>
          <p className="text-sm text-gray-300" style={{ fontSize: "12px" }}>Discover quality products with excellent customer service.</p>
        </header>

        <section className="mb-8">
          <div className="text-lg text-gray-500 mb-4">Featured Product</div>
          <div className="border border-gray-100 rounded-lg p-4" style={{ height: "280px", overflow: "hidden" }}>
            <div className="w-full h-24 bg-gray-100 rounded mb-3 flex items-center justify-center animate-slide-demo">
              <span className="text-gray-300">[Image]</span>
            </div>
            <div className="text-base text-gray-700 mb-2 font-bold">Premium Widget</div>
            <p className="text-gray-400 mb-3" style={{ fontSize: "13px", lineHeight: "1.2" }}>High-quality widget designed for durability and performance. Perfect for everyday use with a 2-year warranty included. This is extra text that might get cut off.</p>
            <div className="flex gap-2">
              <button className="bg-green-500 text-white px-3 py-1 rounded text-sm outline-none">Confirm</button>
              <button className="bg-red-500 text-white px-3 py-1 rounded text-sm outline-none">Delete</button>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="text-lg text-gray-500 mb-4">Contact Us</div>
          <form className="space-y-3">
            <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-900 outline-none" placeholder="Name" style={{ fontSize: "12px" }} />
            <input type="email" className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-900 outline-none" placeholder="Email" style={{ fontSize: "12px" }} />
            <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-900 outline-none" placeholder="Message" style={{ fontSize: "12px", resize: "none" }} />
            <button type="submit" className="bg-gray-200 text-gray-400 px-4 py-1.5 rounded text-sm outline-none">Submit</button>
          </form>
        </section>

        <section>
          <div className="text-lg text-gray-500 mb-4">Order Status</div>
          <ul className="space-y-1 text-sm">
            <li className="text-green-500">Order Confirmed</li>
            <li className="text-green-500">Payment Received</li>
            <li className="text-yellow-500">Shipping</li>
            <li className="text-gray-300">Delivery</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
