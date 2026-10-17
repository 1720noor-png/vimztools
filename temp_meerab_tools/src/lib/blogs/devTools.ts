import type { Blog } from '../blogs'

export const devToolsBlogs: Blog[] = [
  {
    slug: 'json-schema-validation-draft7-vs-202012',
    title: 'JSON Schema Validation: Practical Differences Between Draft-07 and 2020-12',
    category: 'Developer Tools',
    tags: ['JSON Schema', 'Validation', 'TypeScript', 'API Design'],
    excerpt: 'Migrating legacy JSON Schemas to modern Draft 2020-12? Understand prefixItems, $defs, unevaluatedProperties, and dynamic anchors.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-09-17',
    readingMinutes: 7,
    badge: 'JSON SCHEMA',
    theme: 'indigo',
    relatedTool: { name: 'JSON Formatter & Validator', path: '/tools/developer/json-formatter' },
    content: [
      { type: 'p', text: 'JSON Schema has evolved significantly from its early Draft-04 and Draft-07 iterations into the modern Draft 2020-12 specification. While older tools often stall at Draft-07, modern schema engines introduce powerful features for strict payload modeling.' },
      { type: 'h2', text: 'Key Syntax Evolution' },
      { type: 'ul', items: [
        'Definitions: Replaced definitions with the standardized $defs keyword for modular schema references.',
        'Array Tuples: Replaced the confusing array-of-schemas items syntax with prefixItems, leaving items to specify remaining elements.',
        'Unevaluated Properties: Introduced unevaluatedProperties and unevaluatedItems, which respect conditions across allOf and oneOf branches without false positives.',
        'Dynamic Scoping: Replaced $recursiveRef with $dynamicAnchor and $dynamicRef for clean polymorphic schema extensions.'
      ]},
      { type: 'h2', text: 'Client-Side Validation Engines' },
      { type: 'p', text: 'In-browser schema validators compile JSON Schema into optimized JavaScript validation functions using engines like Ajv, delivering instant sub-millisecond linting feedback as you edit payloads in real time.' }
    ]
  },
  {
    slug: 'preventing-redos-regex-catastrophic-backtracking',
    title: 'Preventing ReDoS: Spotting Catastrophic Backtracking in Regular Expressions',
    category: 'Developer Tools',
    tags: ['Regex', 'ReDoS', 'Security', 'Performance'],
    excerpt: 'A single poorly formed regex pattern can peg the CPU at 100% and freeze browser tabs forever. Learn to diagnose and eliminate catastrophic backtracking.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-09-15',
    readingMinutes: 6,
    badge: 'REGEX REDOS',
    theme: 'rose',
    relatedTool: { name: 'Regex Tester & Debugger', path: '/tools/developer/regex-tester' },
    content: [
      { type: 'p', text: 'Regular Expression Denial of Service (ReDoS) occurs when a non-deterministic finite automaton (NFA) regex engine encounters nested quantifiers with overlapping branches, causing an exponential explosion in backtracking steps.' },
      { type: 'h2', text: 'The Classic Evil Regex Anti-Pattern' },
      { type: 'quote', text: 'Pattern: ^(a+)+$\nInput: aaaaaaaaaaaaaaaaaaaaaaaaaaa!' },
      { type: 'p', text: 'With an input of 30 "a"s followed by an exclamation mark, the engine tries over 1 billion permutation combinations before reporting a non-match, completely freezing the JavaScript thread.' },
      { type: 'h2', text: 'How to Guard Your Expressions' },
      { type: 'ul', items: [
        'Avoid nested quantifiers like (a+)* or ([a-z]+)+.',
        'Ensure alternative branches in (a|b) are mutually exclusive.',
        'Utilize possessive quantifiers or atomic grouping when available, or rewrite patterns using deterministic prefix matching.',
        'Run regex matches inside Web Workers with strict execution timeout watchdogs.'
      ]}
    ]
  },
  {
    slug: 'curl-to-fetch-axios-transpiler-internals',
    title: 'Deconstructing cURL: Transpiling Shell Requests into Fetch and Axios Client-Side',
    category: 'Developer Tools',
    tags: ['cURL', 'Fetch API', 'Axios', 'Transpiler'],
    excerpt: 'Converting raw terminal cURL commands into JavaScript network calls requires parsing command-line tokens, escaping quotes, and restructuring multipart headers.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-09-13',
    readingMinutes: 5,
    badge: 'CURL PARSER',
    theme: 'teal',
    relatedTool: { name: 'cURL to Fetch & Axios Converter', path: '/tools/developer/curl-converter' },
    content: [
      { type: 'p', text: 'API documentation frequently provides code examples as terminal cURL commands. Translating these flags into idiomatic modern JavaScript Fetch or Axios calls manually is tedious and error-prone.' },
      { type: 'h2', text: 'Lexical Tokenization of Shell Syntax' },
      { type: 'p', text: 'Shell commands allow flexible whitespace, escaped quotes, and multiline continuations (\\). A client-side transpiler breaks the command into an abstract syntax tree of flags and argument values:' },
      { type: 'ul', items: [
        '-X / --request: Maps directly to the HTTP method (GET, POST, PUT, DELETE, PATCH).',
        '-H / --header: Parsed into a structured key-value headers object, handling duplicate authorization headers gracefully.',
        '-d / --data / --data-raw: Determines request body formatting (JSON.stringify vs URLSearchParams).',
        '-F / --form: Automatically generates FormData() constructs for multipart file uploads.'
      ]},
      { type: 'tip', text: 'When converting headers, always normalize content-type casing and avoid setting "Content-Length" manually, as browsers manage payload byte lengths automatically.' }
    ]
  },
  {
    slug: 'base64-encoding-decoding-utf8-bytes-internals',
    title: 'Base64 Internals: Handling UTF-8 Multi-Byte Sequences Without Btoa Errors',
    category: 'Developer Tools',
    tags: ['Base64', 'UTF-8', 'Encoding', 'JavaScript'],
    excerpt: 'Calling window.btoa() on emojis or international characters throws an "InvalidCharacterError". Learn how 6-bit grouping handles UTF-8 code points safely.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-09-10',
    readingMinutes: 5,
    badge: 'BASE64 UTF-8',
    theme: 'blue',
    relatedTool: { name: 'Base64 Encoder & Decoder', path: '/tools/developer/base64' },
    content: [
      { type: 'p', text: 'Base64 converts arbitrary binary data into 64 ASCII printable characters (A-Z, a-z, 0-9, +, /) so binary payloads can travel over text-only protocols like JSON, email, and URL query strings.' },
      { type: 'h2', text: 'The Infamous btoa() UTF-8 Crash' },
      { type: 'p', text: 'The built-in window.btoa() function was designed in the 1990s and expects every character code to fit in a single 8-bit byte (0–255). Passing multi-byte characters like emojis or non-Latin text throws an immediate exception.' },
      { type: 'h2', text: 'The Modern TextEncoder Solution' },
      { type: 'quote', text: 'function toBase64(str: string): string {\n  const bytes = new TextEncoder().encode(str);\n  let bin = "";\n  bytes.forEach(b => bin += String.fromCharCode(b));\n  return window.btoa(bin);\n}' },
      { type: 'p', text: 'Using TextEncoder transforms the string into compliant UTF-8 octets first, enabling clean Base64 conversion without third-party utility dependencies.' }
    ]
  },
  {
    slug: 'color-spaces-oklab-oklch-hex-rgb-hsl-conversion',
    title: 'Modern Color Conversions: Why Oklch Beats RGB and HSL for UI Gradients',
    category: 'Developer Tools',
    tags: ['Oklch', 'CSS Color 4', 'Color Conversion', 'Design'],
    excerpt: 'HSL produces muddy gray bands in gradients between blue and yellow. Learn why the perceptually uniform Oklch color space is revolutionizing UI palettes.',
    author: 'Kavita Patel',
    authorRole: 'Design Systems Lead',
    date: '2026-09-07',
    readingMinutes: 6,
    badge: 'OKLCH COLOR',
    theme: 'violet',
    relatedTool: { name: 'Color Format Converter', path: '/tools/developer/color-converter' },
    content: [
      { type: 'p', text: 'Web designers have relied on HSL (Hue, Saturation, Lightness) for decades because it seemed intuitive. But mathematically, HSL is not perceptually uniform: pure yellow has the same numeric lightness (50%) as pure navy blue, even though yellow appears five times brighter to human eyes.' },
      { type: 'h2', text: 'The Perceptual Uniformity of Oklch' },
      { type: 'p', text: 'Developed by Björn Ottosson in 2020, Oklab and its cylindrical format Oklch (Lightness, Chroma, Hue) map directly to human visual perception:' },
      { type: 'ul', items: [
        'Uniform Lightness (L): 0.70 lightness looks identically luminous whether the hue is green, purple, or orange.',
        'Predictable Chroma (C): Saturation increases smoothly without clipping or shifts in apparent hue.',
        'Vibrant Gradients: Interpolating between two complementary hues in Oklch maintains luminous saturation throughout the curve, completely eliminating muddy gray dead zones.'
      ]},
      { type: 'tip', text: 'CSS Color 4 is now natively supported across all modern browsers. You can write oklch(0.65 0.22 142) directly in your stylesheets today.' }
    ]
  },
  {
    slug: 'demystifying-cron-expressions-syntax-guide',
    title: 'Demystifying Cron Expressions: Standard 5-Part vs Extended 6-Part Quartz Syntax',
    category: 'Developer Tools',
    tags: ['Cron', 'DevOps', 'Scheduling', 'Backend'],
    excerpt: 'Minute, hour, day-of-month, month, day-of-week. Master wildcards, step intervals, ranges, and subtle differences between UNIX and Quartz schedulers.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-09-04',
    readingMinutes: 5,
    badge: 'CRON SYNTAX',
    theme: 'amber',
    relatedTool: { name: 'Cron Expression Generator & Explainer', path: '/tools/developer/cron' },
    content: [
      { type: 'p', text: 'Automating background tasks, database backups, and scheduled batch jobs requires cron expressions. While ubiquitous across Linux, AWS EventBridge, and Kubernetes, subtle syntactic variations cause frequent misconfigurations.' },
      { type: 'h2', text: 'The Standard 5-Field UNIX Format' },
      { type: 'quote', text: '*     *     *     *     *\n┬     ┬     ┬     ┬     ┬\n│     │     │     │     └─ Day of week (0 - 6, Sun to Sat)\n│     │     │     └─────── Month (1 - 12)\n│     │     └───────────── Day of month (1 - 31)\n│     └─────────────────── Hour (0 - 23)\n└───────────────────────── Minute (0 - 59)' },
      { type: 'h2', text: 'Common Special Operators' },
      { type: 'ul', items: [
        '* (Wildcard): Matches any and all values in that specific position.',
        ', (List): Matches comma-separated discrete values, e.g., 1,15,30 in the minute field.',
        '- (Range): Matches continuous ranges, e.g., 9-17 in the hour field for business hours.',
        '/ (Step): Increments intervals, e.g., */15 in minutes means every 15 minutes.'
      ]},
      { type: 'p', text: 'Enterprise systems using Quartz (like AWS and Java engines) prepend a 6th field for seconds and introduce the "?" character to avoid conflicts between day-of-month and day-of-week.' }
    ]
  },
  {
    slug: 'sql-query-formatting-ast-tokenization',
    title: 'How Client-Side SQL Formatters Work: AST Tokenization and Indentation Rules',
    category: 'Developer Tools',
    tags: ['SQL', 'Formatting', 'AST', 'Database'],
    excerpt: 'Turning single-line, tangled SQL queries into pristine formatted statements in the browser using lexical state machines and dialect tokenizers.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-09-01',
    readingMinutes: 6,
    badge: 'SQL AST',
    theme: 'sky',
    relatedTool: { name: 'SQL Formatter & Beautifier', path: '/tools/developer/sql-formatter' },
    content: [
      { type: 'p', text: 'Copying unformatted database queries from production log files leaves you with an unreadable wall of text. Client-side SQL beautifiers transform these queries into structured, readable statements without sending proprietary database schemas over the internet.' },
      { type: 'h2', text: 'Lexical Tokenization Pipeline' },
      { type: 'ol', items: [
        'Tokenizer: Reads raw query strings and categorizes substrings into reserved keywords (SELECT, FROM, JOIN), operators (=, IN, LIKE), literals, and identifiers.',
        'Dialect Awareness: Handles dialect-specific variations, such as backticks in MySQL, double quotes in PostgreSQL, and brackets in Microsoft T-SQL.',
        'Clause Hierarchy: Recognizes major clause boundaries to inject newline breaks and calculate indentation depth.',
        'Subquery Recursion: Encloses nested parenthetical subqueries inside indented blocks, preserving clean visual hierarchy.'
      ]},
      { type: 'tip', text: 'A well-formatted query aligns JOIN conditions and comma-separated column lists vertically, dramatically accelerating code review and query optimization.' }
    ]
  },
  {
    slug: 'myers-diff-algorithm-visual-text-comparison',
    title: 'Inside the Myers Diff Algorithm: How In-Browser Code Comparators Work',
    category: 'Developer Tools',
    tags: ['Diff', 'Algorithms', 'Myers', 'Code Comparison'],
    excerpt: 'The algorithm that powers git diff and code review tools. Discover how Eugene Myers modeled diffing as an edit graph search in 1986.',
    author: 'Elena Rostova',
    authorRole: 'Core Systems Architect',
    date: '2026-08-29',
    readingMinutes: 7,
    badge: 'DIFF ALGORITHM',
    theme: 'emerald',
    relatedTool: { name: 'Text & Code Diff Viewer', path: '/tools/developer/diff-checker' },
    content: [
      { type: 'p', text: 'When comparing two versions of a document or source file, the goal is to discover the Shortest Edit Script (SES) that transforms sequence A into sequence B with the minimum number of insertions and deletions.' },
      { type: 'h2', text: 'The Edit Graph Grid' },
      { type: 'p', text: 'The Myers Diff algorithm conceptualizes diffing as finding the shortest path across a 2D directed grid:' },
      { type: 'ul', items: [
        'Moving right along the X-axis corresponds to deleting a line from sequence A.',
        'Moving down along the Y-axis corresponds to inserting a line into sequence B.',
        'Moving diagonally (X+1, Y+1) represents an exact match between lines, incurring zero edit cost.'
      ]},
      { type: 'h2', text: 'Greedy Breadth-First Search' },
      { type: 'p', text: 'By iteratively exploring diagonal "snakes" for each edit distance D, the algorithm terminates at the earliest possible path, producing concise, human-intuitive diff highlights in milliseconds right inside your browser window.' }
    ]
  },
  {
    slug: 'jwt-anatomy-claims-header-payload-signature',
    title: 'Decoding JSON Web Tokens (JWT): Header, Payload Claims, and Signature Verification',
    category: 'Developer Tools',
    tags: ['JWT', 'Authentication', 'Security', 'Web Standards'],
    excerpt: 'Examine the three dot-separated components of a JSON Web Token. Understand standard claims (iss, sub, exp, nbf) and common verification pitfalls.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-08-26',
    readingMinutes: 6,
    badge: 'JWT ANATOMY',
    theme: 'purple',
    relatedTool: { name: 'JWT Decoder & Inspector', path: '/tools/developer/jwt-debugger' },
    content: [
      { type: 'p', text: 'JSON Web Tokens (RFC 7519) are the de facto standard for stateless authentication in modern microservices and single-page applications. Inspecting tokens client-side lets developers debug authentication flows without sharing secrets.' },
      { type: 'h2', text: 'The Three Base64Url Segments' },
      { type: 'quote', text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOiIxMjM0NTYiLCJleHAiOjE3MDAwMDAwMDB9 . SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\n[Header] . [Payload Claims] . [Cryptographic Signature]' },
      { type: 'h2', text: 'Standard Registered Claims' },
      { type: 'ul', items: [
        'sub (Subject): The unique user or service ID.',
        'exp (Expiration Time): Unix timestamp epoch after which the token is invalid.',
        'nbf (Not Before): Unix timestamp before which the token must not be accepted.',
        'iss (Issuer): The identity provider authority that issued the credentials.'
      ]},
      { type: 'warning', text: 'Decoding a JWT client-side does not verify its cryptographic validity. Never trust claims on the backend without validating the signature with the secret key or public certificate.' }
    ]
  },
  {
    slug: 'markdown-ast-parsing-xss-sanitization',
    title: 'Parsing Markdown to HTML Safely: Abstract Syntax Trees and XSS Sanitization',
    category: 'Developer Tools',
    tags: ['Markdown', 'AST', 'XSS', 'Sanitization'],
    excerpt: 'Rendering user-supplied Markdown directly into innerHTML is the number one cause of stored XSS vulnerabilities. Learn how modern AST pipelines sanitize HTML.',
    author: 'Elena Rostova',
    authorRole: 'Core Systems Architect',
    date: '2026-08-23',
    readingMinutes: 6,
    badge: 'XSS DEFENSE',
    theme: 'red',
    relatedTool: { name: 'Markdown Editor & Live Preview', path: '/tools/utilities/markdown-preview' },
    content: [
      { type: 'p', text: 'Markdown allows raw HTML tags by default per the CommonMark specification. If your web app blindly passes markdown parser output to dangerouslySetInnerHTML, attackers can inject malicious <script> tags or onerror attributes to steal authentication session tokens.' },
      { type: 'h2', text: 'The Modern Unified/Remark AST Pipeline' },
      { type: 'p', text: 'Secure Markdown rendering follows a three-stage pipeline:' },
      { type: 'ol', items: [
        'Parse: The Markdown string is parsed into a Markdown Abstract Syntax Tree (mdast).',
        'Transform: The mdast is transformed into a Hypertext Abstract Syntax Tree (hast).',
        'Sanitize: A strict HTML sanitizer (such as DOMPurify or rehype-sanitize) strips dangerous attributes (onclick, onload) and unsafe tags (<script>, <iframe>).'
      ]},
      { type: 'p', text: 'By performing AST-level sanitization before DOM insertion, your applications deliver rich formatting without opening security vulnerabilities.' }
    ]
  },
  {
    slug: 'uuid-v4-vs-uuid-v7-monotonic-sorting',
    title: 'UUIDv4 vs UUIDv7: Why Time-Ordered Monotonic Identifiers Beat Random Keys',
    category: 'Developer Tools',
    tags: ['UUID', 'Database', 'UUIDv7', 'Performance'],
    excerpt: 'Random UUIDv4 identifiers cause severe B-tree page fragmentation in PostgreSQL and MySQL databases. Discover how RFC 9562 UUIDv7 restores indexing performance.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-08-20',
    readingMinutes: 6,
    badge: 'UUIDV7 SPEC',
    theme: 'teal',
    relatedTool: { name: 'UUID & NanoID Generator', path: '/tools/developer/uuid-generator' },
    content: [
      { type: 'p', text: 'For decades, developers generated UUIDv4 (122 bits of pseudo-random entropy) for database primary keys. While UUIDv4 guarantees global uniqueness without coordination, its total randomness wreaks havoc on relational database indexes.' },
      { type: 'h2', text: 'The B-Tree Index Fragmentation Crisis' },
      { type: 'p', text: 'Relational databases store primary keys in sorted B-tree data structures. Because UUIDv4 values are completely random, every new row insertion requires jumping to a random leaf page in the index tree. As tables grow past RAM cache limits, this leads to continuous page splits and slow disk I/O.' },
      { type: 'h2', text: 'The UUIDv7 Architecture (RFC 9562)' },
      { type: 'ul', items: [
        '48-Bit Unix Epoch Timestamp: The first 6 bytes encode milliseconds since 1970, ensuring natural chronological ordering.',
        '4-Bit Version & Sub-Millisecond Counter: Enforces monotonic sequence ordering for IDs generated within the exact same millisecond.',
        '62 Bits of Cryptographic Randomness: Guarantees global collision resistance across distributed nodes.'
      ]},
      { type: 'tip', text: 'Switching to UUIDv7 delivers the uniqueness of UUIDs with the sequential insertion performance of auto-incrementing integers.' }
    ]
  },
  {
    slug: 'calculating-css-specificity-tuples-debugging',
    title: 'Calculating CSS Specificity Tuples: Debugging Cascade Wars Efficiently',
    category: 'Developer Tools',
    tags: ['CSS', 'Specificity', 'Cascade', 'Web Standards'],
    excerpt: 'Stop appending !important to resolve style conflicts. Master the (A, B, C) specificity tuple calculation and understand how :where() and @layer change the game.',
    author: 'Kavita Patel',
    authorRole: 'Design Systems Lead',
    date: '2026-08-17',
    readingMinutes: 5,
    badge: 'CSS CASCADE',
    theme: 'blue',
    relatedTool: { name: 'CSS Specificity Calculator', path: '/tools/developer/css-specificity' },
    content: [
      { type: 'p', text: 'When a button refuses to adopt your background color, the culprit is almost always CSS specificity. Understanding how browsers calculate selector weights eliminates guesswork and prevents messy !important wars.' },
      { type: 'h2', text: 'The Three-Component Tuple (A, B, C)' },
      { type: 'ul', items: [
        'A (ID Selectors): Count of ID selectors (e.g., #header, #nav). Each adds (1, 0, 0).',
        'B (Classes, Attributes & Pseudo-Classes): Count of .btn, [type="text"], and :hover. Each adds (0, 1, 0).',
        'C (Elements & Pseudo-Elements): Count of div, h1, and ::before. Each adds (0, 0, 1).'
      ]},
      { type: 'h2', text: 'Modern Specificity Resets' },
      { type: 'p', text: 'Modern CSS provides two powerful mechanisms to tame the cascade:' },
      { type: 'ul', items: [
        ':is() adopts the specificity of its highest-weight selector in the list.',
        ':where() always carries exactly (0, 0, 0) specificity, making it ideal for base design system resets.',
        '@layer groups styles into explicit cascade priority tiers regardless of selector weight.'
      ]}
    ]
  },
  {
    slug: 'url-encoding-quirks-rfc3986-query-params',
    title: 'URL Encoding Traps: RFC 3986, encodeURIComponent, and Application/X-WWW-Form-Urlencoded',
    category: 'Developer Tools',
    tags: ['URL Encoding', 'RFC 3986', 'HTTP', 'Web Standards'],
    excerpt: 'Why does encodeURIComponent not encode exclamation marks? Why do some servers replace spaces with + instead of %20? Master HTTP URL encoding rules.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-08-14',
    readingMinutes: 5,
    badge: 'URL RFC3986',
    theme: 'amber',
    relatedTool: { name: 'URL Encoder & Decoder', path: '/tools/developer/url-encoder' },
    content: [
      { type: 'p', text: 'URLs can only be sent over the internet using the standard ASCII character set. Any character outside this range must be percent-encoded. However, subtle differences between standards frequently cause broken query strings.' },
      { type: 'h2', text: 'encodeURI vs encodeURIComponent' },
      { type: 'p', text: 'encodeURI preserves URL structure characters (: / ? # [ ] @) because it expects a complete URI. In contrast, encodeURIComponent encodes these reserved delimiters, making it suitable for individual query parameter values.' },
      { type: 'h2', text: 'The Space Dilemma: %20 vs +' },
      { type: 'p', text: 'According to RFC 3986, spaces in URL paths and queries must be encoded as %20. However, the legacy application/x-www-form-urlencoded specification encoded spaces as +. Modern URLSearchParams handles this translation automatically.' }
    ]
  },
  {
    slug: 'docker-compose-yaml-linting-in-browser',
    title: 'Linting and Validating Docker Compose Files Client-Side with YAML ASTs',
    category: 'Developer Tools',
    tags: ['Docker', 'YAML', 'DevOps', 'Validation'],
    excerpt: 'Catch indentation mismatches, deprecated version keys, and circular service dependencies before deploying your development stack.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-08-11',
    readingMinutes: 6,
    badge: 'DOCKER YAML',
    theme: 'cyan',
    relatedTool: { name: 'YAML to JSON Converter', path: '/tools/developer/yaml-converter' },
    content: [
      { type: 'p', text: 'A single misaligned two-space indentation in a docker-compose.yml file can fail a deployment or bind container ports incorrectly. Validating compose files in the browser before pushing commits saves valuable CI/CD pipeline time.' },
      { type: 'h2', text: 'Common Docker Compose Errors' },
      { type: 'ul', items: [
        'Port Mapping Quotes: Writing 80:80 without quotes can be parsed as base-60 sexagesimal integers in YAML 1.1.',
        'Deprecated version Key: Modern Docker Compose specifications no longer require top-level version: "3.8".',
        'Volume Mount Formatting: Omitting leading relative dots (./data instead of data) accidentally creates named volumes instead of host bind mounts.'
      ]},
      { type: 'p', text: 'Our client-side linter parses YAML into an AST, checks keys against the Compose specification, and highlights line-level syntax issues immediately in your browser.' }
    ]
  },
  {
    slug: 'sublime-regex-lookahead-lookbehind-guide',
    title: 'Mastering Regex Lookahead and Lookbehind Assertions for Data Cleanup',
    category: 'Developer Tools',
    tags: ['Regex', 'Lookaround', 'String Parsing', 'Tutorial'],
    excerpt: 'Match passwords with numbers, extract currency values without symbols, and strip HTML tags safely using zero-width lookaround assertions.',
    author: 'Liam Chen',
    authorRole: 'Developer Experience Engineer',
    date: '2026-08-08',
    readingMinutes: 6,
    badge: 'REGEX LOOKAROUND',
    theme: 'slate',
    relatedTool: { name: 'Regex Tester & Debugger', path: '/tools/developer/regex-tester' },
    content: [
      { type: 'p', text: 'Lookaround assertions are zero-width matches: they inspect characters before or after the current position without including those characters in the matched string result. They are essential for advanced text transformation and data sanitization.' },
      { type: 'h2', text: 'The Four Lookaround Types' },
      { type: 'ul', items: [
        'Positive Lookahead (?=...): Matches if followed by the pattern. E.g., \\d+(?=px) matches numbers followed by "px" without capturing "px".',
        'Negative Lookahead (?!...): Matches if NOT followed by the pattern. E.g., \\d+(?!px) matches numbers not followed by "px".',
        'Positive Lookbehind (?<=...): Matches if preceded by the pattern. E.g., (?<=\\$)\\d+ matches dollar figures without capturing the "$" symbol.',
        'Negative Lookbehind (?<!...): Matches if NOT preceded by the pattern.'
      ]},
      { type: 'tip', text: 'Modern JavaScript regex engines natively support variable-length lookbehind assertions, enabling sophisticated parsing directly in the browser.' }
    ]
  }
]
