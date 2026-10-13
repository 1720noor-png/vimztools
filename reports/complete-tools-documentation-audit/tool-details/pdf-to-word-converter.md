# PDF to Word (.docx) Converter

**Tool Slug:** `pdf-to-word-converter`  
**Category:** PDF Document Tools (`pdf-tools`)  
**Subcategory:** PDF Conversion & Export (`pdf-conversion-export`)  
**Verification Status:** **PARTIAL**  
**Live Production URL:** [https://charming-vitality-production-dd02.up.railway.app/pdf-tools/pdf-to-word-converter](https://charming-vitality-production-dd02.up.railway.app/pdf-tools/pdf-to-word-converter)  

---

## 1. Purpose & Intended Use Case
Convert PDF document text and formatting into editable Word document format.

**Target Audience:** Professionals, students, creators, and developers seeking immediate client-side calculations without server overhead or privacy exposure.

## 2. Inputs & Validation
- **Accepted Inputs:** File Upload
- **Validation:** Inputs are validated via React local state hooks, preventing empty submissions and enforcing boundary values.

## 3. Actual Working & Processing Logic
Extracts text from uploaded text document and generates a PDF document using pdf-lib.

## 4. Output & Export Capabilities
- **Generated Output:** Calculated metrics, formatted text, and interactive display
- **Export / Download:** Client-side copy to clipboard, text/JSON/CSV deliverable export

## 5. Source Code & Architecture
- **Component Identifier:** `PdfToWord`
- **Component Path:** `../tools/pdf/PdfToWord.jsx`
- **Execution Context:** Client-Side Browser Sandbox (100% Private)

## 6. Verification Evidence & Limitations
- **Evidence:** file.text() call directly renders lines into pdf-lib Helvetica font without docx unzip.
- **Limitations:** Does not parse binary Microsoft Word OpenXML (.docx) format; treats uploaded document as plain text stream.

---
[Back to Master Table](../all-tools-master-documentation.md) | [Back to Summary](../tool-verification-summary.md)
