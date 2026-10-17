import type { PdfToolSpec } from './types.ts'

export const pdfSpecsData: PdfToolSpec[] = [
  {
  "id": "pdf-to-text",
  "name": "PDF to Text",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Extract pure editable text from all or selected PDF pages instantly.",
  "blurb": "Extract pure editable text from all or selected PDF pages instantly.",
  "op": "extract-text",
  "proTip": "Use layout-preservation mode when extracting tabular reports to keep columns intact.",
  "params": [
    {
      "id": "pages",
      "label": "Page Range (e.g. all, 1-3, 5)",
      "type": "text",
      "defaultValue": "all",
      "placeholder": "all"
    },
    {
      "id": "format",
      "label": "Output Format",
      "type": "select",
      "defaultValue": "txt",
      "options": [
        {
          "label": "Plain Text (.txt)",
          "value": "txt"
        },
        {
          "label": "Formatted JSON (.json)",
          "value": "json"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-to-html",
  "name": "PDF to HTML",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Convert PDF document pages into responsive, web-ready HTML code.",
  "blurb": "Convert PDF document pages into responsive, web-ready HTML code.",
  "op": "convert-html",
  "proTip": "Generated HTML uses CSS vector styling to preserve font fidelity without server dependencies.",
  "params": [
    {
      "id": "embedStyles",
      "label": "Inline Styles",
      "type": "toggle",
      "defaultValue": true
    },
    {
      "id": "singlePage",
      "label": "Single Document View",
      "type": "toggle",
      "defaultValue": true
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-to-csv",
  "name": "PDF to CSV",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Convert tables and tabular data inside PDFs into structured CSV spreadsheets.",
  "blurb": "Convert tables and tabular data inside PDFs into structured CSV spreadsheets.",
  "op": "convert-csv",
  "proTip": "Ensure source tables have defined border lines or consistent column gutters for best tabular recognition.",
  "params": [
    {
      "id": "delimiter",
      "label": "Delimiter",
      "type": "select",
      "defaultValue": ",",
      "options": [
        {
          "label": "Comma (,)",
          "value": ","
        },
        {
          "label": "Semicolon (;)",
          "value": ";"
        },
        {
          "label": "Tab (\\t)",
          "value": "\t"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-to-webp",
  "name": "PDF to WebP",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Convert PDF pages into lightweight, modern WebP image format for web delivery.",
  "blurb": "Convert PDF pages into lightweight, modern WebP image format for web delivery.",
  "op": "convert-webp",
  "proTip": "WebP format yields ~30% smaller file sizes than JPEG at equivalent visual clarity.",
  "params": [
    {
      "id": "quality",
      "label": "Quality",
      "type": "slider",
      "defaultValue": 85,
      "min": 50,
      "max": 100,
      "step": 5
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-to-svg",
  "name": "PDF to SVG",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Render PDF page vector outlines and graphics into scalable SVG files.",
  "blurb": "Render PDF page vector outlines and graphics into scalable SVG files.",
  "op": "convert-svg",
  "proTip": "SVGs can be scaled infinitely in design tools like Figma and Illustrator without pixelation.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-to-pdfa",
  "name": "PDF to PDF/A",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Convert PDF files into standardized ISO 19005 compliant PDF/A for archiving.",
  "blurb": "Convert PDF files into standardized ISO 19005 compliant PDF/A for archiving.",
  "op": "convert-pdfa",
  "proTip": "PDF/A embeds all font descriptors and color profiles to guarantee exact visual reproduction decades later.",
  "params": [
    {
      "id": "standard",
      "label": "Compliance Level",
      "type": "select",
      "defaultValue": "1b",
      "options": [
        {
          "label": "PDF/A-1b (Visual Preservation)",
          "value": "1b"
        },
        {
          "label": "PDF/A-2b (Modern Formats)",
          "value": "2b"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "html-to-pdf-converter",
  "name": "HTML to PDF",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Convert HTML code, rich text, or webpages into formatted PDF documents.",
  "blurb": "Convert HTML code, rich text, or webpages into formatted PDF documents.",
  "op": "html-to-pdf",
  "proTip": "Use print media queries to customize headers, footers, and page breaks.",
  "params": [
    {
      "id": "pageSize",
      "label": "Paper Size",
      "type": "select",
      "defaultValue": "a4",
      "options": [
        {
          "label": "A4",
          "value": "a4"
        },
        {
          "label": "Letter",
          "value": "letter"
        }
      ]
    }
  ],
  "accept": ".html,.htm,.txt",
  "multiple": false
},
  {
  "id": "text-to-pdf-converter",
  "name": "Text to PDF",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Transform plain text notes or articles into clean, printable PDF documents.",
  "blurb": "Transform plain text notes or articles into clean, printable PDF documents.",
  "op": "text-to-pdf",
  "proTip": "Select a clean serif or sans-serif font family for comfortable reading.",
  "params": [
    {
      "id": "fontSize",
      "label": "Font Size (pt)",
      "type": "number",
      "defaultValue": 12,
      "min": 9,
      "max": 24
    },
    {
      "id": "lineHeight",
      "label": "Line Height",
      "type": "select",
      "defaultValue": "1.5",
      "options": [
        {
          "label": "1.2 (Compact)",
          "value": "1.2"
        },
        {
          "label": "1.5 (Standard)",
          "value": "1.5"
        },
        {
          "label": "2.0 (Double)",
          "value": "2.0"
        }
      ]
    }
  ],
  "accept": ".txt,.md",
  "multiple": false
},
  {
  "id": "markdown-to-pdf-tool",
  "name": "Markdown to PDF",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Render formatted Markdown files with headers, code blocks and tables into PDF.",
  "blurb": "Render formatted Markdown files with headers, code blocks and tables into PDF.",
  "op": "markdown-to-pdf",
  "proTip": "Full CommonMark and GFM tables are rendered automatically into clean page layouts.",
  "params": [
    {
      "id": "theme",
      "label": "Theme Styling",
      "type": "select",
      "defaultValue": "academic",
      "options": [
        {
          "label": "Academic / Clean",
          "value": "academic"
        },
        {
          "label": "Modern Tech",
          "value": "tech"
        },
        {
          "label": "Minimal Monochrome",
          "value": "minimal"
        }
      ]
    }
  ],
  "accept": ".md,.txt",
  "multiple": false
},
  {
  "id": "epub-to-pdf-tool",
  "name": "EPUB to PDF",
  "sub": "Core PDF Tools",
  "icon": "FileText",
  "description": "Convert EPUB eBooks and text into structured, easy-to-read PDF documents.",
  "blurb": "Convert EPUB eBooks and text into structured, easy-to-read PDF documents.",
  "op": "epub-to-pdf",
  "proTip": "Font sizes and chapter breaks are preserved in the converted PDF.",
  "params": [],
  "accept": ".epub,.txt",
  "multiple": false
},
  {
  "id": "delete-pdf-pages",
  "name": "Delete PDF Pages",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Selectively remove unwanted pages from any PDF and download the clean document.",
  "blurb": "Selectively remove unwanted pages from any PDF and download the clean document.",
  "op": "delete-pages",
  "proTip": "Enter comma-separated page numbers or dash ranges (e.g. 2, 4-6, 9) to delete.",
  "params": [
    {
      "id": "pagesToDelete",
      "label": "Pages to Delete (e.g. 2, 5-7)",
      "type": "text",
      "defaultValue": "",
      "placeholder": "e.g. 1, 3-5"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-selected-pages",
  "name": "Extract Selected Pages",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Extract individual pages or custom ranges into a standalone new PDF file.",
  "blurb": "Extract individual pages or custom ranges into a standalone new PDF file.",
  "op": "extract-pages",
  "proTip": "Extracting key chapters creates lightweight, shareable excerpts for email attachments.",
  "params": [
    {
      "id": "pagesToExtract",
      "label": "Pages to Extract (e.g. 1-3, 5)",
      "type": "text",
      "defaultValue": "1",
      "placeholder": "e.g. 1-4"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "insert-pdf-pages",
  "name": "Insert PDF Pages",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Insert additional pages or external PDFs at specific page positions.",
  "blurb": "Insert additional pages or external PDFs at specific page positions.",
  "op": "insert-pages",
  "proTip": "Specify the exact page number index where the new content should be slotted in.",
  "params": [
    {
      "id": "insertAt",
      "label": "Insert After Page Number",
      "type": "number",
      "defaultValue": 1,
      "min": 0
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "add-blank-pdf-page",
  "name": "Add Blank PDF Page",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Insert clean blank pages anywhere inside a PDF for notes or signatures.",
  "blurb": "Insert clean blank pages anywhere inside a PDF for notes or signatures.",
  "op": "add-blank",
  "proTip": "Blank pages help align two-sided booklet printing so new chapters start on odd pages.",
  "params": [
    {
      "id": "blankPosition",
      "label": "Insert at Position",
      "type": "select",
      "defaultValue": "end",
      "options": [
        {
          "label": "At the Beginning",
          "value": "start"
        },
        {
          "label": "At the End",
          "value": "end"
        },
        {
          "label": "After Page Number...",
          "value": "custom"
        }
      ]
    },
    {
      "id": "customPage",
      "label": "Target Page Number",
      "type": "number",
      "defaultValue": 1,
      "min": 1
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "duplicate-pdf-pages",
  "name": "Duplicate PDF Pages",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Clone and repeat designated pages within your PDF document.",
  "blurb": "Clone and repeat designated pages within your PDF document.",
  "op": "duplicate-pages",
  "proTip": "Useful for duplicating certificate templates, invoice headers, or standardized forms.",
  "params": [
    {
      "id": "pageToDuplicate",
      "label": "Page to Clone",
      "type": "number",
      "defaultValue": 1,
      "min": 1
    },
    {
      "id": "copies",
      "label": "Number of Clones",
      "type": "number",
      "defaultValue": 1,
      "min": 1,
      "max": 20
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "flip-pdf-pages",
  "name": "Flip PDF Pages",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Invert, mirror, or flip PDF page orientation horizontally or vertically.",
  "blurb": "Invert, mirror, or flip PDF page orientation horizontally or vertically.",
  "op": "flip-pages",
  "proTip": "Fix scanned pages that were fed upside-down or mirrored during batch scanning.",
  "params": [
    {
      "id": "flipType",
      "label": "Flip Mode",
      "type": "select",
      "defaultValue": "180",
      "options": [
        {
          "label": "Rotate 180°",
          "value": "180"
        },
        {
          "label": "Rotate 90° Clockwise",
          "value": "90"
        },
        {
          "label": "Rotate 90° Counter-Clockwise",
          "value": "270"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-page-size-changer",
  "name": "PDF Page Size Changer",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Standardize document dimensions to A4, Letter, Legal, or custom sizes.",
  "blurb": "Standardize document dimensions to A4, Letter, Legal, or custom sizes.",
  "op": "page-size",
  "proTip": "Resizing page bounds recalculates margins proportionally so text is not cut off.",
  "params": [
    {
      "id": "targetSize",
      "label": "Standard Dimensions",
      "type": "select",
      "defaultValue": "a4",
      "options": [
        {
          "label": "ISO A4 (210 x 297 mm)",
          "value": "a4"
        },
        {
          "label": "US Letter (8.5 x 11 in)",
          "value": "letter"
        },
        {
          "label": "US Legal (8.5 x 14 in)",
          "value": "legal"
        },
        {
          "label": "ISO A3 (297 x 420 mm)",
          "value": "a3"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-page-margin-adjuster",
  "name": "PDF Page Margin Adjuster",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Expand or trim margins around PDF pages for binding or hole punches.",
  "blurb": "Expand or trim margins around PDF pages for binding or hole punches.",
  "op": "page-margins",
  "proTip": "Add 15-20mm inner margins to create ample gutter space for spiral or comb binding.",
  "params": [
    {
      "id": "marginMm",
      "label": "Extra Margin (mm)",
      "type": "slider",
      "defaultValue": 10,
      "min": 0,
      "max": 40,
      "step": 2
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-resize-pages",
  "name": "PDF Resize Pages",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Scale PDF page content proportionally to fit smaller or larger paper formats.",
  "blurb": "Scale PDF page content proportionally to fit smaller or larger paper formats.",
  "op": "resize-pages",
  "proTip": "Scaling down oversized architectural drawings lets you print on standard desktop printers.",
  "params": [
    {
      "id": "scale",
      "label": "Scale Factor (%)",
      "type": "slider",
      "defaultValue": 100,
      "min": 50,
      "max": 200,
      "step": 5
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-landscape-portrait-converter",
  "name": "PDF Landscape/Portrait Converter",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Change page orientation between landscape and portrait without distorting content.",
  "blurb": "Change page orientation between landscape and portrait without distorting content.",
  "op": "orient-pages",
  "proTip": "Ensures wide financial balance sheets match the vertical layout of executive reports.",
  "params": [
    {
      "id": "orientation",
      "label": "Target Orientation",
      "type": "select",
      "defaultValue": "portrait",
      "options": [
        {
          "label": "Portrait (Vertical)",
          "value": "portrait"
        },
        {
          "label": "Landscape (Horizontal)",
          "value": "landscape"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-poster-tiled-printing",
  "name": "PDF Poster/Tiled Printing",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Tile large PDF pages across multiple standard sheets for assembling posters.",
  "blurb": "Tile large PDF pages across multiple standard sheets for assembling posters.",
  "op": "poster-tiling",
  "proTip": "Includes cut-and-overlap guide marks along sheet borders for seamless tape assembly.",
  "params": [
    {
      "id": "tilingGrid",
      "label": "Poster Grid Size",
      "type": "select",
      "defaultValue": "2x2",
      "options": [
        {
          "label": "2x2 Sheets (4x Area)",
          "value": "2x2"
        },
        {
          "label": "3x3 Sheets (9x Area)",
          "value": "3x3"
        },
        {
          "label": "4x4 Sheets (16x Area)",
          "value": "4x4"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "split-pdf-by-size-chunk",
  "name": "Split PDF by Target File Size",
  "sub": "Advanced Page Management & Editing",
  "icon": "Layers",
  "description": "Divide oversized PDFs into equal megabyte parts suitable for email attachments.",
  "blurb": "Divide oversized PDFs into equal megabyte parts suitable for email attachments.",
  "op": "delete-pages",
  "proTip": "Generates chunks strictly under 10MB or 25MB email attachment limits.",
  "params": [
    {
      "id": "maxMb",
      "label": "Target Max Size per Chunk (MB)",
      "type": "select",
      "defaultValue": "10",
      "options": [
        {
          "label": "5 MB Chunks",
          "value": "5"
        },
        {
          "label": "10 MB Chunks",
          "value": "10"
        },
        {
          "label": "25 MB Chunks",
          "value": "25"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-pdf-restrictions",
  "name": "Remove PDF Restrictions",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Unlock print, copy, and form-fill permission restrictions on owned PDFs.",
  "blurb": "Unlock print, copy, and form-fill permission restrictions on owned PDFs.",
  "op": "remove-restrictions",
  "proTip": "Clears user rights restrictions so you can annotate and highlight in any PDF reader.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "change-pdf-password",
  "name": "Change PDF Password",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Update or replace the owner/user security password of your document.",
  "blurb": "Update or replace the owner/user security password of your document.",
  "op": "change-password",
  "proTip": "Regularly updating passwords on shared financial statements ensures access control.",
  "params": [
    {
      "id": "newPassword",
      "label": "New Password",
      "type": "text",
      "defaultValue": "",
      "placeholder": "Enter new password"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "change-pdf-permissions",
  "name": "Change PDF Permissions",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Toggle granular permissions for printing, content copying, and form modifications.",
  "blurb": "Toggle granular permissions for printing, content copying, and form modifications.",
  "op": "change-permissions",
  "proTip": "Restrict content extraction to protect proprietary research papers from copying.",
  "params": [
    {
      "id": "allowPrinting",
      "label": "Allow Printing",
      "type": "toggle",
      "defaultValue": true
    },
    {
      "id": "allowCopying",
      "label": "Allow Text Copying",
      "type": "toggle",
      "defaultValue": false
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-pdf-metadata",
  "name": "Remove PDF Metadata",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Strip author names, software signatures, and edit history for privacy before sharing.",
  "blurb": "Strip author names, software signatures, and edit history for privacy before sharing.",
  "op": "strip-metadata",
  "proTip": "Strips camera serial numbers and author details before publishing publicly.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-sanitizer",
  "name": "PDF Sanitizer",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Deep clean PDFs by purging hidden streams, invisible text layers, and embedded scripts.",
  "blurb": "Deep clean PDFs by purging hidden streams, invisible text layers, and embedded scripts.",
  "op": "sanitize",
  "proTip": "Crucial for government submissions to purge hidden revision metadata.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-hidden-data",
  "name": "Remove Hidden Data",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Delete thumbnail caches, private application tags, and invisible PDF layers.",
  "blurb": "Delete thumbnail caches, private application tags, and invisible PDF layers.",
  "op": "remove-hidden",
  "proTip": "Purges cached vector object histories that might retain previous drafts.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-embedded-files",
  "name": "Remove Embedded Files",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Detect and remove file attachments, audio clips, and embedded media.",
  "blurb": "Detect and remove file attachments, audio clips, and embedded media.",
  "op": "remove-embedded",
  "proTip": "Removing large multimedia attachments slashes PDF file weight for email delivery.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-javascript-from-pdf",
  "name": "Remove JavaScript from PDF",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Strip embedded executable JavaScript actions to prevent security vulnerabilities.",
  "blurb": "Strip embedded executable JavaScript actions to prevent security vulnerabilities.",
  "op": "remove-js",
  "proTip": "Neutralizes automated script attacks embedded in untrusted external documents.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-annotations-sec",
  "name": "Remove Annotations & Comments",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Strip all editorial annotations, sticky notes, and drawing highlights.",
  "blurb": "Strip all editorial annotations, sticky notes, and drawing highlights.",
  "op": "remove-annotations",
  "proTip": "Cleans draft review markings before sending final contracts to clients.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-privacy-checker",
  "name": "PDF Privacy Checker",
  "sub": "Security & Privacy Utilities",
  "icon": "ShieldCheck",
  "description": "Audit documents for hidden metadata, tracked author names, and privacy leaks.",
  "blurb": "Audit documents for hidden metadata, tracked author names, and privacy leaks.",
  "op": "privacy-audit",
  "proTip": "Generates a confidentiality score showing exposed author tags and revisions.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-all-text-layer",
  "name": "Extract All Text",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Extract entire vector and OCR text layers into cleanly formatted text.",
  "blurb": "Extract entire vector and OCR text layers into cleanly formatted text.",
  "op": "extract-text",
  "proTip": "Exports pure text preserving linebreaks for easy pasting into word processors.",
  "params": [
    {
      "id": "pages",
      "label": "Pages (all or comma-separated e.g. 1-3)",
      "type": "text",
      "defaultValue": "all"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-document-metadata",
  "name": "Extract Document Metadata",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "View and export document author, title, producer, creation date, and XMP info.",
  "blurb": "View and export document author, title, producer, creation date, and XMP info.",
  "op": "extract-meta",
  "proTip": "Inspect forensic metadata to verify original document creation timestamps.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-images-from-pdf",
  "name": "Extract Images from PDF",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Detect and rip all embedded photos and raster graphics into separate image files.",
  "blurb": "Detect and rip all embedded photos and raster graphics into separate image files.",
  "op": "extract-images",
  "proTip": "Extracts full-resolution source graphics without compression artifacts.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-embedded-fonts",
  "name": "Extract Embedded Fonts",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Detect and list all embedded TrueType and OpenType fonts used in the document.",
  "blurb": "Detect and list all embedded TrueType and OpenType fonts used in the document.",
  "op": "extract-fonts",
  "proTip": "Identify missing system fonts before sending files to professional print shops.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-file-attachments",
  "name": "Extract File Attachments",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Extract embedded ZIPs, spreadsheets, and XML files packaged inside PDF envelopes.",
  "blurb": "Extract embedded ZIPs, spreadsheets, and XML files packaged inside PDF envelopes.",
  "op": "extract-attachments",
  "proTip": "Extracts embedded ZUGFeRD or Factur-X XML invoices seamlessly.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-all-links",
  "name": "Extract All Links & URLs",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Scrape all embedded web hyperlinks and URL references from document text.",
  "blurb": "Scrape all embedded web hyperlinks and URL references from document text.",
  "op": "extract-links",
  "proTip": "Audit document citations and references for broken or outdated links.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-email-addresses",
  "name": "Extract Email Addresses",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Automatically detect and export all email addresses found across PDF pages.",
  "blurb": "Automatically detect and export all email addresses found across PDF pages.",
  "op": "extract-emails",
  "proTip": "Quickly compiles directory contact lists from scanned conference brochures.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-phone-numbers",
  "name": "Extract Phone Numbers",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Detect and extract phone numbers and international dial codes from document pages.",
  "blurb": "Detect and extract phone numbers and international dial codes from document pages.",
  "op": "extract-phones",
  "proTip": "Extracts formatted international contact numbers from resumes and invoices.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-keywords-from-pdf",
  "name": "Extract Keywords",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Analyze document frequency and compile high-relevance subject keywords.",
  "blurb": "Analyze document frequency and compile high-relevance subject keywords.",
  "op": "extract-keywords",
  "proTip": "Identifies the most prominent search and indexing terms in dense papers.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-document-headings",
  "name": "Extract Document Headings",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Generate a hierarchical list of all H1, H2, and H3 headers across the PDF.",
  "blurb": "Generate a hierarchical list of all H1, H2, and H3 headers across the PDF.",
  "op": "extract-headings",
  "proTip": "Extracts outline structure for rapid table-of-contents creation.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-word-counter",
  "name": "PDF Word & Reading Time Counter",
  "sub": "Extraction & Smart Tools",
  "icon": "Search",
  "description": "Comprehensive analysis: calculate exact word count, characters, and reading duration.",
  "blurb": "Comprehensive analysis: calculate exact word count, characters, and reading duration.",
  "op": "word-count",
  "proTip": "Calculates standard reading time assuming an average 200 words per minute pace.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-text-to-pdf",
  "name": "Add Text to PDF",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Insert custom text notes, headers, or dates at designated coordinates.",
  "blurb": "Insert custom text notes, headers, or dates at designated coordinates.",
  "op": "add-text",
  "proTip": "Click on the page preview to position your text box precisely where required.",
  "params": [
    {
      "id": "textContent",
      "label": "Text to Insert",
      "type": "text",
      "defaultValue": "Approved for distribution",
      "placeholder": "Enter text"
    },
    {
      "id": "fontSize",
      "label": "Font Size",
      "type": "number",
      "defaultValue": 14,
      "min": 8,
      "max": 72
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "edit-existing-pdf-text",
  "name": "Edit Existing PDF Text",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Modify typographical errors and update text lines directly in-browser.",
  "blurb": "Modify typographical errors and update text lines directly in-browser.",
  "op": "edit-text",
  "proTip": "Matching font styles maintains visual continuity across edited paragraphs.",
  "params": [
    {
      "id": "findText",
      "label": "Text to Find",
      "type": "text",
      "defaultValue": "",
      "placeholder": "Find text"
    },
    {
      "id": "replaceText",
      "label": "Replacement Text",
      "type": "text",
      "defaultValue": "",
      "placeholder": "Replace with"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-highlighter-tool",
  "name": "PDF Highlighter",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Highlight important paragraphs, clauses, or citations with bright pastel tints.",
  "blurb": "Highlight important paragraphs, clauses, or citations with bright pastel tints.",
  "op": "highlight",
  "proTip": "Yellow and green highlighters offer the best contrast on scanned document text.",
  "params": [
    {
      "id": "highlightColor",
      "label": "Highlight Color",
      "type": "select",
      "defaultValue": "yellow",
      "options": [
        {
          "label": "Pastel Yellow",
          "value": "yellow"
        },
        {
          "label": "Neon Green",
          "value": "green"
        },
        {
          "label": "Soft Cyan",
          "value": "cyan"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-underline-tool",
  "name": "PDF Underline Tool",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Draw crisp emphasis underlines beneath critical sentences or heading titles.",
  "blurb": "Draw crisp emphasis underlines beneath critical sentences or heading titles.",
  "op": "underline",
  "proTip": "Use underlines for formal contracts where colored highlighters are discouraged.",
  "params": [
    {
      "id": "lineColor",
      "label": "Underline Color",
      "type": "color",
      "defaultValue": "#0284c7"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "strikethrough-pdf-tool",
  "name": "Strikethrough PDF",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Cross out outdated sentences or redact sections with visible strike lines.",
  "blurb": "Cross out outdated sentences or redact sections with visible strike lines.",
  "op": "strikethrough",
  "proTip": "Indicates proposed contract clause deletions during multi-party negotiations.",
  "params": [
    {
      "id": "strikeColor",
      "label": "Strikethrough Color",
      "type": "color",
      "defaultValue": "#dc2626"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-shapes-to-pdf",
  "name": "Add Shapes to PDF",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Insert clean vector rectangles, circles, and borders to call out key data.",
  "blurb": "Insert clean vector rectangles, circles, and borders to call out key data.",
  "op": "add-shapes",
  "proTip": "Use transparent fills with crisp border strokes to frame critical charts.",
  "params": [
    {
      "id": "shape",
      "label": "Shape Type",
      "type": "select",
      "defaultValue": "rectangle",
      "options": [
        {
          "label": "Rectangle Frame",
          "value": "rectangle"
        },
        {
          "label": "Circle / Ellipse",
          "value": "circle"
        }
      ]
    },
    {
      "id": "borderColor",
      "label": "Border Color",
      "type": "color",
      "defaultValue": "#0284c7"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-arrow-to-pdf",
  "name": "Add Arrow to PDF",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Draw directional callout arrows pointing to diagrams or critical figures.",
  "blurb": "Draw directional callout arrows pointing to diagrams or critical figures.",
  "op": "add-arrow",
  "proTip": "Draw arrows to guide user attention directly to signature fields or notices.",
  "params": [
    {
      "id": "arrowColor",
      "label": "Arrow Color",
      "type": "color",
      "defaultValue": "#ef4444"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-sticky-notes-pdf",
  "name": "Add Sticky Notes",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Place interactive notes and review comments on document margins.",
  "blurb": "Place interactive notes and review comments on document margins.",
  "op": "sticky-notes",
  "proTip": "Sticky notes provide ample space for detailed editorial feedback.",
  "params": [
    {
      "id": "noteContent",
      "label": "Note Message",
      "type": "text",
      "defaultValue": "Please verify financial calculation on row 4.",
      "placeholder": "Note content"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-comment-tool",
  "name": "PDF Comment Tool",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Add editorial review feedback and margin notes to any PDF file.",
  "blurb": "Add editorial review feedback and margin notes to any PDF file.",
  "op": "comments",
  "proTip": "Comments are embedded into standard PDF annotation streams compatible with Acrobat Reader.",
  "params": [
    {
      "id": "author",
      "label": "Reviewer Name",
      "type": "text",
      "defaultValue": "Reviewer",
      "placeholder": "Your name"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-annotations-edit",
  "name": "Remove Annotations",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Clear drawn annotations and markings while keeping original page content.",
  "blurb": "Clear drawn annotations and markings while keeping original page content.",
  "op": "clear-annotations",
  "proTip": "Strips highlights and sketches while keeping vector text and imagery intact.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-freehand-drawing",
  "name": "PDF Freehand Drawing",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Smooth vector pen tool for freehand diagrams, signatures, and notes.",
  "blurb": "Smooth vector pen tool for freehand diagrams, signatures, and notes.",
  "op": "freehand",
  "proTip": "Supports pressure-sensitive stylus strokes for natural handwriting.",
  "params": [
    {
      "id": "penWidth",
      "label": "Stroke Width",
      "type": "slider",
      "defaultValue": 2,
      "min": 1,
      "max": 8
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "insert-floating-image-pdf",
  "name": "Insert Floating Image on PDF",
  "sub": "PDF Editing & Annotation",
  "icon": "PenTool",
  "description": "Stamp floating logos, photos, or diagrams directly onto any PDF page.",
  "blurb": "Stamp floating logos, photos, or diagrams directly onto any PDF page.",
  "op": "add-image",
  "proTip": "Use transparent PNG graphics so background text flows around logos naturally.",
  "params": [
    {
      "id": "pageNumber",
      "label": "Target Page",
      "type": "number",
      "defaultValue": 1,
      "min": 1
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "create-fillable-pdf",
  "name": "Create Fillable PDF",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Design interactive form fields on flat documents for online submission.",
  "blurb": "Design interactive form fields on flat documents for online submission.",
  "op": "create-form",
  "proTip": "Converts static lines into interactive fillable text boxes automatically.",
  "params": [
    {
      "id": "fieldPreset",
      "label": "Form Template",
      "type": "select",
      "defaultValue": "contact",
      "options": [
        {
          "label": "Contact Information Form",
          "value": "contact"
        },
        {
          "label": "Job Application Form",
          "value": "job"
        },
        {
          "label": "Feedback Survey",
          "value": "survey"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "edit-pdf-form",
  "name": "Edit PDF Form",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Modify field names, tooltips, validation rules, and default values.",
  "blurb": "Modify field names, tooltips, validation rules, and default values.",
  "op": "edit-form",
  "proTip": "Assign clear field names so screen readers and autofill tools can assist users.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-text-field-pdf",
  "name": "Add Text Field",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Insert single-line or multi-line text input fields onto PDF pages.",
  "blurb": "Insert single-line or multi-line text input fields onto PDF pages.",
  "op": "add-textfield",
  "proTip": "Set character limits on input fields to prevent text overflowing margins.",
  "params": [
    {
      "id": "fieldName",
      "label": "Field Identifier",
      "type": "text",
      "defaultValue": "fullName",
      "placeholder": "e.g. fullName"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-checkbox-pdf",
  "name": "Add Checkbox",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Add clickable check boxes and toggle switches to forms.",
  "blurb": "Add clickable check boxes and toggle switches to forms.",
  "op": "add-checkbox",
  "proTip": "Ideal for terms and conditions agreements and checklist responses.",
  "params": [
    {
      "id": "boxName",
      "label": "Checkbox Name",
      "type": "text",
      "defaultValue": "agreeTerms",
      "placeholder": "e.g. agreeTerms"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-radio-button-pdf",
  "name": "Add Radio Button",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Create mutually exclusive radio button groups for surveys and forms.",
  "blurb": "Create mutually exclusive radio button groups for surveys and forms.",
  "op": "add-radio",
  "proTip": "Group radio options under identical group names so only one selection can be active.",
  "params": [
    {
      "id": "groupName",
      "label": "Radio Group Name",
      "type": "text",
      "defaultValue": "paymentMethod",
      "placeholder": "e.g. paymentMethod"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-dropdown-field-pdf",
  "name": "Add Dropdown Field",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Add dropdown select menus with custom option lists to PDF forms.",
  "blurb": "Add dropdown select menus with custom option lists to PDF forms.",
  "op": "add-dropdown",
  "proTip": "Provide standardized dropdown choices like countries or department codes.",
  "params": [
    {
      "id": "optionsList",
      "label": "Options (comma-separated)",
      "type": "text",
      "defaultValue": "Option 1, Option 2, Option 3",
      "placeholder": "Comma-separated choices"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-signature-field-pdf",
  "name": "Add Signature Field",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Insert signature placeholder boxes ready for e-signing.",
  "blurb": "Insert signature placeholder boxes ready for e-signing.",
  "op": "add-sig-field",
  "proTip": "Provides designated digital signing boxes recognized by electronic signature workflows.",
  "params": [
    {
      "id": "sigLabel",
      "label": "Signer Title",
      "type": "text",
      "defaultValue": "Authorized Signatory",
      "placeholder": "e.g. Client Signature"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-form-fields-pdf",
  "name": "Remove Form Fields",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Strip interactive form elements and revert PDF to static pages.",
  "blurb": "Strip interactive form elements and revert PDF to static pages.",
  "op": "remove-form-fields",
  "proTip": "Removes interactive widgets to produce clean, static non-fillable pages.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "flatten-pdf-form",
  "name": "Flatten PDF Form",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Lock form field inputs permanently into the document so they cannot be edited.",
  "blurb": "Lock form field inputs permanently into the document so they cannot be edited.",
  "op": "flatten-form",
  "proTip": "Always flatten completed tax and legal forms before sending to prevent tampering.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-form-data-pdf",
  "name": "Extract Form Data",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Export all filled form responses into JSON or CSV format.",
  "blurb": "Export all filled form responses into JSON or CSV format.",
  "op": "extract-form-data",
  "proTip": "Streamline survey processing by extracting filled form responses directly into spreadsheets.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "reset-pdf-form",
  "name": "Reset PDF Form",
  "sub": "PDF Forms",
  "icon": "CheckSquare",
  "description": "Clear all filled inputs and reset form fields back to their blank defaults.",
  "blurb": "Clear all filled inputs and reset form fields back to their blank defaults.",
  "op": "reset-form",
  "proTip": "Prepares a fresh, un-entered master form ready for the next client.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "sign-pdf-tool",
  "name": "Sign PDF",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Add your signature to any agreement, contract, or form in seconds.",
  "blurb": "Add your signature to any agreement, contract, or form in seconds.",
  "op": "sign-pdf",
  "proTip": "Signed documents execute 100% locally with zero server upload for absolute confidentiality.",
  "params": [
    {
      "id": "signerName",
      "label": "Signer Name",
      "type": "text",
      "defaultValue": "John Doe",
      "placeholder": "Your full name"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "draw-signature-pdf",
  "name": "Draw Signature",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Draw a smooth digital signature using mouse, touchpad, or touchscreen.",
  "blurb": "Draw a smooth digital signature using mouse, touchpad, or touchscreen.",
  "op": "draw-signature",
  "proTip": "Signatures are rendered with Bezier smoothing algorithms for natural ink flow.",
  "params": [
    {
      "id": "inkColor",
      "label": "Ink Color",
      "type": "select",
      "defaultValue": "darkblue",
      "options": [
        {
          "label": "Official Blue",
          "value": "darkblue"
        },
        {
          "label": "Formal Black",
          "value": "black"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "type-signature-pdf",
  "name": "Type Signature",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Type your name and generate stylish cursive signature variations.",
  "blurb": "Type your name and generate stylish cursive signature variations.",
  "op": "type-signature",
  "proTip": "Select from elegant handwriting typefaces that comply with e-sign guidelines.",
  "params": [
    {
      "id": "signatureStyle",
      "label": "Handwriting Style",
      "type": "select",
      "defaultValue": "cursive",
      "options": [
        {
          "label": "Executive Cursive",
          "value": "cursive"
        },
        {
          "label": "Modern Script",
          "value": "script"
        },
        {
          "label": "Calligraphic",
          "value": "calligraphy"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "signature-image-creator-pdf",
  "name": "Signature Image Creator",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Upload or crop a photo of your paper signature with background removal.",
  "blurb": "Upload or crop a photo of your paper signature with background removal.",
  "op": "sig-image",
  "proTip": "Auto-contrast boost isolates pen strokes from paper texture seamlessly.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-signature-to-pdf",
  "name": "Add Signature to PDF",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Position and resize your signature onto contract signature lines.",
  "blurb": "Position and resize your signature onto contract signature lines.",
  "op": "place-signature",
  "proTip": "Snap your signature directly to the bottom baseline of signature boxes.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-initials-to-pdf",
  "name": "Add Initials to PDF",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Stamp quick initials on every page margin of multi-page agreements.",
  "blurb": "Stamp quick initials on every page margin of multi-page agreements.",
  "op": "place-initials",
  "proTip": "Stamp initials on bottom corners of all pages in a single automated step.",
  "params": [
    {
      "id": "initials",
      "label": "Initials",
      "type": "text",
      "defaultValue": "JD",
      "placeholder": "e.g. JD"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "certificate-signature-pdf",
  "name": "Certificate Signature",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Embed digital cryptographic certificates and timestamps onto agreements.",
  "blurb": "Embed digital cryptographic certificates and timestamps onto agreements.",
  "op": "cert-sign",
  "proTip": "Binds SHA-256 certificate hashes into the signature dictionary for audit validity.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "signature-verification-tool",
  "name": "Signature Verification Tool",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Verify electronic signatures and check for post-signing document alterations.",
  "blurb": "Verify electronic signatures and check for post-signing document alterations.",
  "op": "verify-sign",
  "proTip": "Verifies whether byte ranges have been tampered with since signing occurred.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-signature-from-pdf",
  "name": "Remove Signature",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Clear outdated signature stamps and unlock documents for revision.",
  "blurb": "Clear outdated signature stamps and unlock documents for revision.",
  "op": "remove-sign",
  "proTip": "Allows document drafts to be revised before re-circulating for final sign-off.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "digital-signature-audit",
  "name": "Digital Signature Audit",
  "sub": "PDF Signatures & E-Sign",
  "icon": "Feather",
  "description": "Inspect signer metadata, signing authority, and timestamps.",
  "blurb": "Inspect signer metadata, signing authority, and timestamps.",
  "op": "structure",
  "proTip": "Validates PKI compliance against federal electronic sign standards.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "watermark-remover-tool",
  "name": "Watermark Remover",
  "sub": "Watermark, Stamp & Branding",
  "icon": "Stamp",
  "description": "Detect and remove semi-transparent watermark layers from PDF documents.",
  "blurb": "Detect and remove semi-transparent watermark layers from PDF documents.",
  "op": "remove-watermark",
  "proTip": "Isolates and removes diagonal watermark text layers without harming text below.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "opacity-watermark-adjuster",
  "name": "Watermark Opacity Adjuster",
  "sub": "Watermark, Stamp & Branding",
  "icon": "Stamp",
  "description": "Fine-tune watermark transparency for optimal balance with document text.",
  "blurb": "Fine-tune watermark transparency for optimal balance with document text.",
  "op": "opacity-watermark",
  "proTip": "Setting opacity between 15% and 25% prevents interference with OCR readability.",
  "params": [
    {
      "id": "opacity",
      "label": "Opacity (%)",
      "type": "slider",
      "defaultValue": 20,
      "min": 5,
      "max": 100,
      "step": 5
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "rotate-watermark-angle",
  "name": "Rotate Watermark Angle",
  "sub": "Watermark, Stamp & Branding",
  "icon": "Stamp",
  "description": "Adjust watermark rotation angle from horizontal to steep diagonal.",
  "blurb": "Adjust watermark rotation angle from horizontal to steep diagonal.",
  "op": "rotate-watermark",
  "proTip": "45-degree angles provide optimal coverage across standard letter and A4 pages.",
  "params": [
    {
      "id": "angle",
      "label": "Rotation Angle (degrees)",
      "type": "slider",
      "defaultValue": 45,
      "min": 0,
      "max": 360,
      "step": 15
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "positioned-watermark-tool",
  "name": "Positioned Watermark Tool",
  "sub": "Watermark, Stamp & Branding",
  "icon": "Stamp",
  "description": "Place watermarks in headers, footers, center, or document corners.",
  "blurb": "Place watermarks in headers, footers, center, or document corners.",
  "op": "pos-watermark",
  "proTip": "Corner watermarks keep the primary document reading area clean.",
  "params": [
    {
      "id": "position",
      "label": "Watermark Position",
      "type": "select",
      "defaultValue": "center",
      "options": [
        {
          "label": "Center Page",
          "value": "center"
        },
        {
          "label": "Top Left Header",
          "value": "top-left"
        },
        {
          "label": "Bottom Right Footer",
          "value": "bottom-right"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "image-watermark-stamper",
  "name": "Image Watermark Stamper",
  "sub": "Watermark, Stamp & Branding",
  "icon": "Stamp",
  "description": "Overlay company logos, crests, and graphic branding onto PDF pages.",
  "blurb": "Overlay company logos, crests, and graphic branding onto PDF pages.",
  "op": "image-watermark",
  "proTip": "Use high-resolution monochrome PNG logos for clean vector-like watermarks.",
  "params": [
    {
      "id": "scale",
      "label": "Logo Size (%)",
      "type": "slider",
      "defaultValue": 50,
      "min": 10,
      "max": 100,
      "step": 5
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-official-stamps",
  "name": "PDF Official Stamp Suite",
  "sub": "Watermark, Stamp & Branding",
  "icon": "Stamp",
  "description": "Stamp documents with official status labels: Approved, Rejected, Confidential, Draft, Copy, or Verified.",
  "blurb": "Stamp documents with official status labels: Approved, Rejected, Confidential, Draft, Copy, or Verified.",
  "op": "approved-stamp",
  "proTip": "Toggle instant preset stamps with custom date & reviewer tags.",
  "params": [
    {
      "id": "stampPreset",
      "label": "Official Preset",
      "type": "select",
      "defaultValue": "APPROVED",
      "options": [
        {
          "label": "APPROVED",
          "value": "APPROVED"
        },
        {
          "label": "REJECTED",
          "value": "REJECTED"
        },
        {
          "label": "CONFIDENTIAL",
          "value": "CONFIDENTIAL"
        },
        {
          "label": "DRAFT",
          "value": "DRAFT"
        },
        {
          "label": "COPY",
          "value": "COPY"
        },
        {
          "label": "VERIFIED",
          "value": "VERIFIED"
        }
      ]
    },
    {
      "id": "stampColor",
      "label": "Stamp Color",
      "type": "select",
      "defaultValue": "red",
      "options": [
        {
          "label": "Official Red",
          "value": "red"
        },
        {
          "label": "Audit Green",
          "value": "green"
        },
        {
          "label": "Blue",
          "value": "blue"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "custom-text-stamper",
  "name": "Custom Text Stamper",
  "sub": "Watermark, Stamp & Branding",
  "icon": "Stamp",
  "description": "Create personalized rubber stamp graphics with custom text and borders.",
  "blurb": "Create personalized rubber stamp graphics with custom text and borders.",
  "op": "custom-stamp",
  "proTip": "Add circular or rectangular borders to create authentic rubber stamp effects.",
  "params": [
    {
      "id": "stampText",
      "label": "Stamp Text",
      "type": "text",
      "defaultValue": "RECEIVED & FILED",
      "placeholder": "Enter stamp message"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "batch-pdf-branding-tool",
  "name": "Batch PDF Branding",
  "sub": "Watermark, Stamp & Branding",
  "icon": "Stamp",
  "description": "Apply logos, headers, and copyright branding across dozens of PDFs.",
  "blurb": "Apply logos, headers, and copyright branding across dozens of PDFs.",
  "op": "batch-watermark",
  "proTip": "Ensures consistent corporate identity across all client deliverable PDFs.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "add-page-numbers-standard",
  "name": "Add Page Numbers",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Add clear, sequential page numbers across all pages of your PDF document.",
  "blurb": "Add clear, sequential page numbers across all pages of your PDF document.",
  "op": "add-page-numbers",
  "proTip": "Center-bottom page numbering conforms to standard APA and Chicago style guides.",
  "params": [
    {
      "id": "prefix",
      "label": "Number Prefix (e.g. Page )",
      "type": "text",
      "defaultValue": "Page ",
      "placeholder": "Page "
    },
    {
      "id": "startNumber",
      "label": "Start Number",
      "type": "number",
      "defaultValue": 1,
      "min": 1
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "roman-numerals-numbering",
  "name": "Roman Numerals Numbering",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Number forewords, introductions, and prefaces using Roman numerals (i, ii, iii).",
  "blurb": "Number forewords, introductions, and prefaces using Roman numerals (i, ii, iii).",
  "op": "roman-numbers",
  "proTip": "Standard publishing convention for front matter and acknowledgments.",
  "params": [
    {
      "id": "pages",
      "label": "Apply to Pages",
      "type": "text",
      "defaultValue": "1-4",
      "placeholder": "e.g. 1-4"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "bates-numbering-system",
  "name": "Bates Numbering System",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Apply serialized alphanumeric Bates numbers for legal and medical records.",
  "blurb": "Apply serialized alphanumeric Bates numbers for legal and medical records.",
  "op": "bates-numbers",
  "proTip": "Essential for courtroom discovery packets to ensure unique page references.",
  "params": [
    {
      "id": "prefix",
      "label": "Bates Prefix (e.g. CASE-2026-)",
      "type": "text",
      "defaultValue": "DOC-",
      "placeholder": "Prefix"
    },
    {
      "id": "digits",
      "label": "Digit Padding",
      "type": "select",
      "defaultValue": "6",
      "options": [
        {
          "label": "6 Digits (DOC-000001)",
          "value": "6"
        },
        {
          "label": "4 Digits (DOC-0001)",
          "value": "4"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "custom-format-numberer",
  "name": "Custom Format Numberer",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Format page numbers with custom templates like \"Page X of Y\" or \"Doc # - P1\".",
  "blurb": "Format page numbers with custom templates like \"Page X of Y\" or \"Doc # - P1\".",
  "op": "custom-numbers",
  "proTip": "Include total page count variables so recipients immediately spot missing pages.",
  "params": [
    {
      "id": "format",
      "label": "Format Template",
      "type": "text",
      "defaultValue": "Page {n} of {total}",
      "placeholder": "Page {n} of {total}"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "start-at-page-number",
  "name": "Start at Page Number",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Skip cover pages or start numbering sequence at an arbitrary custom index.",
  "blurb": "Skip cover pages or start numbering sequence at an arbitrary custom index.",
  "op": "start-number",
  "proTip": "Skip cover and copyright pages so page 1 aligns with Chapter 1.",
  "params": [
    {
      "id": "skipPages",
      "label": "Skip First N Pages",
      "type": "number",
      "defaultValue": 1,
      "min": 0
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "numbering-position-tool",
  "name": "Numbering Position Tool",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Position page numbers precisely at top, bottom, left, right, or alternating edges.",
  "blurb": "Position page numbers precisely at top, bottom, left, right, or alternating edges.",
  "op": "number-position",
  "proTip": "Alternating numbering aligns outer page margins in two-sided booklet printing.",
  "params": [
    {
      "id": "position",
      "label": "Number Position",
      "type": "select",
      "defaultValue": "bottom-center",
      "options": [
        {
          "label": "Bottom Center",
          "value": "bottom-center"
        },
        {
          "label": "Bottom Right",
          "value": "bottom-right"
        },
        {
          "label": "Top Right",
          "value": "top-right"
        },
        {
          "label": "Alternating Outer Edge",
          "value": "alternating"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-running-header-pdf",
  "name": "Add Running Header",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Place document titles, chapter names, or confidentiality notices at top margins.",
  "blurb": "Place document titles, chapter names, or confidentiality notices at top margins.",
  "op": "add-header",
  "proTip": "Running headers help readers maintain orientation in long technical manuals.",
  "params": [
    {
      "id": "headerText",
      "label": "Header Text",
      "type": "text",
      "defaultValue": "CONFIDENTIAL EXECUTIVE BRIEFING",
      "placeholder": "Header text"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-running-footer-pdf",
  "name": "Add Running Footer",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Add copyright notices, company names, or distribution disclaimers at page footers.",
  "blurb": "Add copyright notices, company names, or distribution disclaimers at page footers.",
  "op": "add-footer",
  "proTip": "Include copyright notices and confidentiality disclaimers on every page footer.",
  "params": [
    {
      "id": "footerText",
      "label": "Footer Notice",
      "type": "text",
      "defaultValue": "© 2026 Vimz.ai — All Rights Reserved",
      "placeholder": "Footer notice"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "edit-headers-and-footers",
  "name": "Edit Headers and Footers",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Update existing header labels or change font sizing and positioning.",
  "blurb": "Update existing header labels or change font sizing and positioning.",
  "op": "edit-header-footer",
  "proTip": "Easily update recurring document headers when revising corporate templates.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "date-timestamp-footer",
  "name": "Date Timestamp Footer",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Stamp current date, time, or document version onto bottom page margins.",
  "blurb": "Stamp current date, time, or document version onto bottom page margins.",
  "op": "date-footer",
  "proTip": "Ensures printed meeting handouts reflect the most current document version.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "legal-bates-stamper",
  "name": "Legal Bates Stamper",
  "sub": "Page Numbering, Header & Footer",
  "icon": "Hash",
  "description": "Specialized legal Bates stamper with confidentiality designations and indexing.",
  "blurb": "Specialized legal Bates stamper with confidentiality designations and indexing.",
  "op": "bates-numbering",
  "proTip": "Applies automated zero-padded Bates serials required in litigation discovery.",
  "params": [
    {
      "id": "batesPrefix",
      "label": "Litigation Prefix",
      "type": "text",
      "defaultValue": "EXHIBIT-A-",
      "placeholder": "EXHIBIT-A-"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "create-pdf-table-of-contents",
  "name": "Create Table of Contents",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Generate a structured, clickable table of contents page with page references.",
  "blurb": "Generate a structured, clickable table of contents page with page references.",
  "op": "create-toc",
  "proTip": "Automates chapter titles and page numbering into a clean table layout.",
  "params": [
    {
      "id": "tocTitle",
      "label": "Table of Contents Title",
      "type": "text",
      "defaultValue": "Table of Contents",
      "placeholder": "Title"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "add-pdf-bookmark",
  "name": "Add PDF Bookmark",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Insert hierarchical outline bookmarks for easy sidebar navigation in PDF readers.",
  "blurb": "Insert hierarchical outline bookmarks for easy sidebar navigation in PDF readers.",
  "op": "add-bookmark",
  "proTip": "Bookmarks allow readers to jump directly to chapters in mobile PDF readers.",
  "params": [
    {
      "id": "bookmarkTitle",
      "label": "Bookmark Title",
      "type": "text",
      "defaultValue": "Chapter 1: Overview",
      "placeholder": "Title"
    },
    {
      "id": "targetPage",
      "label": "Destination Page",
      "type": "number",
      "defaultValue": 1,
      "min": 1
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "auto-bookmark-generator",
  "name": "Auto Bookmark Generator",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Scan document font sizes and automatically generate outline bookmarks from headings.",
  "blurb": "Scan document font sizes and automatically generate outline bookmarks from headings.",
  "op": "auto-bookmark",
  "proTip": "Detects oversized text headers to construct a multi-level outline in seconds.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-pdf-bookmarks",
  "name": "Remove PDF Bookmarks",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Clear broken, outdated, or unwanted bookmark trees from the document outline.",
  "blurb": "Clear broken, outdated, or unwanted bookmark trees from the document outline.",
  "op": "remove-bookmark",
  "proTip": "Strips cluttered outline links when combining disparate presentation decks.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "edit-bookmark-titles",
  "name": "Edit Bookmark Titles",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Rename bookmarks and reorganize document outline hierarchy.",
  "blurb": "Rename bookmarks and reorganize document outline hierarchy.",
  "op": "edit-bookmark",
  "proTip": "Clean up bookmark names for professional publishing presentation.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "extract-all-bookmarks",
  "name": "Extract All Bookmarks",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Export the complete bookmark navigation tree into structured text or JSON.",
  "blurb": "Export the complete bookmark navigation tree into structured text or JSON.",
  "op": "extract-bookmarks",
  "proTip": "Extracts document outline hierarchy for course syllabus creation.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "nested-bookmark-organizer",
  "name": "Nested Bookmark Organizer",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Organize bookmarks into multi-level parent and child sub-sections.",
  "blurb": "Organize bookmarks into multi-level parent and child sub-sections.",
  "op": "generate-bookmarks",
  "proTip": "Nest sub-sections beneath chapter parents to keep sidebars orderly.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "chapter-bookmark-maker",
  "name": "Chapter Bookmark Maker",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Add primary chapter anchors across lengthy academic theses and manuals.",
  "blurb": "Add primary chapter anchors across lengthy academic theses and manuals.",
  "op": "chapter-organize",
  "proTip": "Anchors each major chapter heading to its corresponding starting page.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "hyperlinked-table-of-contents",
  "name": "Hyperlinked Table of Contents",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Create clickable in-document links connecting TOC items to target page sections.",
  "blurb": "Create clickable in-document links connecting TOC items to target page sections.",
  "op": "generate-outline",
  "proTip": "Readers can click any chapter entry to navigate instantly to that page.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "bookmark-to-page-linker",
  "name": "Bookmark to Page Linker",
  "sub": "Bookmarks & Table of Contents",
  "icon": "Bookmark",
  "description": "Link existing outline bookmarks to exact page coordinates and zoom levels.",
  "blurb": "Link existing outline bookmarks to exact page coordinates and zoom levels.",
  "op": "link-bookmark",
  "proTip": "Ensures bookmarks zoom precisely into relevant charts upon clicking.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "compare-pdf-side-by-side",
  "name": "Compare PDF Side-by-Side",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "View two PDF documents side by side with synchronized scrolling for visual review.",
  "blurb": "View two PDF documents side by side with synchronized scrolling for visual review.",
  "op": "compare-side-by-side",
  "proTip": "Synchronized dual view allows rapid spot-checking between contract revisions.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "pdf-text-diff-tool",
  "name": "PDF Text Diff Tool",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Detect added, deleted, and modified text between two versions of a document.",
  "blurb": "Detect added, deleted, and modified text between two versions of a document.",
  "op": "diff-text",
  "proTip": "Highlights clause changes and price revisions in contracts automatically.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "pdf-visual-diff-checker",
  "name": "PDF Visual Diff Checker",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Overlay two pages to highlight layout shifts, moved images, and design changes.",
  "blurb": "Overlay two pages to highlight layout shifts, moved images, and design changes.",
  "op": "diff-visual",
  "proTip": "Pixel-level visual overlay detects subtle typographic and margin differences.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "pdf-content-similarity-checker",
  "name": "PDF Content Similarity Checker",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Calculate percentage text similarity between two documents to detect plagiarism.",
  "blurb": "Calculate percentage text similarity between two documents to detect plagiarism.",
  "op": "similarity",
  "proTip": "Computes Levenshtein distance and token similarity across text passages.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "pdf-structure-inspector",
  "name": "PDF Structure Inspector",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Inspect internal PDF object trees, dictionaries, streams, and cross-reference tables.",
  "blurb": "Inspect internal PDF object trees, dictionaries, streams, and cross-reference tables.",
  "op": "structure",
  "proTip": "Reveals internal XREF tables, trailer dictionaries, and stream objects for debugging.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-object-stream-inspector",
  "name": "PDF Object Stream Inspector",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Analyze compressed object streams and indirect references inside the PDF.",
  "blurb": "Analyze compressed object streams and indirect references inside the PDF.",
  "op": "structure",
  "proTip": "Inspects compressed ObjStm structures introduced in modern PDF 1.5+ specs.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-font-analyzer",
  "name": "PDF Font Analyzer",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Inspect all font families, encoding types, subset prefixes, and glyph mappings.",
  "blurb": "Inspect all font families, encoding types, subset prefixes, and glyph mappings.",
  "op": "font-check",
  "proTip": "Checks whether fonts are fully embedded or subsetted for cross-platform fidelity.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-color-profile-analyzer",
  "name": "PDF Color Profile Analyzer",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Check whether pages use RGB, CMYK, DeviceGray, or ICC color profiles.",
  "blurb": "Check whether pages use RGB, CMYK, DeviceGray, or ICC color profiles.",
  "op": "color-analyze",
  "proTip": "Verifies CMYK color space compliance required by commercial offset printers.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-dpi-checker",
  "name": "PDF DPI Checker",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Audit the resolution (DPI) of all embedded raster images in your PDF.",
  "blurb": "Audit the resolution (DPI) of all embedded raster images in your PDF.",
  "op": "dpi-check",
  "proTip": "Images under 300 DPI are flagged to prevent blurry, low-res printouts.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-file-info-inspector",
  "name": "PDF File Info Inspector",
  "sub": "PDF Comparison & Inspection",
  "icon": "GitCompare",
  "description": "Detailed technical overview: PDF specification version, page boxes, and file size.",
  "blurb": "Detailed technical overview: PDF specification version, page boxes, and file size.",
  "op": "file-info",
  "proTip": "Displays MediaBox, CropBox, BleedBox, and TrimBox coordinates for prepress validation.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-optimizer-tool",
  "name": "PDF Optimizer",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "All-in-one optimizer: compress streams, purge orphaned objects, and downsample images.",
  "blurb": "All-in-one optimizer: compress streams, purge orphaned objects, and downsample images.",
  "op": "batch-compress",
  "proTip": "Achieves balanced file size reduction while preserving crisp vector line art.",
  "params": [
    {
      "id": "targetQuality",
      "label": "Optimization Balance",
      "type": "select",
      "defaultValue": "balanced",
      "options": [
        {
          "label": "Balanced (Recommended)",
          "value": "balanced"
        },
        {
          "label": "Maximum Compression",
          "value": "max"
        },
        {
          "label": "High Fidelity",
          "value": "hq"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-stream-compressor",
  "name": "PDF Stream Compressor",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Apply FlateDecode lossless compression to uncompressed text and vector streams.",
  "blurb": "Apply FlateDecode lossless compression to uncompressed text and vector streams.",
  "op": "optimize-stream",
  "proTip": "Squeezes raw PDF content streams without any visual degradation.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-image-downsampler",
  "name": "PDF Image Downsampler",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Resample oversized 600 DPI images down to print-friendly 150 or 300 DPI.",
  "blurb": "Resample oversized 600 DPI images down to print-friendly 150 or 300 DPI.",
  "op": "optimize-images",
  "proTip": "Downsampling massive phone photos slashes PDF megabytes instantly.",
  "params": [
    {
      "id": "targetDpi",
      "label": "Target Image DPI",
      "type": "select",
      "defaultValue": "150",
      "options": [
        {
          "label": "Screen / Web (150 DPI)",
          "value": "150"
        },
        {
          "label": "Office Print (300 DPI)",
          "value": "300"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-unused-pdf-objects",
  "name": "Remove Unused PDF Objects",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Garbage-collect unreferenced fonts, orphan images, and dead bookmarks.",
  "blurb": "Garbage-collect unreferenced fonts, orphan images, and dead bookmarks.",
  "op": "dedup-objects",
  "proTip": "Removes orphaned objects left behind by repeated desktop PDF edits.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-linearization-tool",
  "name": "PDF Fast Web View Optimizer",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Linearize PDF for Fast Web View so page 1 displays before the rest downloads.",
  "blurb": "Linearize PDF for Fast Web View so page 1 displays before the rest downloads.",
  "op": "optimize-stream",
  "proTip": "Required for responsive mobile browser viewing of multi-megabyte catalogs.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "repair-corrupted-pdf",
  "name": "Repair Corrupted PDF",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Reconstruct broken cross-reference tables (XREF), damaged trailers, and invalid streams.",
  "blurb": "Reconstruct broken cross-reference tables (XREF), damaged trailers, and invalid streams.",
  "op": "repair-corrupt",
  "proTip": "Recovers access to PDFs corrupted during incomplete downloads or crashes.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-syntax-validator",
  "name": "PDF Syntax Validator",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Inspect document bytecode against ISO 32000 PDF specifications.",
  "blurb": "Inspect document bytecode against ISO 32000 PDF specifications.",
  "op": "validate-syntax",
  "proTip": "Catches syntax formatting errors that cause Acrobat Reader to fail opening files.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-health-diagnostic",
  "name": "PDF Health Diagnostic",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Run comprehensive integrity checks and generate a document health scorecard.",
  "blurb": "Run comprehensive integrity checks and generate a document health scorecard.",
  "op": "health-check",
  "proTip": "Flags missing fonts, uncompressed streams, and invalid page dimensions.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-font-subsetter",
  "name": "PDF Font Subsetter",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Prune unused glyphs from embedded fonts to reduce typography file footprint.",
  "blurb": "Prune unused glyphs from embedded fonts to reduce typography file footprint.",
  "op": "font-check",
  "proTip": "Removes thousands of unused Unicode glyphs from full font families.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-deduplication-engine",
  "name": "PDF Resource Deduplicator",
  "sub": "PDF Optimization & Repair",
  "icon": "Wrench",
  "description": "Detect identical duplicate images, logos, and fonts across pages and merge references.",
  "blurb": "Detect identical duplicate images, logos, and fonts across pages and merge references.",
  "op": "dedup-objects",
  "proTip": "Shared header logos are merged to point to a single cached image object.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "wcag-accessibility-checker",
  "name": "WCAG Accessibility Checker",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Check WCAG 2.1 AA and Section 508 accessibility compliance.",
  "blurb": "Check WCAG 2.1 AA and Section 508 accessibility compliance.",
  "op": "accessible-check",
  "proTip": "Audits heading hierarchy, alt text, and language tags for screen reader users.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-ua-accessibility-validator",
  "name": "PDF/UA Accessibility Validator",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Validate ISO 14289 PDF/UA universal accessibility standards.",
  "blurb": "Validate ISO 14289 PDF/UA universal accessibility standards.",
  "op": "ua-check",
  "proTip": "Ensures structured reading tags exist for assistive technology readers.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "screen-reader-preview-pdf",
  "name": "Screen Reader Simulation",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Simulate the exact text reading sequence encountered by assistive technologies.",
  "blurb": "Simulate the exact text reading sequence encountered by assistive technologies.",
  "op": "extract-text",
  "proTip": "Exposes inverted reading orders caused by absolute-positioned vector columns.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-tag-tree-inspector",
  "name": "PDF Tag Tree Inspector",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Inspect semantic tags (H1, P, Table, Caption) inside the document structure.",
  "blurb": "Inspect semantic tags (H1, P, Table, Caption) inside the document structure.",
  "op": "structure",
  "proTip": "Verifies proper structural tagging required for accessible publication.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "alt-text-checker-pdf",
  "name": "Alt Text Checker",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Verify that every embedded image has descriptive alternate text.",
  "blurb": "Verify that every embedded image has descriptive alternate text.",
  "op": "accessible-check",
  "proTip": "Identifies missing alt attributes that fail public school and government accessibility audits.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "tab-order-accessibility-checker",
  "name": "Tab Order Validator",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Validate logical keyboard tab navigation order across interactive form fields.",
  "blurb": "Validate logical keyboard tab navigation order across interactive form fields.",
  "op": "create-form",
  "proTip": "Ensures keyboard-only users tab through fields in natural reading order.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "reading-order-editor",
  "name": "Reading Order Inspector",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Inspect and adjust sequential reading order for multi-column academic layouts.",
  "blurb": "Inspect and adjust sequential reading order for multi-column academic layouts.",
  "op": "extract-text",
  "proTip": "Prevents screen readers from reading across column gutters inappropriately.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "document-language-tag-validator",
  "name": "Document Language Tag Validator",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Verify presence and format of ISO 639 document language declarations.",
  "blurb": "Verify presence and format of ISO 639 document language declarations.",
  "op": "accessible-check",
  "proTip": "Ensures text-to-speech synthesizers select the correct pronunciation accent.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "color-contrast-checker-pdf",
  "name": "Color Contrast Checker",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Audit text-to-background contrast ratios against WCAG 4.5:1 minimums.",
  "blurb": "Audit text-to-background contrast ratios against WCAG 4.5:1 minimums.",
  "op": "color-analyze",
  "proTip": "Flags faint grey text on white backgrounds that fails visual contrast checks.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "accessible-form-elements-auditor",
  "name": "Accessible Form Elements Auditor",
  "sub": "PDF Accessibility & Standards",
  "icon": "CheckSquare",
  "description": "Verify form fields possess explicit accessibility names and tooltips.",
  "blurb": "Verify form fields possess explicit accessibility names and tooltips.",
  "op": "create-form",
  "proTip": "Ensures screen readers announce input purpose when entering form fields.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-pdf-key-points",
  "name": "AI Key Points Extractor",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Extract critical takeaways, core conclusions, and bullet highlights instantly.",
  "blurb": "Extract critical takeaways, core conclusions, and bullet highlights instantly.",
  "op": "ai-key-points",
  "proTip": "Synthesizes dense multi-page reports into actionable executive bullets.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-pdf-qa-tool",
  "name": "AI PDF Q&A",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Ask questions about your document and get verified answers with citations.",
  "blurb": "Ask questions about your document and get verified answers with citations.",
  "op": "ai-qa",
  "proTip": "Answers are synthesized directly from on-device text layers without cloud uploads.",
  "params": [
    {
      "id": "question",
      "label": "Your Question",
      "type": "text",
      "defaultValue": "What are the main findings and conclusions?",
      "placeholder": "Ask anything about the document..."
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-pdf-chat",
  "name": "AI PDF Interactive Chat",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Converse interactively with long contracts, books, and financial reports.",
  "blurb": "Converse interactively with long contracts, books, and financial reports.",
  "op": "ai-chat",
  "proTip": "Engage in multi-turn conversational exploration of complex documentation.",
  "params": [
    {
      "id": "prompt",
      "label": "Message",
      "type": "text",
      "defaultValue": "Explain the methodology used in this document.",
      "placeholder": "Type your message..."
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-pdf-translator",
  "name": "AI PDF Translator",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Translate document paragraphs into Spanish, French, German, Arabic, or Urdu.",
  "blurb": "Translate document paragraphs into Spanish, French, German, Arabic, or Urdu.",
  "op": "ai-translate",
  "proTip": "Processes translation client-side in your browser for absolute data confidentiality.",
  "params": [
    {
      "id": "targetLang",
      "label": "Target Language",
      "type": "select",
      "defaultValue": "es",
      "options": [
        {
          "label": "Spanish",
          "value": "es"
        },
        {
          "label": "French",
          "value": "fr"
        },
        {
          "label": "German",
          "value": "de"
        },
        {
          "label": "Arabic",
          "value": "ar"
        },
        {
          "label": "Urdu",
          "value": "ur"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-pdf-rewriter",
  "name": "AI PDF Rewriter",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Rewrite text into formal executive, casual, or technical tone.",
  "blurb": "Rewrite text into formal executive, casual, or technical tone.",
  "op": "ai-rewrite",
  "proTip": "Polishes rough drafts into executive-ready corporate communication.",
  "params": [
    {
      "id": "tone",
      "label": "Target Tone",
      "type": "select",
      "defaultValue": "executive",
      "options": [
        {
          "label": "Executive Formal",
          "value": "executive"
        },
        {
          "label": "Clear & Simple",
          "value": "simple"
        },
        {
          "label": "Technical Precision",
          "value": "technical"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-pdf-simplifier",
  "name": "AI PDF Simplifier",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Translate complex legalese, medical jargon, and academic prose into plain language.",
  "blurb": "Translate complex legalese, medical jargon, and academic prose into plain language.",
  "op": "ai-simplify",
  "proTip": "Demystifies dense insurance policies and terms of service into plain English.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-pdf-outline-generator",
  "name": "AI PDF Outline Generator",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Synthesize an executive outline highlighting sections, arguments, and proof points.",
  "blurb": "Synthesize an executive outline highlighting sections, arguments, and proof points.",
  "op": "ai-outline",
  "proTip": "Ideal for preparing meeting briefing notes from lengthy policy papers.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-study-notes-generator-pdf",
  "name": "AI Study Notes Generator",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Transform textbook chapters and lecture slides into organized study guides.",
  "blurb": "Transform textbook chapters and lecture slides into organized study guides.",
  "op": "ai-study-notes",
  "proTip": "Organizes textbook readings into definitions, formulas, and memory anchors.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-flashcard-generator-pdf",
  "name": "AI Flashcard Generator",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Generate active recall question-and-answer flashcard decks from reading material.",
  "blurb": "Generate active recall question-and-answer flashcard decks from reading material.",
  "op": "ai-flashcards",
  "proTip": "Extracts core definitions and concept pairs ready for exam cramming.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-quiz-generator-pdf",
  "name": "AI Quiz Generator",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Create multiple-choice practice quizzes from uploaded PDF study material.",
  "blurb": "Create multiple-choice practice quizzes from uploaded PDF study material.",
  "op": "ai-quiz",
  "proTip": "Generates four-option practice questions with verified answer explanations.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-question-paper-generator-pdf",
  "name": "AI Question Paper Generator",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Compile formal practice examination papers with sectioned point allocations.",
  "blurb": "Compile formal practice examination papers with sectioned point allocations.",
  "op": "ai-exam",
  "proTip": "Formats questions into standardized section A, B, and C exam papers.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-action-items-extractor",
  "name": "AI Action Items Extractor",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Detect assigned tasks, deadlines, and deliverables from meeting minutes.",
  "blurb": "Detect assigned tasks, deadlines, and deliverables from meeting minutes.",
  "op": "ai-actions",
  "proTip": "Compiles actionable task lists with responsible assignees from meeting notes.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-important-dates-extractor",
  "name": "AI Important Dates Extractor",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Extract all milestones, contract renewal dates, and deadlines into a timeline.",
  "blurb": "Extract all milestones, contract renewal dates, and deadlines into a timeline.",
  "op": "ai-dates",
  "proTip": "Prevents missed contract renewal windows and regulatory filing deadlines.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "ai-important-names-extractor",
  "name": "AI Entity & Names Extractor",
  "sub": "AI PDF Tools",
  "icon": "Sparkles",
  "description": "Extract company names, key executives, stakeholders, and governing bodies.",
  "blurb": "Extract company names, key executives, stakeholders, and governing bodies.",
  "op": "ai-entities",
  "proTip": "Builds organized stakeholder rosters from dense legal filings.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "webpage-to-pdf",
  "name": "Webpage to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Convert live webpages and articles into formatted, printable PDF documents.",
  "blurb": "Convert live webpages and articles into formatted, printable PDF documents.",
  "op": "web-pdf",
  "proTip": "Enter any public URL to compile complete webpage articles into clean PDFs.",
  "params": [
    {
      "id": "url",
      "label": "Webpage URL",
      "type": "text",
      "defaultValue": "https://example.com",
      "placeholder": "https://example.com"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "website-screenshot-to-pdf",
  "name": "Website Screenshot to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Render full-page visual webpage snapshots into scalable PDF sheets.",
  "blurb": "Render full-page visual webpage snapshots into scalable PDF sheets.",
  "op": "screenshot-pdf",
  "proTip": "Captures full scrollable webpage screenshots preserving exact visual layout.",
  "params": [
    {
      "id": "url",
      "label": "Target Webpage URL",
      "type": "text",
      "defaultValue": "https://example.com",
      "placeholder": "https://..."
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "web-article-to-pdf",
  "name": "Web Article to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Reader mode: strip ads and banners, converting pure article text into clean PDF.",
  "blurb": "Reader mode: strip ads and banners, converting pure article text into clean PDF.",
  "op": "article-pdf",
  "proTip": "Strips cookie banners and navigation menus for clean, readable paper prints.",
  "params": [
    {
      "id": "url",
      "label": "Article URL",
      "type": "text",
      "defaultValue": "https://example.com/article",
      "placeholder": "https://..."
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "webpage-archive-pdf",
  "name": "Webpage Archive PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Capture timestamped offline archival snapshots of web pages.",
  "blurb": "Capture timestamped offline archival snapshots of web pages.",
  "op": "archive-pdf",
  "proTip": "Includes automated retrieval timestamp headers for legal evidence preservation.",
  "params": [
    {
      "id": "url",
      "label": "Archive URL",
      "type": "text",
      "defaultValue": "https://example.com",
      "placeholder": "https://..."
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "multiple-urls-to-pdf",
  "name": "Multiple URLs to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Batch scrape and merge multiple webpage links into a unified PDF binder.",
  "blurb": "Batch scrape and merge multiple webpage links into a unified PDF binder.",
  "op": "multi-url-pdf",
  "proTip": "Combines multiple online documentation chapters into a single manual.",
  "params": [
    {
      "id": "urlList",
      "label": "URLs (one per line)",
      "type": "textarea",
      "defaultValue": "https://example.com/page1\nhttps://example.com/page2",
      "placeholder": "Enter URLs..."
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "blog-post-to-pdf",
  "name": "Blog Post to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Format blog articles with cover images and responsive typography for archiving.",
  "blurb": "Format blog articles with cover images and responsive typography for archiving.",
  "op": "blog-pdf",
  "proTip": "Applies elegant editorial font styling with formatted author bylines.",
  "params": [
    {
      "id": "url",
      "label": "Blog Article URL",
      "type": "text",
      "defaultValue": "https://example.com/blog",
      "placeholder": "https://..."
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "email-to-pdf-web",
  "name": "Email to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Convert saved email message transcripts (.eml or text) into clean PDF records.",
  "blurb": "Convert saved email message transcripts (.eml or text) into clean PDF records.",
  "op": "email-pdf",
  "proTip": "Preserves sender, recipient, timestamp headers, and subject lines cleanly.",
  "params": [],
  "accept": ".txt,.eml",
  "multiple": false
},
  {
  "id": "rss-feed-to-pdf",
  "name": "RSS Feed to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Compile latest RSS feed news stories into an offline daily morning digest.",
  "blurb": "Compile latest RSS feed news stories into an offline daily morning digest.",
  "op": "web-pdf",
  "proTip": "Compiles top industry RSS headlines into a printable morning brief.",
  "params": [
    {
      "id": "rssUrl",
      "label": "RSS Feed URL",
      "type": "text",
      "defaultValue": "https://example.com/feed.xml",
      "placeholder": "Feed URL"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "documentation-to-pdf",
  "name": "Documentation to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Compile online API reference documentation pages into an offline PDF handbook.",
  "blurb": "Compile online API reference documentation pages into an offline PDF handbook.",
  "op": "web-pdf",
  "proTip": "Formats technical code snippets with syntax highlighting inside page margins.",
  "params": [
    {
      "id": "docUrl",
      "label": "Documentation Home URL",
      "type": "text",
      "defaultValue": "https://example.com/docs",
      "placeholder": "Docs URL"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "social-post-to-pdf",
  "name": "Social Post to PDF",
  "sub": "Web & URL to PDF",
  "icon": "Globe",
  "description": "Format public social media posts and comment threads into evidentiary PDFs.",
  "blurb": "Format public social media posts and comment threads into evidentiary PDFs.",
  "op": "web-pdf",
  "proTip": "Preserves post timestamps, verified handles, and engagement metrics.",
  "params": [
    {
      "id": "postUrl",
      "label": "Post URL",
      "type": "text",
      "defaultValue": "https://twitter.com/example/status/1",
      "placeholder": "Post URL"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-print-layout",
  "name": "PDF Print Layout",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Configure print margins, binding gutters, bleeds, and sheet orientations.",
  "blurb": "Configure print margins, binding gutters, bleeds, and sheet orientations.",
  "op": "print-layout",
  "proTip": "Add 15mm binding gutters so booklet bindings never pinch printed words.",
  "params": [
    {
      "id": "gutterMm",
      "label": "Binding Gutter (mm)",
      "type": "slider",
      "defaultValue": 12,
      "min": 0,
      "max": 30,
      "step": 2
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "multiple-pages-per-sheet-print",
  "name": "N-Up Pages per Sheet Impose",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Place 2, 4, 6, 8, 9, or 16 PDF pages onto a single sheet for handout printing.",
  "blurb": "Place 2, 4, 6, 8, 9, or 16 PDF pages onto a single sheet for handout printing.",
  "op": "nup-pages",
  "proTip": "Printing 2 or 4 pages per sheet reduces paper consumption and filing space.",
  "params": [
    {
      "id": "nup",
      "label": "Pages Per Sheet",
      "type": "select",
      "defaultValue": "2",
      "options": [
        {
          "label": "2 Pages per Sheet (2-Up)",
          "value": "2"
        },
        {
          "label": "4 Pages per Sheet (4-Up)",
          "value": "4"
        },
        {
          "label": "6 Pages per Sheet (6-Up)",
          "value": "6"
        },
        {
          "label": "8 Pages per Sheet (8-Up)",
          "value": "8"
        },
        {
          "label": "9 Pages per Sheet (9-Up)",
          "value": "9"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "booklet-printing",
  "name": "Booklet Printing Maker",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Rearrange PDF pages into saddle-stitch order for foldable booklet printing.",
  "blurb": "Rearrange PDF pages into saddle-stitch order for foldable booklet printing.",
  "op": "booklet-print",
  "proTip": "Prints four page sides per physical sheet ready for folding down the center.",
  "params": [
    {
      "id": "binding",
      "label": "Binding Orientation",
      "type": "select",
      "defaultValue": "left",
      "options": [
        {
          "label": "Left Edge (Standard Book)",
          "value": "left"
        },
        {
          "label": "Top Edge (Flip Pad)",
          "value": "top"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "poster-printing",
  "name": "Poster Multi-Sheet Printing",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Split large format pages across standard A4/Letter sheets with alignment guides.",
  "blurb": "Split large format pages across standard A4/Letter sheets with alignment guides.",
  "op": "poster-print",
  "proTip": "Print oversized banners on regular desktop printers with overlap margins for taping.",
  "params": [
    {
      "id": "tilingGrid",
      "label": "Poster Grid Size",
      "type": "select",
      "defaultValue": "2x2",
      "options": [
        {
          "label": "2x2 Sheets (4x Area)",
          "value": "2x2"
        },
        {
          "label": "3x3 Sheets (9x Area)",
          "value": "3x3"
        },
        {
          "label": "4x4 Sheets (16x Area)",
          "value": "4x4"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "print-margin-calculator-pdf",
  "name": "Print Margin Calculator",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Calculate exact binding margins, spiral punch gutters, and bleed boundaries.",
  "blurb": "Calculate exact binding margins, spiral punch gutters, and bleed boundaries.",
  "op": "print-margins",
  "proTip": "Calculates standard spiral punch and comb binding gutter allowances.",
  "params": [
    {
      "id": "bindingType",
      "label": "Binding Style",
      "type": "select",
      "defaultValue": "spiral",
      "options": [
        {
          "label": "Spiral Coil (12mm)",
          "value": "spiral"
        },
        {
          "label": "3-Ring Binder (20mm)",
          "value": "3ring"
        },
        {
          "label": "Comb Binding (10mm)",
          "value": "comb"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "a4-to-letter-converter",
  "name": "Standard Paper Size Converter",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Convert documents seamlessly between A4, US Letter, US Legal, and A3 formats.",
  "blurb": "Convert documents seamlessly between A4, US Letter, US Legal, and A3 formats.",
  "op": "a4-letter",
  "proTip": "Resizes document bounding boxes proportionally without clipping text margins.",
  "params": [
    {
      "id": "targetFormat",
      "label": "Target Paper Size",
      "type": "select",
      "defaultValue": "letter",
      "options": [
        {
          "label": "US Letter (8.5 x 11 in)",
          "value": "letter"
        },
        {
          "label": "ISO A4 (210 x 297 mm)",
          "value": "a4"
        },
        {
          "label": "US Legal (8.5 x 14 in)",
          "value": "legal"
        },
        {
          "label": "ISO A3 (297 x 420 mm)",
          "value": "a3"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "custom-page-size-pdf",
  "name": "Custom Page Size Tool",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Set custom millimetre, centimetre, or inch dimensions for specialty printing.",
  "blurb": "Set custom millimetre, centimetre, or inch dimensions for specialty printing.",
  "op": "custom-size",
  "proTip": "Specify exact paper dimensions for custom photo prints and envelopes.",
  "params": [
    {
      "id": "widthMm",
      "label": "Width (mm)",
      "type": "number",
      "defaultValue": 210,
      "min": 50,
      "max": 1000
    },
    {
      "id": "heightMm",
      "label": "Height (mm)",
      "type": "number",
      "defaultValue": 297,
      "min": 50,
      "max": 1000
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "two-sided-duplex-print-helper",
  "name": "Duplex Printing Helper",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Organize odd and even pages to streamline manual two-sided desktop printing.",
  "blurb": "Organize odd and even pages to streamline manual two-sided desktop printing.",
  "op": "extract-pages",
  "proTip": "Prints all odd pages first, then prompt to flip paper stack for even pages.",
  "params": [
    {
      "id": "batch",
      "label": "Page Selection",
      "type": "select",
      "defaultValue": "odd",
      "options": [
        {
          "label": "Odd Pages Only (Fronts)",
          "value": "odd"
        },
        {
          "label": "Even Pages Only (Backs)",
          "value": "even"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "crop-marks-printer-tool",
  "name": "Crop Marks & Bleed Printer",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Embed professional offset crop marks and color calibration bars on page margins.",
  "blurb": "Embed professional offset crop marks and color calibration bars on page margins.",
  "op": "page-margins",
  "proTip": "Includes trim guides essential for commercial guillotine cutting machines.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "foldable-brochure-maker",
  "name": "Foldable Brochure Maker",
  "sub": "Print & Layout Tools",
  "icon": "Printer",
  "description": "Impose pages into tri-fold and bi-fold brochure layouts with center fold guides.",
  "blurb": "Impose pages into tri-fold and bi-fold brochure layouts with center fold guides.",
  "op": "booklet-maker",
  "proTip": "Creates balanced three-panel marketing brochures ready for desktop printing.",
  "params": [
    {
      "id": "foldType",
      "label": "Brochure Style",
      "type": "select",
      "defaultValue": "trifold",
      "options": [
        {
          "label": "Tri-Fold (6 Panels)",
          "value": "trifold"
        },
        {
          "label": "Bi-Fold (4 Panels)",
          "value": "bifold"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "batch-pdf-merge",
  "name": "Batch PDF Merge",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Merge dozens of PDF files into a single consolidated document in seconds.",
  "blurb": "Merge dozens of PDF files into a single consolidated document in seconds.",
  "op": "batch-merge",
  "proTip": "Drag and reorder files in the queue before merging to lock in page sequence.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-compress",
  "name": "Batch PDF Compress",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Compress multiple PDF files simultaneously and download them in a single ZIP.",
  "blurb": "Compress multiple PDF files simultaneously and download them in a single ZIP.",
  "op": "batch-compress",
  "proTip": "Compress entire directories of scanned contracts in one automated pass.",
  "params": [
    {
      "id": "quality",
      "label": "Image Quality",
      "type": "slider",
      "defaultValue": 75,
      "min": 40,
      "max": 95,
      "step": 5
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-convert",
  "name": "Batch PDF Convert",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Convert a batch of PDFs into PNG, JPG, or WebP images in one click.",
  "blurb": "Convert a batch of PDFs into PNG, JPG, or WebP images in one click.",
  "op": "batch-convert",
  "proTip": "Exports all converted page images into organized per-file folders inside a ZIP.",
  "params": [
    {
      "id": "format",
      "label": "Target Image Format",
      "type": "select",
      "defaultValue": "png",
      "options": [
        {
          "label": "PNG Images",
          "value": "png"
        },
        {
          "label": "JPEG Images",
          "value": "jpg"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-rename",
  "name": "Batch PDF Rename",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Rename multiple PDF files using customized numbering patterns and timestamps.",
  "blurb": "Rename multiple PDF files using customized numbering patterns and timestamps.",
  "op": "batch-rename",
  "proTip": "Pattern variables like {index}, {date}, and {name} keep case files standardized.",
  "params": [
    {
      "id": "pattern",
      "label": "Rename Pattern",
      "type": "text",
      "defaultValue": "Invoice_{index}_{date}",
      "placeholder": "Pattern"
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-watermark",
  "name": "Batch PDF Watermark",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Apply corporate logo or confidential text watermarks across multiple PDFs.",
  "blurb": "Apply corporate logo or confidential text watermarks across multiple PDFs.",
  "op": "batch-watermark",
  "proTip": "Protects client batches by stamping consistent security notices on every page.",
  "params": [
    {
      "id": "watermarkText",
      "label": "Watermark Text",
      "type": "text",
      "defaultValue": "CONFIDENTIAL",
      "placeholder": "Watermark"
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-numbering",
  "name": "Batch PDF Numbering",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Apply continuous page numbers or Bates numbering across a batch of documents.",
  "blurb": "Apply continuous page numbers or Bates numbering across a batch of documents.",
  "op": "batch-number",
  "proTip": "Consecutive legal numbering flows seamlessly from document 1 through document N.",
  "params": [
    {
      "id": "prefix",
      "label": "Prefix",
      "type": "text",
      "defaultValue": "EXHIBIT-",
      "placeholder": "Prefix"
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-rotate",
  "name": "Batch PDF Rotate",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Rotate orientation of all pages across multiple PDF files simultaneously.",
  "blurb": "Rotate orientation of all pages across multiple PDF files simultaneously.",
  "op": "batch-rotate",
  "proTip": "Quickly fixes orientation on batches of inverted flatbed scanner files.",
  "params": [
    {
      "id": "angle",
      "label": "Rotation Angle",
      "type": "select",
      "defaultValue": "90",
      "options": [
        {
          "label": "90° Clockwise",
          "value": "90"
        },
        {
          "label": "180° Invert",
          "value": "180"
        },
        {
          "label": "270° Counter-Clockwise",
          "value": "270"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-split",
  "name": "Batch PDF Split",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Split multiple PDF documents into individual single-page files and ZIP.",
  "blurb": "Split multiple PDF documents into individual single-page files and ZIP.",
  "op": "batch-split",
  "proTip": "Splits multi-document queues into standalone pages automatically.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-password-protect",
  "name": "Batch PDF Password Protect",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Encrypt multiple sensitive documents with security passwords in one click.",
  "blurb": "Encrypt multiple sensitive documents with security passwords in one click.",
  "op": "batch-protect",
  "proTip": "Applies uniform encryption across financial archives prior to cloud backup.",
  "params": [
    {
      "id": "password",
      "label": "Protection Password",
      "type": "text",
      "defaultValue": "",
      "placeholder": "Password"
    }
  ],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-unlock",
  "name": "Batch PDF Unlock",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Decrypt multiple password-protected PDFs simultaneously using master passwords.",
  "blurb": "Decrypt multiple password-protected PDFs simultaneously using master passwords.",
  "op": "batch-unlock",
  "proTip": "Unlocks password-protected monthly statements in batch for archiving.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-ocr",
  "name": "Batch PDF OCR",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Run OCR on multiple scanned documents to embed searchable text layers.",
  "blurb": "Run OCR on multiple scanned documents to embed searchable text layers.",
  "op": "batch-ocr",
  "proTip": "Processes multi-file document queues locally without external upload fees.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-metadata-cleaner",
  "name": "Batch PDF Metadata Cleaner",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Sanitize author details, editing histories, and software traces from multiple PDFs.",
  "blurb": "Sanitize author details, editing histories, and software traces from multiple PDFs.",
  "op": "batch-clean-meta",
  "proTip": "Wipes metadata traces across all project deliverables before client handoff.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "batch-pdf-image-extraction",
  "name": "Batch PDF Image Extraction",
  "sub": "Batch PDF Utilities",
  "icon": "Boxes",
  "description": "Extract all embedded graphics from multiple PDFs and compile into a single ZIP.",
  "blurb": "Extract all embedded graphics from multiple PDFs and compile into a single ZIP.",
  "op": "batch-extract-img",
  "proTip": "Extracts every embedded raster image across a folder of PDFs into a clean archive.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "pdf-metadata-viewer",
  "name": "PDF Metadata & Properties Viewer",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Inspect all embedded metadata fields: Title, Author, Subject, Creator, Producer, and Dates.",
  "blurb": "Inspect all embedded metadata fields: Title, Author, Subject, Creator, Producer, and Dates.",
  "op": "view-meta",
  "proTip": "Shows detailed creation timestamps and software signatures for forensic audits.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "edit-pdf-metadata",
  "name": "Edit PDF Metadata Suite",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Modify Title, Author, Subject, Keywords, and Producer properties in-browser.",
  "blurb": "Modify Title, Author, Subject, Keywords, and Producer properties in-browser.",
  "op": "edit-meta",
  "proTip": "Adding keyword tags improves indexing when publishing documents on the web.",
  "params": [
    {
      "id": "title",
      "label": "Document Title",
      "type": "text",
      "defaultValue": "Official Report",
      "placeholder": "Title"
    },
    {
      "id": "author",
      "label": "Author Name",
      "type": "text",
      "defaultValue": "Vimz Author",
      "placeholder": "Author"
    },
    {
      "id": "subject",
      "label": "Subject / Description",
      "type": "text",
      "defaultValue": "Executive Briefing",
      "placeholder": "Subject"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "remove-pdf-metadata-doc",
  "name": "Remove PDF Metadata",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Purge all author names, editing tools, and timestamp headers from document properties.",
  "blurb": "Purge all author names, editing tools, and timestamp headers from document properties.",
  "op": "remove-meta-doc",
  "proTip": "Strips digital footprints before sharing sensitive files externally.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "document-properties-editor",
  "name": "Document Properties Editor",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Advanced catalog editor: configure PDF version flags, page labels, and viewer preferences.",
  "blurb": "Advanced catalog editor: configure PDF version flags, page labels, and viewer preferences.",
  "op": "edit-props",
  "proTip": "Configure default opening zoom and sidebar navigation behavior.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-reading-statistics-tool",
  "name": "PDF Reading Statistics Dashboard",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Detailed word count, character count, page count, and estimated reading time.",
  "blurb": "Detailed word count, character count, page count, and estimated reading time.",
  "op": "stats",
  "proTip": "Provides comprehensive text metrics for publishing schedules and editorial planning.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-font-list-inspector",
  "name": "PDF Font List Inspector",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Enumerate all embedded and external font references with encoding details.",
  "blurb": "Enumerate all embedded and external font references with encoding details.",
  "op": "font-check",
  "proTip": "Identifies non-embedded system fonts that may render incorrectly on other devices.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-color-space-inspector",
  "name": "PDF Color Space Inspector",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Inspect color spaces (RGB, CMYK, DeviceGray) and embedded ICC color profiles.",
  "blurb": "Inspect color spaces (RGB, CMYK, DeviceGray) and embedded ICC color profiles.",
  "op": "color-analyze",
  "proTip": "Validates prepress color space separation for commercial print shops.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-version-compatibility-info",
  "name": "PDF Version Compatibility Info",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Analyze PDF specification level, feature dependencies, and compatibility ratings.",
  "blurb": "Analyze PDF specification level, feature dependencies, and compatibility ratings.",
  "op": "version-check",
  "proTip": "Identifies modern PDF features that may not render on legacy reader devices.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-page-geometry-inspector",
  "name": "PDF Page Geometry Inspector",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Inspect MediaBox, CropBox, BleedBox, and TrimBox coordinates for prepress.",
  "blurb": "Inspect MediaBox, CropBox, BleedBox, and TrimBox coordinates for prepress.",
  "op": "structure",
  "proTip": "Verifies exact millimetre dimensions and bleed areas for commercial printers.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-attachment-list-inspector",
  "name": "PDF Attachment List Inspector",
  "sub": "PDF Metadata & Document Information",
  "icon": "Info",
  "description": "Enumerate embedded file attachments, XML data envelopes, and file sizes.",
  "blurb": "Enumerate embedded file attachments, XML data envelopes, and file sizes.",
  "op": "extract-attachments",
  "proTip": "Inspects embedded file trees and verifies attachment integrity.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdfa-archival-generator",
  "name": "PDF/A Archival Generator",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Convert standard PDF documents into ISO 19005 compliant PDF/A-1b and PDF/A-2b archives.",
  "blurb": "Convert standard PDF documents into ISO 19005 compliant PDF/A-1b and PDF/A-2b archives.",
  "op": "to-pdfa",
  "proTip": "Embeds all font descriptors and color profiles to guarantee visual stability decades later.",
  "params": [
    {
      "id": "standard",
      "label": "Compliance Level",
      "type": "select",
      "defaultValue": "1b",
      "options": [
        {
          "label": "PDF/A-1b (Visual Preservation)",
          "value": "1b"
        },
        {
          "label": "PDF/A-2b (Modern Formats)",
          "value": "2b"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-a-validator-archive",
  "name": "PDF/A Validator",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Validate documents against strict ISO 19005 archival standards.",
  "blurb": "Validate documents against strict ISO 19005 archival standards.",
  "op": "validate-pdfa",
  "proTip": "Checks for forbidden PDF features like external font references and executable scripts.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-version-converter-tool",
  "name": "PDF Version Converter",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Upgrade or downgrade document specifications between PDF 1.4, 1.7, and 2.0.",
  "blurb": "Upgrade or downgrade document specifications between PDF 1.4, 1.7, and 2.0.",
  "op": "version-convert",
  "proTip": "Downgrade modern PDFs for compatibility with older courtroom filing systems.",
  "params": [
    {
      "id": "targetVersion",
      "label": "Target Version",
      "type": "select",
      "defaultValue": "1.7",
      "options": [
        {
          "label": "PDF 1.4 (Legacy)",
          "value": "1.4"
        },
        {
          "label": "PDF 1.7 (Standard)",
          "value": "1.7"
        },
        {
          "label": "PDF 2.0 (Modern)",
          "value": "2.0"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "long-term-archive-pdf-creator",
  "name": "Long-Term Archive PDF Creator",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Package documents into self-contained archival bundles with verified metadata.",
  "blurb": "Package documents into self-contained archival bundles with verified metadata.",
  "op": "archive-create",
  "proTip": "Packages complete document assets into resilient, self-contained preservation bundles.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "embedded-font-archive-checker",
  "name": "Embedded Font Archive Checker",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Verify that 100% of document fonts are embedded without external dependencies.",
  "blurb": "Verify that 100% of document fonts are embedded without external dependencies.",
  "op": "font-embed-check",
  "proTip": "Prevents font substitution errors when opening records 30 years in the future.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-xmp-metadata-validator",
  "name": "PDF XMP Metadata Validator",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Validate embedded XMP metadata packets against ISO 16684-1 specifications.",
  "blurb": "Validate embedded XMP metadata packets against ISO 16684-1 specifications.",
  "op": "pdfa-validate",
  "proTip": "Checks Dublin Core and Adobe XMP schema syntax for preservation indexing.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "pdf-linearization-checker",
  "name": "PDF Linearization Checker",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Verify whether document streams are structured for Fast Web View delivery.",
  "blurb": "Verify whether document streams are structured for Fast Web View delivery.",
  "op": "structure",
  "proTip": "Confirms first-page fast display hints are properly serialized.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "digital-preservation-audit",
  "name": "Digital Preservation Audit",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Comprehensive health score for digital library and corporate archive assets.",
  "blurb": "Comprehensive health score for digital library and corporate archive assets.",
  "op": "health-check",
  "proTip": "Evaluates format obsolescence risk and preservation sustainability.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "iso-conformance-reporter",
  "name": "ISO Conformance Reporter",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Generate detailed compliance report against ISO 32000 specifications.",
  "blurb": "Generate detailed compliance report against ISO 32000 specifications.",
  "op": "standard-check",
  "proTip": "Prepares formal verification certificates for corporate and legal compliance.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "archival-checksum-validator",
  "name": "Archival Checksum Validator",
  "sub": "Archival & Compliance",
  "icon": "Archive",
  "description": "Generate cryptographic SHA-256 integrity checksums for archived records.",
  "blurb": "Generate cryptographic SHA-256 integrity checksums for archived records.",
  "op": "file-info",
  "proTip": "Guarantees bit-level document immutability across long-term cloud cold storage.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "invoice-pdf-generator-tool",
  "name": "Invoice PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Generate professional commercial and tax invoices with line items, tax, and totals.",
  "blurb": "Generate professional commercial and tax invoices with line items, tax, and totals.",
  "op": "gen-invoice",
  "proTip": "Automates tax calculations, payment terms, and downloadable PDF invoices in seconds.",
  "params": [
    {
      "id": "client",
      "label": "Client / Company Name",
      "type": "text",
      "defaultValue": "Acme Corporation",
      "placeholder": "Client name"
    },
    {
      "id": "title",
      "label": "Invoice Title",
      "type": "text",
      "defaultValue": "INVOICE #INV-2026-001",
      "placeholder": "Invoice Title"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "quotation-pdf-generator",
  "name": "Quotation & Estimate PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Create formal sales quotations and cost estimates with terms and validity periods.",
  "blurb": "Create formal sales quotations and cost estimates with terms and validity periods.",
  "op": "gen-quotation",
  "proTip": "Features customer sign-off signature blocks ready for proposal approval.",
  "params": [
    {
      "id": "client",
      "label": "Client Name",
      "type": "text",
      "defaultValue": "Global Logistics Ltd",
      "placeholder": "Client"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "receipt-pdf-generator",
  "name": "Receipt PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Generate clean sales receipts and payment acknowledgments with receipt numbers.",
  "blurb": "Generate clean sales receipts and payment acknowledgments with receipt numbers.",
  "op": "gen-receipt",
  "proTip": "Includes automated transaction ID and payment method indicator.",
  "params": [
    {
      "id": "receiptNum",
      "label": "Receipt #",
      "type": "text",
      "defaultValue": "RCP-5502",
      "placeholder": "Receipt #"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "purchase-order-pdf-generator",
  "name": "Purchase Order PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Create formal purchase orders (PO) with vendor details and shipping terms.",
  "blurb": "Create formal purchase orders (PO) with vendor details and shipping terms.",
  "op": "gen-po",
  "proTip": "Standardizes procurement terms and delivery tracking across vendor orders.",
  "params": [
    {
      "id": "vendor",
      "label": "Vendor Name",
      "type": "text",
      "defaultValue": "Apex Supply Co",
      "placeholder": "Vendor"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "delivery-note-pdf-generator",
  "name": "Delivery Note PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Generate delivery notes and dispatch dockets with packing item checklists.",
  "blurb": "Generate delivery notes and dispatch dockets with packing item checklists.",
  "op": "gen-delivery",
  "proTip": "Features customer sign-off signature blocks upon freight arrival.",
  "params": [
    {
      "id": "docketNum",
      "label": "Delivery Docket #",
      "type": "text",
      "defaultValue": "DN-892",
      "placeholder": "Docket #"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "business-letter-pdf-generator",
  "name": "Business Letter PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Format professional corporate correspondence on letterhead with signatures.",
  "blurb": "Format professional corporate correspondence on letterhead with signatures.",
  "op": "gen-letter",
  "proTip": "Applies standard executive margins, formal letterheaders, and closing signatures.",
  "params": [
    {
      "id": "recipient",
      "label": "Recipient Name",
      "type": "text",
      "defaultValue": "Dear Executive Director,",
      "placeholder": "Salutation"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "salary-slip-pdf-generator",
  "name": "Salary Slip PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Generate itemized payroll pay slips with earnings, deductions, and net salary.",
  "blurb": "Generate itemized payroll pay slips with earnings, deductions, and net salary.",
  "op": "gen-payslip",
  "proTip": "Automates basic pay, allowances, tax withholdings, and net take-home calculation.",
  "params": [
    {
      "id": "employee",
      "label": "Employee Name",
      "type": "text",
      "defaultValue": "Jane Smith",
      "placeholder": "Employee"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "expense-report-pdf-generator",
  "name": "Expense Report PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Compile itemized employee business expense reimbursement claims into PDF.",
  "blurb": "Compile itemized employee business expense reimbursement claims into PDF.",
  "op": "gen-expense",
  "proTip": "Itemize travel, lodging, and meal receipts for corporate finance reimbursement.",
  "params": [
    {
      "id": "employeeName",
      "label": "Claimant Name",
      "type": "text",
      "defaultValue": "Alex Vance",
      "placeholder": "Name"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "commercial-contract-template",
  "name": "Commercial Contract Template",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Generate standardized non-disclosure and service agreements with signature blocks.",
  "blurb": "Generate standardized non-disclosure and service agreements with signature blocks.",
  "op": "gen-letter",
  "proTip": "Includes binding legal clauses, governing law sections, and execution blocks.",
  "params": [
    {
      "id": "partyA",
      "label": "Party A Name",
      "type": "text",
      "defaultValue": "Company Inc.",
      "placeholder": "Party A"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "meeting-minutes-pdf-generator",
  "name": "Meeting Minutes PDF Generator",
  "sub": "Invoice & Business PDF",
  "icon": "Receipt",
  "description": "Format board meeting minutes, attendee rosters, and decision logs into PDF.",
  "blurb": "Format board meeting minutes, attendee rosters, and decision logs into PDF.",
  "op": "gen-letter",
  "proTip": "Standardizes corporate governance documentation and resolution tracking.",
  "params": [
    {
      "id": "meetingTitle",
      "label": "Meeting Subject",
      "type": "text",
      "defaultValue": "Board of Directors Meeting",
      "placeholder": "Meeting Title"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "assignment-pdf-maker",
  "name": "Assignment PDF Maker",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Generate university assignment cover pages with student ID, course, and date.",
  "blurb": "Generate university assignment cover pages with student ID, course, and date.",
  "op": "gen-assignment",
  "proTip": "Creates formatted institutional cover pages matching academic submission rules.",
  "params": [
    {
      "id": "student",
      "label": "Student Name",
      "type": "text",
      "defaultValue": "John Doe",
      "placeholder": "Student name"
    },
    {
      "id": "course",
      "label": "Course Code & Name",
      "type": "text",
      "defaultValue": "CS-401 Advanced Algorithms",
      "placeholder": "Course"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "notes-to-pdf",
  "name": "Notes to PDF",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Format lecture notes and study summaries into organized printable handouts.",
  "blurb": "Format lecture notes and study summaries into organized printable handouts.",
  "op": "gen-notes",
  "proTip": "Applies Cornell note layout with margin summary columns for active review.",
  "params": [],
  "accept": ".txt,.md",
  "multiple": false
},
  {
  "id": "question-paper-pdf-generator",
  "name": "Question Paper PDF Generator",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Create standardized academic exam question papers with marks allocation.",
  "blurb": "Create standardized academic exam question papers with marks allocation.",
  "op": "gen-question-paper",
  "proTip": "Automates section headings, question point values, and time limit headers.",
  "params": [
    {
      "id": "subject",
      "label": "Subject Name",
      "type": "text",
      "defaultValue": "Physics 101 Midterm",
      "placeholder": "Subject"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "answer-sheet-generator",
  "name": "Answer Sheet Generator",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Generate formatted bubble answer sheets and lined written response templates.",
  "blurb": "Generate formatted bubble answer sheets and lined written response templates.",
  "op": "gen-answersheet",
  "proTip": "Prints standardized multiple-choice bubble grids for classroom tests.",
  "params": [
    {
      "id": "numQuestions",
      "label": "Number of Questions",
      "type": "select",
      "defaultValue": "50",
      "options": [
        {
          "label": "50 Questions",
          "value": "50"
        },
        {
          "label": "100 Questions",
          "value": "100"
        }
      ]
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "worksheet-pdf-generator",
  "name": "Worksheet PDF Generator",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Design student practice worksheets with problem boxes, grids, and answer lines.",
  "blurb": "Design student practice worksheets with problem boxes, grids, and answer lines.",
  "op": "gen-worksheet",
  "proTip": "Creates clean problem-solving worksheets with ample working space for students.",
  "params": [
    {
      "id": "title",
      "label": "Worksheet Title",
      "type": "text",
      "defaultValue": "Calculus Derivatives Practice",
      "placeholder": "Worksheet Title"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "study-planner-pdf",
  "name": "Study Planner PDF",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Generate daily, weekly, and semester revision study timetable planners.",
  "blurb": "Generate daily, weekly, and semester revision study timetable planners.",
  "op": "gen-study-planner",
  "proTip": "Breaks exam preparation into realistic daily revision blocks.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "flashcards-to-pdf",
  "name": "Flashcards to PDF",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Print two-sided study flashcards with cut lines and alignment guides.",
  "blurb": "Print two-sided study flashcards with cut lines and alignment guides.",
  "op": "gen-flashcards",
  "proTip": "Fold along dashed lines to create instant physical active recall cards.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "certificate-generator-pdf",
  "name": "Certificate Generator",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Create award certificates of completion and achievement with elegant borders.",
  "blurb": "Create award certificates of completion and achievement with elegant borders.",
  "op": "gen-certificate",
  "proTip": "Features ornate vector certificate borders and gold seal placement.",
  "params": [
    {
      "id": "recipient",
      "label": "Recipient Name",
      "type": "text",
      "defaultValue": "Jane Smith",
      "placeholder": "Recipient"
    },
    {
      "id": "course",
      "label": "Course / Award Title",
      "type": "text",
      "defaultValue": "Data Science Specialization",
      "placeholder": "Award"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "student-id-pdf-generator",
  "name": "Student ID PDF Generator",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Generate printable student ID cards and library passes with barcodes.",
  "blurb": "Generate printable student ID cards and library passes with barcodes.",
  "op": "gen-student-id",
  "proTip": "Standard CR-80 card dimensions ready for lamination or card sleeves.",
  "params": [
    {
      "id": "studentName",
      "label": "Student Name",
      "type": "text",
      "defaultValue": "Alice Vance",
      "placeholder": "Name"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "research-paper-formatter",
  "name": "Research Paper Formatter",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Format academic manuscripts with abstract, two-column text, and references.",
  "blurb": "Format academic manuscripts with abstract, two-column text, and references.",
  "op": "gen-research-paper",
  "proTip": "Formats text to IEEE and ACM two-column journal manuscript specifications.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "thesis-cover-page-generator",
  "name": "Thesis Cover Page Generator",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Create standardized university dissertation and thesis binding cover pages.",
  "blurb": "Create standardized university dissertation and thesis binding cover pages.",
  "op": "gen-thesis-cover",
  "proTip": "Conforms to formal university thesis submission title and committee standards.",
  "params": [
    {
      "id": "title",
      "label": "Thesis Title",
      "type": "text",
      "defaultValue": "Machine Learning in Genomics",
      "placeholder": "Thesis Title"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "bibliography-pdf-generator",
  "name": "Bibliography PDF Generator",
  "sub": "Student & Academic PDF",
  "icon": "GraduationCap",
  "description": "Format citations into clean hanging-indent APA, MLA, or Chicago reference lists.",
  "blurb": "Format citations into clean hanging-indent APA, MLA, or Chicago reference lists.",
  "op": "gen-bibliography",
  "proTip": "Applies standard academic hanging indent formatting across reference entries.",
  "params": [],
  "accept": ".txt,.md",
  "multiple": false
},
  {
  "id": "passport-size-photo-to-pdf",
  "name": "Passport Size Photo to PDF",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Place 4, 6, or 8 passport photos on a single 4x6 or A4 sheet for printing.",
  "blurb": "Place 4, 6, or 8 passport photos on a single 4x6 or A4 sheet for printing.",
  "op": "passport-to-pdf",
  "proTip": "Standard 2x2 inch (51x51mm) photo layout ready for government visa submissions.",
  "params": [
    {
      "id": "photosCount",
      "label": "Photos per Sheet",
      "type": "select",
      "defaultValue": "6",
      "options": [
        {
          "label": "6 Photos (Standard 4x6 print)",
          "value": "6"
        },
        {
          "label": "8 Photos (A4 Page)",
          "value": "8"
        }
      ]
    }
  ],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": false
},
  {
  "id": "cnic-id-card-to-pdf",
  "name": "CNIC / ID Card to PDF",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Combine front and back of national ID cards onto a single clean PDF sheet.",
  "blurb": "Combine front and back of national ID cards onto a single clean PDF sheet.",
  "op": "id-card-pdf",
  "proTip": "Aligns front and back ID card scans side by side on standard A4 paper for official filing.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": true
},
  {
  "id": "id-card-scanner-to-pdf",
  "name": "ID Card Scanner to PDF",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Auto-crop and enhance photographed ID cards and badges onto clean white backgrounds.",
  "blurb": "Auto-crop and enhance photographed ID cards and badges onto clean white backgrounds.",
  "op": "scan-id-card",
  "proTip": "Boosts text contrast so small ID serial numbers remain crisp when printed.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": false
},
  {
  "id": "document-scanner-to-pdf",
  "name": "Document Scanner to PDF",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Transform phone camera document snapshots into crisp, flattened PDF pages.",
  "blurb": "Transform phone camera document snapshots into crisp, flattened PDF pages.",
  "op": "scan-document",
  "proTip": "Removes shadows, flattens page curl, and boosts black text contrast.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": true
},
  {
  "id": "multiple-id-cards-on-one-page",
  "name": "Multiple ID Cards on One Page",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Place multiple employee badges or student IDs on a single sheet for laminating.",
  "blurb": "Place multiple employee badges or student IDs on a single sheet for laminating.",
  "op": "multi-id-pdf",
  "proTip": "Arranges up to 8 ID cards in a clean grid for fast batch printing.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": true
},
  {
  "id": "passport-document-pdf-maker",
  "name": "Passport Document PDF Maker",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Compile scanned passport photo pages, visas, and entry stamps into a travel PDF.",
  "blurb": "Compile scanned passport photo pages, visas, and entry stamps into a travel PDF.",
  "op": "passport-maker",
  "proTip": "Standardizes passport scan resolution to meet embassy visa upload requirements.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "visa-document-pdf-organizer",
  "name": "Visa Document PDF Organizer",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Organize embassy visa application packets: passport, bank statements, and tickets.",
  "blurb": "Organize embassy visa application packets: passport, bank statements, and tickets.",
  "op": "visa-organizer",
  "proTip": "Generates bookmarked table of contents required by visa processing centers.",
  "params": [],
  "accept": ".pdf",
  "multiple": true
},
  {
  "id": "document-checklist-pdf",
  "name": "Document Checklist PDF",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Generate official verification checklists for job, visa, and loan applications.",
  "blurb": "Generate official verification checklists for job, visa, and loan applications.",
  "op": "doc-checklist",
  "proTip": "Includes verification checkboxes and signature acknowledgment blocks.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "official-document-cover-generator",
  "name": "Official Document Cover Generator",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Create executive presentation cover pages with titles, dates, and classification.",
  "blurb": "Create executive presentation cover pages with titles, dates, and classification.",
  "op": "doc-cover",
  "proTip": "Adds official government or corporate classification banners to document covers.",
  "params": [
    {
      "id": "title",
      "label": "Document Title",
      "type": "text",
      "defaultValue": "CONFIDENTIAL DOSSIER",
      "placeholder": "Title"
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "driver-license-pdf-organizer",
  "name": "Driver License PDF Organizer",
  "sub": "ID & Document PDF",
  "icon": "CreditCard",
  "description": "Combine driver license front and back scans onto standard single-sheet verification format.",
  "blurb": "Combine driver license front and back scans onto standard single-sheet verification format.",
  "op": "id-card-pdf",
  "proTip": "Formats DMV license copies for insurance verification and car rental paperwork.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": true
},
  {
  "id": "camera-to-pdf",
  "name": "Camera to PDF",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Capture documents with your device camera and convert to high-contrast PDF.",
  "blurb": "Capture documents with your device camera and convert to high-contrast PDF.",
  "op": "camera-pdf",
  "proTip": "Auto-perspective correction straightens documents captured at angled viewpoints.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": true
},
  {
  "id": "multi-page-scanner",
  "name": "Multi-Page Scanner",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Capture and compile continuous multi-page document scans into a single PDF.",
  "blurb": "Capture and compile continuous multi-page document scans into a single PDF.",
  "op": "multi-scan",
  "proTip": "Batch scan contracts page by page with auto-advancing capture prompts.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": true
},
  {
  "id": "receipt-scanner-to-pdf",
  "name": "Receipt Scanner to PDF",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Scan paper receipts and thermal store dockets with high-contrast text enhancement.",
  "blurb": "Scan paper receipts and thermal store dockets with high-contrast text enhancement.",
  "op": "receipt-scan",
  "proTip": "Isolates faded thermal receipt ink from discolored background paper.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": false
},
  {
  "id": "business-card-to-pdf",
  "name": "Business Card to PDF",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Digitize business cards into clean contact cards and printable wallet sheets.",
  "blurb": "Digitize business cards into clean contact cards and printable wallet sheets.",
  "op": "bizcard-scan",
  "proTip": "Extracts contact details and aligns business cards neatly on printable sheets.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": true
},
  {
  "id": "document-deskew-tool",
  "name": "Document Deskew Tool",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Automatically detect and rotate slanted, tilted, or crooked scanned pages.",
  "blurb": "Automatically detect and rotate slanted, tilted, or crooked scanned pages.",
  "op": "deskew",
  "proTip": "Radon transform algorithm straightens tilted scans to within 0.1 degree accuracy.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "scan-cleanup-tool",
  "name": "Scan Cleanup Tool",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Erase scanner bed dust, hole punches, staple marks, and dark shadow borders.",
  "blurb": "Erase scanner bed dust, hole punches, staple marks, and dark shadow borders.",
  "op": "cleanup-scan",
  "proTip": "Cleans black border shadows caused by scanning with an open scanner lid.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "scan-contrast-enhancer",
  "name": "Scan Contrast Enhancer",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Boost contrast on faint pencil notes, light receipts, and faded blueprints.",
  "blurb": "Boost contrast on faint pencil notes, light receipts, and faded blueprints.",
  "op": "enhance-contrast",
  "proTip": "Binarization algorithms boost faint carbon copy handwriting into dark text.",
  "params": [
    {
      "id": "contrast",
      "label": "Contrast Boost (%)",
      "type": "slider",
      "defaultValue": 125,
      "min": 100,
      "max": 200,
      "step": 5
    }
  ],
  "accept": ".pdf",
  "multiple": false
},
  {
  "id": "scan-background-cleaner",
  "name": "Scan Background Cleaner",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Whiten yellowed or textured paper backgrounds for clean black & white printing.",
  "blurb": "Whiten yellowed or textured paper backgrounds for clean black & white printing.",
  "op": "whiten-bg",
  "proTip": "Forces yellowed and grey background paper pixels to pure white.",
  "params": [
    {
      "id": "threshold",
      "label": "Whiteness Threshold",
      "type": "slider",
      "defaultValue": 190,
      "min": 140,
      "max": 240,
      "step": 5
    }
  ],
  "accept": ".png,.jpg,.jpeg,.webp",
  "multiple": false
},
  {
  "id": "scan-to-searchable-pdf",
  "name": "Scan to Searchable PDF",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Embed OCR searchable text layers beneath scanned images so text can be copied.",
  "blurb": "Embed OCR searchable text layers beneath scanned images so text can be copied.",
  "op": "searchable-pdf",
  "proTip": "Runs Tesseract OCR in-browser to embed invisible selectable text behind images.",
  "params": [],
  "accept": ".png,.jpg,.jpeg,.webp,.pdf",
  "multiple": false
},
  {
  "id": "book-page-split-scanner",
  "name": "Book Page Split Scanner",
  "sub": "Scanner & Camera PDF Utilities",
  "icon": "Smartphone",
  "description": "Split 2-page open book scanner spreads down the middle spine into individual pages.",
  "blurb": "Split 2-page open book scanner spreads down the middle spine into individual pages.",
  "op": "extract-pages",
  "proTip": "Splits open flatbed book scans into left and right individual pages automatically.",
  "params": [],
  "accept": ".pdf",
  "multiple": false
},
]

export const pdfSpecById = new Map<string, PdfToolSpec>(
  pdfSpecsData.map((s) => [s.id, s]),
)

export function getPdfToolSpec(id: string): PdfToolSpec | undefined {
  return pdfSpecById.get(id)
}
