import React, { useState } from 'react';

export default function SchemaJsonLdGenerator() {
  const [schemaType, setSchemaType] = useState('Article');
  const [copied, setCopied] = useState(false);

  // Article State
  const [headline, setHeadline] = useState('How Autonomous AI Agents Are Transforming Marketing Operations');
  const [articleUrl, setArticleUrl] = useState('https://example.com/blog/autonomous-ai-marketing');
  const [authorName, setAuthorName] = useState('Sarah Jenkins');
  const [publisherName, setPublisherName] = useState('Vimz.ai');
  const [publishDate, setPublishDate] = useState('2026-03-15');
  const [imageUrl, setImageUrl] = useState('https://example.com/images/hero-cover.jpg');

  // FAQ State
  const [faqs, setFaqs] = useState([
    { q: 'What is an autonomous AI agent?', a: 'An AI agent is a software system capable of perceiving its environment, reasoning over multi-step workflows, and executing actions autonomously to achieve specific goals.' },
    { q: 'How does this improve team productivity?', a: 'It automates repetitive mechanical tasks, allowing human domain experts to focus 100% on strategic decisions.' }
  ]);

  // Product State
  const [prodName, setProdName] = useState('Vimz.ai Pro Subscription');
  const [prodPrice, setProdPrice] = useState('49.00');
  const [prodCurrency, setProdCurrency] = useState('USD');
  const [prodRating, setProdRating] = useState('4.9');
  const [prodReviewCount, setProdReviewCount] = useState('128');

  const generateSchema = () => {let schemaObj = {};

    if (schemaType === 'Article') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: headline,
        image: imageUrl,
        author: {
          '@type': 'Person',
          name: authorName
        },
        publisher: {
          '@type': 'Organization',
          name: publisherName,
          logo: {
            '@type': 'ImageObject',
            url: 'https://example.com/logo.png'
          }
        },
        datePublished: publishDate,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl
        }
      };
    } else if (schemaType === 'FAQPage') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a
          }
        }))
      };
    } else if (schemaType === 'Product') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: prodName,
        image: imageUrl,
        offers: {
          '@type': 'Offer',
          priceCurrency: prodCurrency,
          price: prodPrice,
          availability: 'https://schema.org/InStock'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: prodRating,
          reviewCount: prodReviewCount
        }
      };
    }

    return JSON.stringify(schemaObj, null, 2);
  };

  const scriptTagOutput = `<script type="application/ld+json">\n${generateSchema()}\n</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTagOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🛡️ Google Rich Snippets
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Google Schema JSON-LD Rich Snippet Generator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate structured schema markup verified against Schema.org and Google Search Central guidelines for higher CTR search snippets.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied  ? '✓' : '💻'}
            {copied ? 'Copied JSON-LD!' : 'Copy Script Tag'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schema Configuration */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Schema Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Article', 'FAQPage', 'Product'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSchemaType(type)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      schemaType === type
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {schemaType === 'Article' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Article Headline</label>
                  <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Author Name</label>
                  <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Canonical URL</label>
                  <input type="text" value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
              </div>
            )}

            {schemaType === 'FAQPage' && (
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => {
                        const newF = [...faqs];
                        newF[i].q = e.target.value;
                        setFaqs(newF);
                      }}
                      placeholder="Question..."
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                    />
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => {
                        const newF = [...faqs];
                        newF[i].a = e.target.value;
                        setFaqs(newF);
                      }}
                      placeholder="Answer..."
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs resize-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {schemaType === 'Product' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Product Name</label>
                  <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Price</label>
                    <input type="text" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Rating (1-5)</label>
                    <input type="text" value={prodRating} onChange={(e) => setProdRating(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Code */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              JSON-LD Code Output
            </h3>
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-amber-300 leading-relaxed overflow-x-auto min-h-[300px]">
              <pre>{scriptTagOutput}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
