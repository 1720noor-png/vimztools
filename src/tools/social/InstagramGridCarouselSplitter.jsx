import React, { useState } from 'react';

export default function InstagramGridCarouselSplitter() {
  const [slideCount, setSlideCount] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('4:5'); // 4:5 Portrait or 1:1 Square
  const [gridColumns, setGridColumns] = useState(3);
  const [gridRows, setGridRows] = useState(3);
  const [copiedKey, setCopiedKey] = useState('');

  // Dimensions based on official Instagram specifications
  const getCarouselSpecs = () => {
    const isPortrait = aspectRatio === '4:5';
    const singleWidth = 1080;
    const singleHeight = isPortrait ? 1350 : 1080;
    const totalCanvasWidth = singleWidth * slideCount;
    const totalCanvasHeight = singleHeight;

    const slides = [];
    for (let i = 0; i < slideCount; i++) {
      slides.push({
        index: i + 1,
        startX: i * singleWidth,
        endX: (i + 1) * singleWidth,
        width: singleWidth,
        height: singleHeight,
        label: i === 0 ? 'Cover Hook Slide' : i === slideCount - 1 ? 'CTA Slide' : `Content Slide ${i + 1}`
      });
    }

    return {
      singleWidth,
      singleHeight,
      totalCanvasWidth,
      totalCanvasHeight,
      slides
    };
  };

  const specs = getCarouselSpecs();

  const handleCopySpecs = () => {
    const text = `=== INSTAGRAM SEAMLESS CAROUSEL CANVAS SPECIFICATIONS ===\n` +
      `Total Canvas Dimensions: ${specs.totalCanvasWidth}px x ${specs.totalCanvasHeight}px\n` +
      `Individual Slide Dimensions: ${specs.singleWidth}px x ${specs.singleHeight}px (${aspectRatio})\n` +
      `Slide Count: ${slideCount}\n\n` +
      `Slice Guides (Figma / Photoshop Guide Coordinates):\n` +
      specs.slides.map(s => `Slide ${s.index} (${s.label}): X=${s.startX}px to X=${s.endX}px`).join('\n');
    
    navigator.clipboard.writeText(text);
    setCopiedKey('specs');
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📐 Visual Grid Planner
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Instagram Grid & Seamless Carousel Splitter
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Calculate pixel-perfect seamless multi-slide canvas dimensions, panoramic slice guides, and profile grid coordinate layouts.
            </p>
          </div>
          <button
            onClick={handleCopySpecs}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copiedKey === 'specs'  ? '✓' : '📋'}
            {copiedKey === 'specs' ? 'Specs Copied!' : 'Copy Canvas Slicing Guides'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              📑 Carousel Parameters
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Aspect Ratio Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAspectRatio('4:5')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    aspectRatio === '4:5'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  4:5 Portrait (1080 × 1350)
                  <span className="block text-[10px] opacity-75 font-normal">Recommended for feed reach</span>
                </button>
                <button
                  onClick={() => setAspectRatio('1:1')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    aspectRatio === '1:1'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  1:1 Square (1080 × 1080)
                  <span className="block text-[10px] opacity-75 font-normal">Classic feed format</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Number of Carousel Slides
                </label>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{slideCount} Slides</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>2 Slides</span>
                <span>5 Slides (Ideal)</span>
                <span>10 Slides (Max)</span>
              </div>
            </div>

            {/* Calculated Box */}
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-xl space-y-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                📐 Master Figma / Photoshop Canvas Size
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {specs.totalCanvasWidth} <span className="text-purple-500">×</span> {specs.totalCanvasHeight} px
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Create one single master artboard with these dimensions, then add vertical guide slices at every {specs.singleWidth}px mark.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Interactive Seamless Slide Slices ({slideCount} Panels)</span>
              <span className="text-[11px] font-normal text-slate-400">Swipeable Panorama Flow</span>
            </h3>

            {/* Interactive Panorama Visualizer */}
            <div className="overflow-x-auto pb-4 pt-2">
              <div className="flex gap-2 min-w-max p-2 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                {specs.slides.map((s) => (
                  <div
                    key={s.index}
                    className={`relative w-28 sm:w-32 ${aspectRatio === '4:5' ? 'h-36 sm:h-40' : 'h-28 sm:h-32'} bg-gradient-to-b from-purple-500/10 to-indigo-500/10 border-2 border-purple-500/30 rounded-xl p-2.5 flex flex-col justify-between hover:border-purple-500 transition-all shadow-xs`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {s.index}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {s.startX}px
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {s.label}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {s.width}×{s.height}
                      </span>
                    </div>

                    <div className="w-full h-1 bg-purple-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${(s.index / slideCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photoshop / Figma Guide Table */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Vertical Cut / Guide Marks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {specs.slides.map((s) => (
                  <div key={s.index} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Slide {s.index}</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-medium">
                      X: {s.startX}px → {s.endX}px
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
