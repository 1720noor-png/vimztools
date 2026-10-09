import React, { useState } from 'react';

export default function ContentRepurposingMatrix() {
  const [sourceText, setSourceText] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('authoritative');
  const [activeTab, setActiveTab] = useState('twitter');
  const [copied, setCopied] = useState('');

  const sampleSource = `Artificial Intelligence in 2026 is no longer just about generating text or answering questions; it has shifted toward autonomous, agentic workflows. 

Modern high-performing teams don't use AI to write generic emails—they use AI agents to orchestrate multi-step data analysis, automate CRM follow-ups, synthesize user research into product tickets, and optimize ad campaigns in real time. 

The competitive moat of tomorrow is not having access to the best LLM model, because foundational models are rapidly becoming commoditized. The true moat is proprietary data, specialized workflow orchestration, and human domain experts who know how to direct and verify AI agent outputs with precision. 

To win in this landscape, companies must:
1. Build robust data ingestion pipelines that clean and index domain-specific knowledge.
2. Automate repetitive 80% tasks so top talent focuses solely on high-leverage 20% strategic decisions.
3. Establish continuous evaluation benchmarks to catch AI hallucinations before they reach end customers.`;

  const generateFormats = () => {
    const raw = sourceText.trim() || sampleSource;
    const cleanTopic = topic.trim() || 'Autonomous AI Workflows & The Future of Work';
    
    // Twitter / X Thread
    const twitterThread = [
      `🧵 1/6 The AI landscape just underwent a massive paradigm shift.\n\nIt's no longer about prompting chatbots. It's about autonomous agentic orchestration.\n\nHere is how top 1% operators are building a competitive moat right now ⬇️`,
      `2/6 Foundational AI models are rapidly becoming commoditized.\n\nHaving access to GPT or Claude is table stakes. Your true moat isn't the model—it's:\n• Proprietary domain data\n• Specialized multi-step workflows\n• Expert verification loops`,
      `3/6 What high-performing teams are actually doing:\n\n❌ Using AI for generic blog posts\n✅ Deploying AI agents to run data analysis, update CRMs, and diagnose conversion drop-offs in real time.`,
      `4/6 The 80/20 Rule of AI Implementation:\n\nAutomate the repetitive 80% of pipeline tasks completely. Free your top operators so they spend 100% of their mental bandwidth on the 20% high-leverage strategic decisions.`,
      `5/6 The unspoken risk: Hallucinations.\n\nWithout rigorous evaluation benchmarks and domain-grounded context, agentic loops can compound errors. Quality control is the new security perimeter.`,
      `6/6 Summary checklist:\n1. Build proprietary clean data pipelines\n2. Shift from chatbots to multi-agent workflows\n3. Implement automated eval benchmarks\n\nIf you found this valuable, bookmark & repost to share with your team! 🚀`
    ];

    // LinkedIn Authority Carousel / Post
    const linkedInPost = `Most companies are using AI completely backwards in 2026. 📉\n\nThey're still asking chatbots to draft generic emails while their competitors are deploying autonomous AI agents that run entire workflow loops.\n\nHere is what separates top performers from the rest regarding "${cleanTopic}":\n\n💡 1. Foundational Models are Commoditized\nHaving an API key isn't a moat. The true competitive advantage lies in proprietary data, domain context, and bespoke agent orchestration.\n\n⚡ 2. The 80/20 Automation Shift\nHigh-velocity organizations automate the repetitive 80% of operational tasks—allowing human talent to direct, verify, and execute high-leverage strategic moves.\n\n🛡️ 3. Verification & Benchmark Guardrails\nAgentic workflows compound results—both good and bad. The most critical infrastructure you can build today is rigorous evaluation benchmarks.\n\n---\n💬 How is your organization currently evolving from basic prompts to autonomous agentic workflows?\n\n#ArtificialIntelligence #Operations #Leadership #FutureOfWork #Productivity`;

    // Short-Form Reels / TikTok Video Script
    const videoScript = `🎬 HOOK (0-3s): [Fast zoom-in, pointing at screen]\n"If your team is still just using AI to write emails, you are falling dangerously behind. Here's why."\n\n💥 THE PROBLEM (3-12s): [On-screen text: 'The AI Moat Has Shifted']\n"Foundational models are basically commodities now. Anyone can use them. Having access to an AI model is no longer your superpower."\n\n🚀 THE SOLUTION (12-35s): [Cut to screen recording / workflow visual]\n"The real winners are building autonomous agent workflows on top of proprietary data. \nStep 1: Ingest your clean internal data.\nStep 2: Automate the boring 80% tasks.\nStep 3: Keep domain experts in the loop for final verification."\n\n🎯 CALL TO ACTION (35-45s): [Direct to camera]\n"Save this video right now and audit where your team can replace manual steps with agentic loops today!"`;

    // Instagram Carousel Slide Outline
    const instagramCarousel = [
      `Slide 1 (Cover): The 2026 AI Moat Is NOT What You Think ⚡ (Swipe Left 👉)`,
      `Slide 2: 🛑 The Mistake: Thinking better prompt engineering will save you when foundational models are commoditized.`,
      `Slide 3: 💎 The Real Moat: Proprietary Data + Tailored Workflow Orchestration.`,
      `Slide 4: ⚙️ The Formula: Automate 80% of mechanical tasks so humans only touch high-leverage decisions.`,
      `Slide 5: 🛡️ The Guardrail: Implement evaluation benchmarks before shipping agentic outputs.`,
      `Slide 6 (CTA): Save this guide for your next strategy meeting & follow for more tactical breakdowns!`
    ];

    // Executive Newsletter Section
    const newsletterSnippet = `Subject: The new competitive moat in ${cleanTopic}\n\nHey reader,\n\nThere's a critical shift happening across the industry right now.\n\nFor the past two years, organizations focused on "AI adoption"—getting teams to use chatbots. Today, foundational models are commoditized. The true winners are those shifting toward autonomous agentic workflows grounded in proprietary data.\n\nHere are 3 strategic takeaways for your executive sync:\n• Automate the mechanical 80%: Let agentic workflows handle data collation and triage.\n• Keep human expertise at the leverage point: Domain experts must direct and verify outputs.\n• Build evaluation guardrails: Never deploy agentic loops without automated benchmark checks.\n\nHow is your team evolving its tech stack this quarter? Hit reply and let me know.\n\nBest,\nYour Name`;

    return {
      twitter: twitterThread.join('\n\n---\n\n'),
      linkedin: linkedInPost,
      reels: videoScript,
      instagram: instagramCarousel.join('\n\n'),
      newsletter: newsletterSnippet
    };
  };

  const results = generateFormats();

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleDownloadAll = () => {
    const combined = `=== VIMZ.AI CONTENT REPURPOSING MATRIX ===\nTopic: ${topic || 'Main Topic'}\nTone: ${tone}\n\n` +
      `----------------------------------------\n1. X / TWITTER THREAD\n----------------------------------------\n${results.twitter}\n\n` +
      `----------------------------------------\n2. LINKEDIN THOUGHT LEADERSHIP POST\n----------------------------------------\n${results.linkedin}\n\n` +
      `----------------------------------------\n3. SHORT-FORM VIDEO SCRIPT (REELS/TIKTOK)\n----------------------------------------\n${results.reels}\n\n` +
      `----------------------------------------\n4. INSTAGRAM CAROUSEL SLIDES\n----------------------------------------\n${results.instagram}\n\n` +
      `----------------------------------------\n5. EMAIL NEWSLETTER EDITORIAL\n----------------------------------------\n${results.newsletter}\n`;
    
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repurposed-content-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
              ✨ Content Multiplier
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Content Repurposing Matrix
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Transform a single blog post, transcript, or idea into 5 high-converting cross-platform formats instantly.
            </p>
          </div>
          <button
            onClick={() => { setSourceText(sampleSource); setTopic('Autonomous AI Workflows & The Future of Work'); }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            🔄 Load Sample Input
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              📄 Source Content
            </h2>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Core Topic / Headline
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 5 Strategies for Scaling B2B SaaS in 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tone & Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              >
                <option value="authoritative">Authoritative & Analytical (Thought Leader)</option>
                <option value="conversational">Conversational & Engaging (Creator)</option>
                <option value="urgent">Direct, Punchy & Actionable (Growth Hacker)</option>
                <option value="storytelling">Narrative & Educational (Founder Story)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Long-Form Text / Transcript / Article Notes
              </label>
              <textarea
                rows={10}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste your blog article, video transcript, meeting notes, or newsletter here..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none font-mono text-xs leading-relaxed"
              />
            </div>

            <button
              onClick={handleDownloadAll}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              📥 Download All Channels (.txt)
            </button>
          </div>
        </div>

        {/* Output Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl mb-4">
              {[
                { id: 'twitter', label: '𝕏 Thread', icon: '↗️' },
                { id: 'linkedin', label: 'LinkedIn Post', icon: '📑' },
                { id: 'reels', label: 'Video Script', icon: '🚀' },
                { id: 'instagram', label: 'IG Carousel', icon: '✨' },
                { id: 'newsletter', label: 'Newsletter', icon: '📄' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Output */}
            <div className="relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Target Channel Output
                </span>
                <button
                  onClick={() => handleCopy(results[activeTab], activeTab)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-medium transition-colors"
                >
                  {copied === activeTab ? '✓ Copied!' : '📋 Copy Content'}
                </button>
              </div>

              <div className="bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/80 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                <pre className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                  {results[activeTab]}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
