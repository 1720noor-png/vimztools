// Content Script: In-Page SEO & Metadata Inspector for Vimz.ai
(() => {
  try {
    const title = document.title || '';
    const metaDescEl = document.querySelector('meta[name="description"]');
    const metaDesc = metaDescEl ? metaDescEl.getAttribute('content') || '' : '';
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonical = canonicalEl ? canonicalEl.getAttribute('href') || '' : '';

    // Open Graph Tags
    const getOg = (prop) => {
      const el = document.querySelector(`meta[property="${prop}"]`);
      return el ? el.getAttribute('content') || '' : '';
    };

    const ogTitle = getOg('og:title');
    const ogDesc = getOg('og:description');
    const ogImage = getOg('og:image');
    const ogType = getOg('og:type');

    // Headings Analysis
    const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()).filter(Boolean);
    const h2Count = document.querySelectorAll('h2').length;
    const h3Count = document.querySelectorAll('h3').length;

    // Image alt text audit
    const images = Array.from(document.querySelectorAll('img'));
    const totalImages = images.length;
    const missingAltCount = images.filter(img => !img.hasAttribute('alt') || !img.getAttribute('alt').trim()).length;

    // Word count calculation
    const bodyText = document.body ? document.body.innerText || '' : '';
    const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;

    return {
      success: true,
      url: window.location.href,
      hostname: window.location.hostname,
      title,
      titleLength: title.length,
      metaDesc,
      metaDescLength: metaDesc.length,
      canonical,
      og: {
        title: ogTitle,
        description: ogDesc,
        image: ogImage,
        type: ogType
      },
      headings: {
        h1Count: h1s.length,
        h1List: h1s.slice(0, 5),
        h2Count,
        h3Count
      },
      images: {
        total: totalImages,
        missingAlt: missingAltCount
      },
      wordCount
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to inspect page DOM'
    };
  }
})();
