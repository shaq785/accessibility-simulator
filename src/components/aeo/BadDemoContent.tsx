export function BadDemoContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Stuff</h2>
      <p className="text-gray-700 mb-4">
        This is a really long paragraph that goes on and on without giving a clear answer at the start so that if someone or some system is trying to figure out what this page is about they have to read through a lot of text before they get to anything useful and that is bad for answer engines because they prefer to find a concise summary or definition right at the beginning of the content so they can show it in search results or voice answers. We are also not using any bullet points or lists to break things up which makes it harder to scan and extract key points. There is no FAQ section and no structured data so the page looks like a wall of text with no clear structure for machines to understand.
      </p>
      <p className="text-gray-700 mb-4">
        Another long paragraph that continues the same pattern. We skip from H2 to H4 which breaks heading hierarchy. There is no author or date and no contact or about links. The links we do have say things like <a href="#" className="text-indigo-600 hover:underline">click here</a> and <a href="#" className="text-indigo-600 hover:underline">read more</a> which are not descriptive. No JSON-LD, no FAQ, no Organization schema. Title is just &ldquo;Page&rdquo;. This demonstrates what not to do for AEO.
      </p>
      <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3">More stuff</h4>
      <footer className="mt-8 pt-4 border-t border-gray-200 text-gray-500 text-sm">
        © 2026
      </footer>
    </div>
  );
}
