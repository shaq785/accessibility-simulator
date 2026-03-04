export function BadDemoContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Stuff</h2>
      <p className="text-gray-700 mb-4">
        This is a really long paragraph that goes on and on without giving a clear answer at the start so that if someone or some system is trying to figure out what this page is about they have to read through a lot of text before they get to anything useful and that is bad for answer engines because they prefer to find a concise summary or definition right at the beginning of the content so they can show it in search results or voice answers. We are also not using any bullet points or lists to break things up which makes it harder to scan and extract key points. There is no FAQ section and no structured data so the page looks like a wall of text with no clear structure for machines to understand.
      </p>
      <p className="text-gray-700 mb-4">
        Another long paragraph that continues the same pattern of not having a clear introductory sentence that answers a specific question. We skip from H2 to H4 which breaks heading hierarchy and we have multiple headings that are vague. There is no author or date information and no contact or about links in the footer. The links we do have say things like click here and read more which are not descriptive. Images if we had any would not have alt text. Overall this page is not optimized for answer engines to parse and use.
      </p>
      <h4 className="text-lg font-bold text-gray-900 mt-6 mb-3">More stuff</h4>
      <p className="text-gray-700 mb-4">
        Yet another block of text with no clear structure. No JSON-LD. No FAQ. No Organization or WebSite schema. No meta description. Title is just &ldquo;Page&rdquo; which is not descriptive. This demonstrates what not to do when you want your content to be easily understood by systems that try to extract answers for users.
      </p>
      <p className="text-gray-700 mb-4">
        <a href="#" className="text-indigo-600 hover:underline">click here</a> to see more. Or <a href="#" className="text-indigo-600 hover:underline">read more</a> about our site. We have no about page link and no contact link with descriptive text.
      </p>
      <footer className="mt-8 pt-4 border-t border-gray-200 text-gray-500 text-sm">
        © 2026
      </footer>
    </div>
  );
}
