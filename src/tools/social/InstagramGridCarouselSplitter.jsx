import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

export default function InstagramGridCarouselSplitter() {
  const [file, setFile] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [slideCount, setSlideCount] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('4:5'); // '4:5' Portrait or '1:1' Square
  const [fitMode, setFitMode] = useState('cover'); // 'cover' (seamless panorama) or 'contain' (fit with margins)
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [slices, setSlices] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [activeTab, setActiveTab] = useState('splitter'); // 'splitter' | 'guides'

  const fileInputRef = useRef(null);

  // Instagram resolution specifications
  const slideWidth = 1080;
  const slideHeight = aspectRatio === '4:5' ? 1350 : 1080;
  const totalCanvasWidth = slideWidth * slideCount;
  const totalCanvasHeight = slideHeight;

  // Handle file selection and validation
  const processSelectedFile = (selectedFile) => {
    setErrorMsg('');
    if (!selectedFile) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg('Invalid file format. Please upload a standard image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 30MB)
    const maxSize = 30 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setErrorMsg(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB). Please select an image under 30 MB.`);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        setErrorMsg('The uploaded image appears to be empty or corrupted.');
        URL.revokeObjectURL(objectUrl);
        return;
      }

      setFile(selectedFile);
      setImageObj(img);
      setImageMeta({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspect: (img.naturalWidth / img.naturalHeight).toFixed(2),
        objectUrl
      });
    };

    img.onerror = () => {
      setErrorMsg('Failed to decode the image. The file may be corrupt or an unsupported variant.');
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  // Generate a sample panorama for instant testing
  const loadSamplePanorama = () => {
    setErrorMsg('');
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 3240;
    sampleCanvas.height = 1080;
    const ctx = sampleCanvas.getContext('2d');

    // Create vibrant multi-tone gradient
    const grad = ctx.createLinearGradient(0, 0, sampleCanvas.width, sampleCanvas.height);
    grad.addColorStop(0, '#6C4CF1');
    grad.addColorStop(0.35, '#8B5CF6');
    grad.addColorStop(0.7, '#EC4899');
    grad.addColorStop(1, '#F59E0B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, sampleCanvas.width, sampleCanvas.height);

    // Decorative shapes across panorama
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(600, 540, 320, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(1620, 400, 450, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.arc(2600, 680, 280, 0, Math.PI * 2);
    ctx.fill();

    // Text across the canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SEAMLESS CAROUSEL PANORAMA DEMO', 1620, 500);
    ctx.font = '40px sans-serif';
    ctx.fillText('Swipe right → Visual elements flow continuously across slides', 1620, 600);

    sampleCanvas.toBlob((blob) => {
      const sampleFile = new File([blob], 'sample-panorama.jpg', { type: 'image/jpeg' });
      processSelectedFile(sampleFile);
    }, 'image/jpeg', 0.95);
  };

  // Execute slice generation via Canvas API
  useEffect(() => {
    if (!imageObj) {
      setSlices([]);
      return;
    }

    let isCancelled = false;
    setIsProcessing(true);

    const generateAllSlices = async () => {
      try {
        const totalW = slideWidth * slideCount;
        const totalH = slideHeight;

        // Calculate scaling & placement
        let drawW, drawH, startX, startY;

        if (fitMode === 'cover') {
          // Fill the entire width and height of the combined carousel
          const scale = Math.max(totalW / imageObj.naturalWidth, totalH / imageObj.naturalHeight);
          drawW = imageObj.naturalWidth * scale;
          drawH = imageObj.naturalHeight * scale;
          startX = (totalW - drawW) / 2;
          startY = (totalH - drawH) / 2;
        } else {
          // Contain within the carousel bounds
          const scale = Math.min(totalW / imageObj.naturalWidth, totalH / imageObj.naturalHeight);
          drawW = imageObj.naturalWidth * scale;
          drawH = imageObj.naturalHeight * scale;
          startX = (totalW - drawW) / 2;
          startY = (totalH - drawH) / 2;
        }

        const newSlices = [];

        for (let i = 0; i < slideCount; i++) {
          if (isCancelled) return;

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = slideWidth;
          sliceCanvas.height = slideHeight;
          const ctx = sliceCanvas.getContext('2d');

          // 1. Fill background (prevents transparent PNGs turning black in JPEG)
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, slideWidth, slideHeight);

          // 2. Draw corresponding horizontal section of the source image
          // The current slide window starts at i * slideWidth
          const destX = startX - (i * slideWidth);
          const destY = startY;

          ctx.drawImage(imageObj, destX, destY, drawW, drawH);

          // 3. Export to Blob and Data URL
          const blob = await new Promise((resolve) => sliceCanvas.toBlob(resolve, 'image/jpeg', 0.95));
          const dataUrl = sliceCanvas.toDataURL('image/jpeg', 0.95);

          const paddedIndex = String(i + 1).padStart(2, '0');
          const filename = `carousel-slide-${paddedIndex}.jpg`;

          newSlices.push({
            index: i + 1,
            paddedIndex,
            filename,
            dataUrl,
            blob,
            width: slideWidth,
            height: slideHeight,
            label: i === 0 ? 'Slide 1 (Hook / Cover)' : i === slideCount - 1 ? `Slide ${i + 1} (CTA / Conclusion)` : `Slide ${i + 1}`
          });
        }

        if (!isCancelled) {
          setSlices(newSlices);
          setIsProcessing(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setErrorMsg('An error occurred during image slicing: ' + err.message);
          setIsProcessing(false);
        }
      }
    };

    generateAllSlices();

    return () => {
      isCancelled = true;
    };
  }, [imageObj, slideCount, aspectRatio, fitMode, bgColor]);

  // Download individual slide
  const downloadSingleSlide = (slice) => {
    const link = document.createElement('a');
    link.href = slice.dataUrl;
    link.download = slice.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all slides in a ZIP archive
  const downloadAllZip = async () => {
    if (slices.length === 0 || isZipping) return;

    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add each slide to zip
      slices.forEach((s) => {
        zip.file(s.filename, s.blob);
      });

      // Add metadata text file
      const readmeText = `Vimz.ai Instagram Carousel Slices\n` +
        `----------------------------------------\n` +
        `Original Image: ${imageMeta?.name || 'Uploaded Image'}\n` +
        `Slide Count: ${slideCount}\n` +
        `Resolution: ${slideWidth}x${slideHeight} px (${aspectRatio})\n` +
        `Slicing Mode: ${fitMode === 'cover' ? 'Seamless Panorama Cover' : 'Contained'}\n` +
        `Posting Order: Upload in numerical order (01 to ${String(slideCount).padStart(2, '0')})\n`;
      zip.file('carousel-info.txt', readmeText);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);

      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `instagram-carousel-${slideCount}-slides.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);
    } catch (err) {
      setErrorMsg('Failed to create ZIP file: ' + err.message);
    } finally {
      setIsZipping(false);
    }
  };

  // Slicing guides copy
  const handleCopySpecs = () => {
    const text = `=== INSTAGRAM SEAMLESS CAROUSEL CANVAS SPECIFICATIONS ===\n` +
      `Total Canvas Dimensions: ${totalCanvasWidth}px x ${totalCanvasHeight}px\n` +
      `Individual Slide Dimensions: ${slideWidth}px x ${slideHeight}px (${aspectRatio})\n` +
      `Slide Count: ${slideCount}\n\n` +
      `Slice Guides (Figma / Photoshop Guide Coordinates):\n` +
      Array.from({ length: slideCount }).map((_, i) =>
        `Slide ${i + 1}: X=${i * slideWidth}px to X=${(i + 1) * slideWidth}px`
      ).join('\n');

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
              📸 Instagram Visual Engineering
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Instagram Grid & Seamless Carousel Splitter
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload panoramic photos and slice them in-browser into seamless multi-panel Instagram carousel slides. 100% private & client-side.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setActiveTab('splitter')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'splitter'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ✂️ Image Slicer
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'guides'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📐 Canvas Specs
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-xs font-bold underline ml-3">Dismiss</button>
        </div>
      )}

      {activeTab === 'splitter' && (
        <div className="space-y-6">
          {/* Top: Upload & Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Drag & Drop Upload Zone */}
            <div className="lg:col-span-6 space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="text-4xl mb-3">🖼️</div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {imageMeta ? 'Replace Image' : 'Click to Upload or Drag & Drop'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Supports panoramic JPG, PNG, and WebP (up to 30 MB). All slicing occurs locally inside your browser.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="inline-block text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">
                    JPEG, PNG, WebP
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadSamplePanorama();
                    }}
                    className="text-[11px] bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-md font-semibold hover:bg-purple-200 transition-colors"
                  >
                    ✨ Try Sample Panorama
                  </button>
                </div>
              </div>

              {/* Uploaded File Info Card */}
              {imageMeta && (
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-xs">
                      {imageMeta.name}
                    </span>
                    <span className="text-slate-400">
                      {imageMeta.width} × {imageMeta.height} px • {(imageMeta.size / 1024 / 1024).toFixed(2)} MB • Aspect: {imageMeta.aspect}:1
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setImageObj(null);
                      setImageMeta(null);
                      setSlices([]);
                    }}
                    className="text-red-500 hover:text-red-700 font-semibold text-xs"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Right: Controls & Parameters */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  ⚙️ Carousel Parameters
                </h2>

                {/* Aspect Ratio Buttons */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Target Instagram Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('4:5')}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                        aspectRatio === '4:5'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>4:5 Portrait</span>
                        <span className="text-[10px] bg-purple-200 dark:bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-800 dark:text-purple-200">Recommended</span>
                      </div>
                      <span className="block text-[11px] opacity-75 font-normal mt-0.5">1080 × 1350 px per slide</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('1:1')}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                        aspectRatio === '1:1'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>1:1 Square</span>
                      <span className="block text-[11px] opacity-75 font-normal mt-0.5">1080 × 1080 px per slide</span>
                    </button>
                  </div>
                </div>

                {/* Number of Slides Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Number of Carousel Slides
                    </label>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {slideCount} Slides
                    </span>
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

                {/* Fit Mode Selection */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Slicing Alignment
                    </label>
                    <select
                      value={fitMode}
                      onChange={(e) => setFitMode(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="cover">Seamless Panorama (Cover & Crop)</option>
                      <option value="contain">Fit Full Image (Contain with Background)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Background Fill
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono text-slate-500">{bgColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Master Canvas Summary */}
                <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-purple-900 dark:text-purple-300 block">
                      Total Output Canvas
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {totalCanvasWidth} × {totalCanvasHeight} px ({slideCount} slides of {slideWidth}×{slideHeight})
                    </span>
                  </div>
                  {slices.length > 0 && (
                    <button
                      onClick={downloadAllZip}
                      disabled={isZipping || isProcessing}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      {isZipping ? '⏳ Creating ZIP…' : '📦 Download All (ZIP)'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sliced Output Gallery */}
          {slices.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Generated Carousel Slices ({slices.length} Images)</span>
                    {isProcessing && <span className="text-xs text-purple-600 font-normal">Re-slicing…</span>}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Click any slide to download individually, or use Download All to get the full ordered set.
                  </p>
                </div>
                <button
                  onClick={downloadAllZip}
                  disabled={isZipping || isProcessing}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
                >
                  {isZipping ? '⏳ Zipping…' : '📦 Download All (ZIP)'}
                </button>
              </div>

              {/* Horizontal Scroll Panorama Preview */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Seamless Continuous Panorama Flow (Swipe / Scroll)
                </span>
                <div className="overflow-x-auto pb-4 pt-1">
                  <div className="flex gap-2 min-w-max p-2 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {slices.map((slice) => (
                      <div
                        key={slice.index}
                        className={`relative ${
                          aspectRatio === '4:5' ? 'w-36 h-44' : 'w-36 h-36'
                        } rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group shadow-xs`}
                      >
                        <img
                          src={slice.dataUrl}
                          alt={slice.filename}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          #{slice.index}
                        </div>
                        <button
                          onClick={() => downloadSingleSlide(slice)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1"
                        >
                          <span>⬇️ Download</span>
                          <span className="text-[10px] opacity-80">{slice.filename}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Slide Grid with Download Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
                {slices.map((slice) => (
                  <div
                    key={slice.index}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-850 flex flex-col justify-between space-y-2 hover:border-purple-400 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Slide {slice.index}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {slice.width}×{slice.height}
                        </span>
                      </div>
                      <div className={`w-full ${aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square'} bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700`}>
                        <img
                          src={slice.dataUrl}
                          alt={slice.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {slice.label}
                      </span>
                    </div>

                    <button
                      onClick={() => downloadSingleSlide(slice)}
                      className="w-full py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>⬇️ Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder State if no file uploaded */}
          {!imageMeta && (
            <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-900/30">
              <div className="text-3xl mb-2">✨</div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Ready to Split Your First Instagram Panorama
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Upload your panoramic photo above or click "Try Sample Panorama" to see the real-time slice generator and ZIP packager in action.
              </p>
              <button
                type="button"
                onClick={loadSamplePanorama}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-purple-700 transition-colors"
              >
                Load Sample Panorama
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Designer Guide & Dimensions Tab */}
      {activeTab === 'guides' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Figma & Photoshop Canvas Blueprint
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exact pixel coordinates for manually creating panoramic carousel artboards in Figma, Photoshop, or Illustrator.
              </p>
            </div>
            <button
              onClick={handleCopySpecs}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              {copiedKey === 'specs' ? '✓ Specs Copied!' : '📋 Copy Slicing Guides'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 rounded-xl space-y-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                📐 Master Artboard Dimensions
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {totalCanvasWidth} <span className="text-purple-500">×</span> {totalCanvasHeight} px
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Create one single master canvas with these dimensions for {slideCount} slides at {aspectRatio} aspect ratio.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                ✂️ Individual Slide Resolution
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {slideWidth} <span className="text-purple-500">×</span> {slideHeight} px
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Instagram feed standard resolution for maximum sharpness on Retina mobile displays.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Vertical Guide Marks / Slices
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              {Array.from({ length: slideCount }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Slide {i + 1}
                  </span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    X: {i * slideWidth}px → {(i + 1) * slideWidth}px
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
