# Vimz.ai — Unverified and Limited Tools Report

**Audit Date:** October 13, 2026  
This document enumerates every tool classified as **PARTIAL**, **EXTERNAL DEPENDENCY LIMITED**, or possessing notable technical restrictions.

---

## Summary: 7 Tools Requiring Attention

| # | Tool Name | Slug | Category | Status | Limitation Summary | Recommended Action |
| :-: | :--- | :--- | :--- | :-: | :--- | :--- |
| 1 | **Voice & Speech to Text Transcriber** | `speech-to-text-transcriber` | Audio & Speech Media Tools | **EXTERNAL DEPENDENCY LIMITED** | Requires browser with Web Speech API support (Google Chrome, Edge, Safari); not supported in Firefox. | [View Specification](tool-details/speech-to-text-transcriber.md) |
| 2 | **PDF to Word (.docx) Converter** | `pdf-to-word-converter` | PDF Document Tools | **PARTIAL** | Does not parse binary Microsoft Word OpenXML (.docx) format; treats uploaded document as plain text stream. | [View Specification](tool-details/pdf-to-word-converter.md) |
| 3 | **PDF Document Text Translator** | `pdf-document-translator` | PDF Document Tools | **EXTERNAL DEPENDENCY LIMITED** | Dependent on external third-party API availability (mymemory.translated.net) and network connectivity. | [View Specification](tool-details/pdf-document-translator.md) |
| 4 | **Text / Word to PDF Converter** | `word-text-to-pdf-converter` | PDF Document Tools | **PARTIAL** | Does not parse binary Microsoft Word OpenXML (.docx) format; treats uploaded document as plain text stream. | [View Specification](tool-details/word-text-to-pdf-converter.md) |
| 5 | **Text & Phrase Language Translator** | `text-language-translator` | Writing & Content Tools | **EXTERNAL DEPENDENCY LIMITED** | Dependent on external third-party API availability (mymemory.translated.net) and network connectivity. | [View Specification](tool-details/text-language-translator.md) |
| 6 | **CSV Column Statistics** | `csv-column-stats` | Data & Analytics Tools | **PARTIAL** | Current component accepts numeric parameters rather than parsing uploaded tabular CSV files. | [View Specification](tool-details/csv-column-stats.md) |
| 7 | **PDF Bates Numbering Stamper** | `pdf-bates-stamper` | PDF Document Tools | **PARTIAL** | Generates Bates index matrix and copyable text schedule; does not physically stamp into existing PDF binary stream. | [View Specification](tool-details/pdf-bates-stamper.md) |

---

## Detailed Technical Analysis of Limited Tools

### ⚠️ Voice & Speech to Text Transcriber (`speech-to-text-transcriber`)

- **Category:** Audio & Speech Media Tools (`media-tools`) / Voice & Transcription
- **Status:** **EXTERNAL DEPENDENCY LIMITED**
- **Source Component:** `../tools/media/SpeechToText.jsx`
- **Observed Limitation:** Requires browser with Web Speech API support (Google Chrome, Edge, Safari); not supported in Firefox.
- **Evidence:** Verified SpeechRecognition hook and event handlers.
- **Recommended Action:** Refactor component to implement true binary/stream processing before including in premium promotion tiers.

### ⚠️ PDF to Word (.docx) Converter (`pdf-to-word-converter`)

- **Category:** PDF Document Tools (`pdf-tools`) / PDF Conversion & Export
- **Status:** **PARTIAL**
- **Source Component:** `../tools/pdf/PdfToWord.jsx`
- **Observed Limitation:** Does not parse binary Microsoft Word OpenXML (.docx) format; treats uploaded document as plain text stream.
- **Evidence:** file.text() call directly renders lines into pdf-lib Helvetica font without docx unzip.
- **Recommended Action:** Refactor component to implement true binary/stream processing before including in premium promotion tiers.

### ⚠️ PDF Document Text Translator (`pdf-document-translator`)

- **Category:** PDF Document Tools (`pdf-tools`) / PDF Conversion & Export
- **Status:** **EXTERNAL DEPENDENCY LIMITED**
- **Source Component:** `../tools/pdf/PdfTranslator.jsx`
- **Observed Limitation:** Dependent on external third-party API availability (mymemory.translated.net) and network connectivity.
- **Evidence:** Verified external fetch() call to translation endpoint with sentence chunking.
- **Recommended Action:** Refactor component to implement true binary/stream processing before including in premium promotion tiers.

### ⚠️ Text / Word to PDF Converter (`word-text-to-pdf-converter`)

- **Category:** PDF Document Tools (`pdf-tools`) / PDF Conversion & Export
- **Status:** **PARTIAL**
- **Source Component:** `../tools/pdf/WordToPdf.jsx`
- **Observed Limitation:** Does not parse binary Microsoft Word OpenXML (.docx) format; treats uploaded document as plain text stream.
- **Evidence:** file.text() call directly renders lines into pdf-lib Helvetica font without docx unzip.
- **Recommended Action:** Refactor component to implement true binary/stream processing before including in premium promotion tiers.

### ⚠️ Text & Phrase Language Translator (`text-language-translator`)

- **Category:** Writing & Content Tools (`writing-tools`) / Text & Formatting Utilities
- **Status:** **EXTERNAL DEPENDENCY LIMITED**
- **Source Component:** `../tools/writing/TextTranslator.jsx`
- **Observed Limitation:** Dependent on external third-party API availability (mymemory.translated.net) and network connectivity.
- **Evidence:** Verified external fetch() call to translation endpoint with sentence chunking.
- **Recommended Action:** Refactor component to implement true binary/stream processing before including in premium promotion tiers.

### ⚠️ CSV Column Statistics (`csv-column-stats`)

- **Category:** Data & Analytics Tools (`data-tools`) / Sampling, Testing & Summary
- **Status:** **PARTIAL**
- **Source Component:** `../tools/data/CsvColumnStats.jsx`
- **Observed Limitation:** Current component accepts numeric parameters rather than parsing uploaded tabular CSV files.
- **Evidence:** Source code inspection reveals numeric inputs instead of CSV file reader.
- **Recommended Action:** Refactor component to implement true binary/stream processing before including in premium promotion tiers.

### ⚠️ PDF Bates Numbering Stamper (`pdf-bates-stamper`)

- **Category:** PDF Document Tools (`pdf-tools`) / PDF Management
- **Status:** **PARTIAL**
- **Source Component:** `../tools/pdf/PdfBatesStamperTool.jsx`
- **Observed Limitation:** Generates Bates index matrix and copyable text schedule; does not physically stamp into existing PDF binary stream.
- **Evidence:** Produces text exhibit schedule rather than modifying binary PDF pages.
- **Recommended Action:** Refactor component to implement true binary/stream processing before including in premium promotion tiers.

