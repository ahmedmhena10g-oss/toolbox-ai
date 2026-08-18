export interface BlogLink {
  slug: string;
  label: string;
}

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tool"; slug: string; intro: string }
  | { type: "tip"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  content: BlogBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-compress-jpg-images",
    title: "How to Compress JPG Images Without Losing Quality",
    seoTitle: "How to Compress JPG Images Without Losing Quality (2026 Guide)",
    seoDescription:
      "Learn how to compress JPG images without visible quality loss. We explain quality vs file size, metadata removal and the best free online compressor.",
    excerpt:
      "JPG files can be compressed by 50–90% with almost no visible change. Here's how quality settings work and the fastest way to shrink your photos.",
    date: "2026-01-12",
    readTime: "5 min read",
    category: "Image",
    content: [
      { type: "p", text: "JPG is the most common image format on the web, but cameras and phone photos often arrive with file sizes far larger than a webpage actually needs. A 12-megapixel photo can easily be 4–6 MB, which slows down your site and your email attachments. The good news: most JPGs compress by 50–90% with no visible change." },
      { type: "h2", text: "Why JPG files are so large" },
      { type: "p", text: "JPG already uses lossy compression, but the amount of compression is set when the file is saved. A camera saves at quality 92–100 because it can't know your final use. When you compress, you trade a little of that invisible detail for a much smaller file." },
      { type: "h2", text: "How JPG compression works" },
      { type: "ul", items: [
        "Quality level: 70–85% looks virtually identical to the original on most screens, while cutting file size dramatically.",
        "Resolution: downsizing a 4000px photo to 1920px is the single biggest size reduction — and nobody can tell on a website.",
        "Metadata: cameras embed location, device and color profiles. Removing them saves space for free, with zero quality loss.",
      ] },
      { type: "h3", text: "The right quality level for each use" },
      { type: "ul", items: [
        "Websites and social media: quality 70–80%.",
        "Email attachments: quality 60–70% if recipients don't need to zoom.",
        "Printing and archival: quality 90%+ and keep the original file.",
      ] },
      { type: "tool", slug: "image-compressor", intro: "The fastest way to do all of this is our free online image compressor — it shows the original size, compressed size and exact percentage saved before you download." },
      { type: "h2", text: "Common mistakes to avoid" },
      { type: "ul", items: [
        "Re-saving an already compressed JPG repeatedly — every save adds a small quality loss.",
        "Compressing an image you'll edit later — edit first, compress last.",
        "Using maximum compression on text or logos — those should be PNG.",
      ] },
      { type: "tip", text: "Rule of thumb: if you can't see the difference side by side at 100% zoom, your compression is invisible. If you can, back the quality off a few percent." },
    ],
  },
  {
    slug: "jpg-vs-png",
    title: "JPG vs PNG: Which Format Should You Use?",
    seoTitle: "JPG vs PNG: The Complete Comparison (2026)",
    seoDescription:
      "JPG or PNG? We compare file size, quality, transparency and best use cases so you always pick the right image format for photos, logos and graphics.",
    excerpt:
      "Photos go to JPG, logos go to PNG — but why? Here's the practical difference in file size, quality and transparency, with concrete recommendations.",
    date: "2026-01-05",
    readTime: "6 min read",
    category: "Image",
    content: [
      { type: "p", text: "JPG and PNG are the two most common image formats on the web, and choosing between them comes down to one question: what is in your image?" },
      { type: "h2", text: "The core difference" },
      { type: "ul", items: [
        "JPG is lossy — it discards detail to save space. Great for photos, bad for sharp text and logos.",
        "PNG is lossless — every pixel is preserved exactly. It also supports transparency, which JPG does not.",
      ] },
      { type: "h2", text: "When to use JPG" },
      { type: "p", text: "Photographs, real-world scenes, gradients and anything with smooth color transitions. A JPG of a photo is typically 5–10 times smaller than the same photo as PNG, and the quality difference is invisible." },
      { type: "h2", text: "When to use PNG" },
      { type: "ul", items: [
        "Logos, icons and graphics with flat colors.",
        "Text and screenshots, where sharp edges matter.",
        "Images with transparency that need to sit on any background.",
      ] },
      { type: "tool", slug: "png-to-jpg", intro: "Already have a PNG that belongs as a JPG? Convert it in seconds and choose a background color for the transparent areas." },
      { type: "tool", slug: "jpg-to-png", intro: "Or the other way around — convert JPG to PNG when you need lossless quality or plan to edit further." },
      { type: "h2", text: "The middle ground: WebP" },
      { type: "p", text: "For websites, WebP often beats both: it compresses photos like JPG while supporting transparency like PNG. All modern browsers support it, which is why it's the recommended format for new websites." },
      { type: "tool", slug: "webp-converter", intro: "Convert any image to WebP in one click — usually 25–35% smaller than the equivalent JPG at the same quality." },
      { type: "tip", text: "The short version: photos and backgrounds → JPG or WebP. Logos, text and transparent graphics → PNG or WebP." },
    ],
  },
  {
    slug: "how-to-reduce-pdf-size",
    title: "How to Reduce PDF File Size: 5 Proven Methods",
    seoTitle: "How to Reduce PDF File Size (Fast & Free, 2026)",
    seoDescription:
      "Reduce PDF file size quickly: compress embedded images, remove redundant content and use a free online PDF compressor. Step-by-step instructions included.",
    excerpt:
      "PDFs grow fast when they contain photos and scans. Learn the methods that actually work — from quick online compression to smart image settings.",
    date: "2026-01-18",
    readTime: "6 min read",
    category: "PDF",
    content: [
      { type: "p", text: "A 50-page PDF with embedded photos can easily be 50–100 MB — far too large for email and painful to upload. The good news is that most of that bulk is compressible images, and you can usually cut the file by half or more." },
      { type: "h2", text: "Why PDFs are so large" },
      { type: "p", text: "PDFs store images inside the document. When those images were added at full camera resolution, the PDF carries every one of those megabytes, even if the page only shows a small thumbnail." },
      { type: "h2", text: "Method 1: Use an online PDF compressor" },
      { type: "p", text: "The fastest approach: upload the PDF, pick a compression level, and let the tool re-encode the embedded images at a smarter quality. Text stays crisp because text in PDFs is vector data, not pixels." },
      { type: "tool", slug: "compress-pdf", intro: "Our free PDF compressor shows the original size, the new size and the exact percentage saved before you download." },
      { type: "h2", text: "Method 2: Save as 'reduced size' from your editor" },
      { type: "p", text: "Adobe Acrobat, Preview and most PDF editors have a built-in 'reduce file size' or 'optimize' option. It does roughly the same as online compression, just inside the editor." },
      { type: "h2", text: "Method 3: Remove unneeded content" },
      { type: "ul", items: [
        "Delete pages you don't need (cover pages, blank pages, back matter).",
        "Replace scanned pages with text where the source document exists.",
        "Remove embedded fonts you're not using.",
      ] },
      { type: "tool", slug: "split-pdf", intro: "If a document has sections you don't need, split the PDF first and compress only what you keep." },
      { type: "h2", text: "Method 4: Scan at the right resolution" },
      { type: "p", text: "Scanning at 300 DPI is the sweet spot for readable documents. Scanning at 600 DPI quadruples the file size for detail nobody reads. For text-only documents, 200 DPI is often enough." },
      { type: "h2", text: "Method 5: Recreate the PDF from optimized images" },
      { type: "p", text: "If the PDF is just scanned pages or photos, convert the images to JPEG at quality 70–80%, then build a fresh PDF from them." },
      { type: "tool", slug: "jpg-to-pdf", intro: "Compress your images first, then combine them into a clean PDF — the whole pipeline is free and runs in your browser." },
      { type: "tip", text: "Aim for under 10 MB for email. For web uploads, under 5 MB is ideal. Anything more and you're paying for invisible detail." },
    ],
  },
  {
    slug: "how-to-convert-jpg-to-pdf",
    title: "How to Convert JPG to PDF (Step-by-Step)",
    seoTitle: "How to Convert JPG to PDF — Free & Easy (2026)",
    seoDescription:
      "Convert JPG images to PDF in seconds — combine multiple photos into one document, choose page size and orientation, and download. No sign-up needed.",
    excerpt:
      "Need to turn photos or scans into a PDF? Here's how to combine multiple JPGs into one document with the right page size and orientation.",
    date: "2026-01-22",
    readTime: "4 min read",
    category: "PDF",
    content: [
      { type: "p", text: "Converting JPG images to PDF is one of the most common document tasks — whether you're sending scanned contracts, compiling product photos or creating a photo book. The process takes seconds and requires no software installation." },
      { type: "h2", text: "Why convert images to PDF?" },
      { type: "ul", items: [
        "One file instead of ten — easier to email and archive.",
        "PDFs print consistently across devices.",
        "Recipients can't accidentally delete or alter pages as easily.",
      ] },
      { type: "h2", text: "How to convert JPG to PDF" },
      { type: "ol", items: [
        "Upload your JPG images — you can add as many as you need.",
        "Arrange them in the order you want (drag to reorder).",
        "Choose the page size (A4, Letter, A3), orientation and margins.",
        "Click convert and download your PDF.",
      ] },
      { type: "tool", slug: "jpg-to-pdf", intro: "Our free JPG to PDF converter does all of this in your browser — your images never leave your device." },
      { type: "h2", text: "Which page size should I pick?" },
      { type: "ul", items: [
        "A4 portrait for documents and scanned paper.",
        "Letter for US business documents.",
        "Landscape for presentations and wide images.",
      ] },
      { type: "h2", text: "JPG or PNG source images?" },
      { type: "p", text: "Use PNG if your images contain text, logos or transparency — the PDF will look sharper. Use JPG for photos, where the smaller source files keep the PDF compact." },
      { type: "tool", slug: "png-to-pdf", intro: "Converting PNG files instead? The PNG to PDF tool supports transparency and the same layout options." },
      { type: "tip", text: "Tip: combine related images into a single PDF for delivery, but keep the originals — you may need to edit them later." },
    ],
  },
  {
    slug: "what-is-webp",
    title: "What Is WebP? The Modern Image Format Explained",
    seoTitle: "What Is WebP? Benefits, Support & How to Use It (2026)",
    seoDescription:
      "WebP is a modern image format that compresses up to 35% better than JPG with the same quality. Learn how it works, browser support and when to use it.",
    excerpt:
      "WebP images load faster because they're smaller — typically 25–35% smaller than JPG at the same quality. Here's everything you need to know.",
    date: "2026-02-02",
    readTime: "5 min read",
    category: "Image",
    content: [
      { type: "p", text: "WebP is a modern image format created by Google and released in 2010. Its goal is simple: deliver the same visual quality as JPG and PNG in a smaller file — which means faster-loading websites and lower bandwidth bills." },
      { type: "h2", text: "How WebP compresses better" },
      { type: "p", text: "WebP uses modern compression techniques borrowed from video encoding (VP8/VP9 and AV1 for the newer variants). It applies smarter prediction — borrowing color data from neighboring pixels — so it needs fewer bytes to describe the same image." },
      { type: "h2", text: "The practical benefits" },
      { type: "ul", items: [
        "25–35% smaller files than JPG at equal quality.",
        "Supports transparency (like PNG) in a much smaller file.",
        "Supports animation (like GIF) in a fraction of the size.",
        "Lossy and lossless modes in a single format.",
      ] },
      { type: "h2", text: "Browser support" },
      { type: "p", text: "WebP is supported by every major browser — Chrome, Firefox, Safari, Edge and Opera — on desktop and mobile. Safari added full support in 2020, which removed the last major obstacle." },
      { type: "tool", slug: "webp-converter", intro: "Convert your JPG and PNG images to WebP in seconds to see exactly how much smaller they get." },
      { type: "h2", text: "When should you use WebP?" },
      { type: "ul", items: [
        "Website images, hero banners and product photos — always.",
        "Icons and logos with transparency — WebP replaces PNG at half the size.",
        "Email — check your email client first; some still prefer JPG/PNG.",
        "Print — no. Print workflows expect JPG, PNG or TIFF.",
      ] },
      { type: "h2", text: "Converting back from WebP" },
      { type: "p", text: "Need a JPG or PNG version for a client or legacy tool? Conversion back is lossless in the sense that you get the best available version of the compressed data." },
      { type: "tool", slug: "webp-converter", intro: "The same converter handles WebP → JPG and WebP → PNG, so you can move between formats in both directions." },
      { type: "tip", text: "For new websites: serve WebP with JPG/PNG as a fallback and you get the best of both worlds — tiny files everywhere, zero compatibility risk." },
    ],
  },
  {
    slug: "how-ocr-works",
    title: "How OCR Works: A Simple Explanation",
    seoTitle: "How OCR Works — Optical Character Recognition Explained",
    seoDescription:
      "How does OCR turn images of text into editable text? Learn about pattern recognition, feature extraction and why clean scans give better results.",
    excerpt:
      "OCR reads text from images by recognizing character shapes. Here's how it works under the hood — and why image quality matters so much.",
    date: "2026-02-10",
    readTime: "5 min read",
    category: "OCR",
    content: [
      { type: "p", text: "OCR — optical character recognition — is the technology that turns an image of text (a photo, scan or screenshot) into actual, editable text. It's how you can search a scanned PDF or copy text out of a photo." },
      { type: "h2", text: "Step 1: Find the text" },
      { type: "p", text: "The engine first analyzes the image to locate regions that look like text — lines, blocks, words. It converts the image to black and white (or analyzes contrast) so the character shapes stand out." },
      { type: "h2", text: "Step 2: Recognize the characters" },
      { type: "p", text: "Modern OCR uses two complementary techniques: pattern matching compares each character shape against known glyph shapes, while feature extraction breaks characters into components (loops, strokes, crossings) and classifies them. Neural networks — the same technology behind modern AI — have made this step remarkably accurate." },
      { type: "h2", text: "Step 3: Language modeling" },
      { type: "p", text: "The engine then checks the recognized words against a language model. If it reads 'teh' where the context strongly suggests 'the', it corrects it. This is why OCR engines are language-specific and why choosing the right language setting matters." },
      { type: "tool", slug: "image-to-text", intro: "Try it yourself: our free OCR tool extracts text from images and supports Arabic, English, French, Spanish and German." },
      { type: "h2", text: "What makes OCR accurate?" },
      { type: "ul", items: [
        "Resolution: 300 DPI scans beat 72 DPI photos.",
        "Straight text: skewed lines confuse the recognition stage.",
        "Clean backgrounds: contrast is everything.",
        "Standard fonts: handwriting and decorative fonts are much harder.",
      ] },
      { type: "h2", text: "OCR on PDFs" },
      { type: "p", text: "Digital PDFs store real text and need no OCR. Scanned PDFs are images, so OCR is required — which is why the same recognition technology is used for both." },
      { type: "tool", slug: "pdf-to-text", intro: "Extract text from any PDF — instantly for digital files, or with OCR for scanned pages." },
      { type: "tip", text: "If OCR results are poor, the fastest fix is usually a better image: scan at 300 DPI, keep the page flat and well lit." },
    ],
  },
  {
    slug: "how-to-extract-text-from-images",
    title: "How to Extract Text from Images (Photos & Screenshots)",
    seoTitle: "How to Extract Text from Images — 3 Easy Ways (2026)",
    seoDescription:
      "Extract text from images and screenshots in seconds: use a free OCR tool, your phone's built-in camera OCR, or a browser extension. Step-by-step.",
    excerpt:
      "Need the text out of a photo, scan or screenshot? Here are three reliable ways to extract it — including a free, private browser tool.",
    date: "2026-02-15",
    readTime: "4 min read",
    category: "OCR",
    content: [
      { type: "p", text: "Extracting text from an image used to mean retyping it by hand. Today it takes seconds — OCR technology reads the characters and gives you clean, editable text." },
      { type: "h2", text: "Method 1: Use an online OCR tool (fastest)" },
      { type: "ol", items: [
        "Upload your image or screenshot.",
        "Select the language of the text.",
        "Click extract and copy the result, or download it as TXT, DOCX or PDF.",
      ] },
      { type: "tool", slug: "image-to-text", intro: "Our image to text converter does exactly this — in your browser, with support for Arabic, English, French, Spanish and German." },
      { type: "h2", text: "Method 2: Use your phone's built-in OCR" },
      { type: "ul", items: [
        "iPhone: open the photo in the Photos app, tap the text-scan icon, then copy.",
        "Android: Google Lens can copy text from any photo or live camera view.",
        "Both work offline on recent devices.",
      ] },
      { type: "h2", text: "Method 3: Extract text from PDFs" },
      { type: "p", text: "If your text is trapped in a PDF — especially a scanned one — the same OCR technology applies to the pages." },
      { type: "tool", slug: "pdf-to-text", intro: "Extract text from digital PDFs instantly, or run OCR on scanned pages." },
      { type: "h2", text: "Getting the best results" },
      { type: "ul", items: [
        "Use the highest resolution available — screenshots beat photos of screens.",
        "Crop to the text area if the image contains lots of background.",
        "Choose the correct language setting for the document.",
      ] },
      { type: "tool", slug: "ai-ocr", intro: "For messy scans, AI OCR also cleans the output — fixing spacing and merging broken lines." },
      { type: "tip", text: "Handwriting is the hard case. Printed and digital text extracts with near-perfect accuracy; handwriting varies wildly." },
    ],
  },
  {
    slug: "how-to-resize-images-without-losing-quality",
    title: "How to Resize Images Without Losing Quality",
    seoTitle: "How to Resize Images Without Losing Quality (2026)",
    seoDescription:
      "Resize images without quality loss: the truth about downscaling vs upscaling, aspect ratio lock, and the best free tool for the job.",
    excerpt:
      "Resizing down is safe, resizing up is risky. Here's what actually happens to your pixels and how to resize like a professional.",
    date: "2026-03-01",
    readTime: "5 min read",
    category: "Image",
    content: [
      { type: "p", text: "Resizing is one of the most common image tasks, and also one of the most misunderstood. The single most important fact: shrinking an image loses no visible quality, while enlarging it cannot create detail that isn't there." },
      { type: "h2", text: "Downscaling: safe and effective" },
      { type: "p", text: "When you shrink an image, the resizer blends groups of pixels into one. Modern algorithms (like the high-quality resampling used by our tool) average colors intelligently, so the result looks sharp and clean. A 4000px photo scaled to 1600px looks identical on a screen — just a fraction of the size." },
      { type: "h2", text: "Upscaling: the quality trap" },
      { type: "ul", items: [
        "Enlarging an image means creating pixels that don't exist.",
        "Simple algorithms guess and produce blur or pixelation.",
        "AI upscalers can reconstruct plausible detail, but it's not the original image.",
        "Rule: start from the largest source you have.",
      ] },
      { type: "h2", text: "Always lock the aspect ratio" },
      { type: "p", text: "Distorted images are worse than blurry ones. When you set only the width (or only the height) with the aspect ratio locked, the other dimension scales automatically and proportions stay perfect." },
      { type: "tool", slug: "image-resizer", intro: "Our free image resizer handles width, height, percentage and presets — with aspect ratio lock built in." },
      { type: "h2", text: "Resize then compress" },
      { type: "p", text: "The one-two punch for web images: resize to the display size, then compress. A 1920px hero image at quality 75 loads in a blink and looks identical to the original." },
      { type: "tool", slug: "image-compressor", intro: "After resizing, run the result through the image compressor and watch the file size drop." },
      { type: "h2", text: "Common sizes that actually matter" },
      { type: "ul", items: [
        "1920px wide — full-width hero banners.",
        "1200px wide — blog content images.",
        "1080×1080, 1080×1350 — Instagram.",
        "1280×720 — YouTube thumbnails.",
        "300px, 600px, 1200px — responsive image sets.",
      ] },
      { type: "tip", text: "Never enlarge a small image for print. A 300px logo at 8 inches wide will look terrible no matter the tool — ask the client for a vector or a larger original." },
    ],
  },
  {
    slug: "how-to-convert-webp-to-jpg",
    title: "How to Convert WebP to JPG (and Why You Might Need To)",
    seoTitle: "How to Convert WebP to JPG — Free & Instant (2026)",
    seoDescription:
      "Convert WebP to JPG in seconds: the fast online method plus browser workarounds. Learn when JPG still beats WebP and how to convert without quality loss.",
    excerpt:
      "WebP is everywhere now, but JPG is still required by some tools and printers. Here's how to convert WebP to JPG fast, plus when you actually should.",
    date: "2026-03-08",
    readTime: "4 min read",
    category: "Image",
    content: [
      { type: "p", text: "WebP has become the default format on many websites because it loads faster. But occasionally you need an old-school JPG: for an email client that doesn't render WebP, a print shop, or a legacy CMS that rejects it." },
      { type: "h2", text: "The fastest way to convert" },
      { type: "ol", items: [
        "Upload your WebP file.",
        "Choose JPG as the target format.",
        "Pick a quality level (85% is a good default).",
        "Download — done in seconds.",
      ] },
      { type: "tool", slug: "webp-converter", intro: "Our WebP converter handles WebP → JPG and WebP → PNG, plus the reverse directions, all in your browser." },
      { type: "h2", text: "What happens to quality when converting?" },
      { type: "p", text: "Converting WebP to JPG re-encodes the image as JPG. Since both are lossy formats, the result is a second-generation copy — visually identical at high quality settings, but technically one generation removed from the source. If the original JPG exists, use it instead." },
      { type: "h2", text: "When JPG still wins" },
      { type: "ul", items: [
        "Print workflows and photo labs.",
        "Email clients that block or mangle WebP attachments.",
        "Legacy software and CMS upload filters.",
        "When recipients specifically ask for JPG.",
      ] },
      { type: "h2", text: "When WebP wins" },
      { type: "p", text: "On websites, WebP is almost always the better choice — smaller files, faster loading, full browser support since 2020. If you're optimizing a website, the direction you want is JPG → WebP, not the reverse." },
      { type: "tool", slug: "webp-converter", intro: "Converting JPG and PNG to WebP for your site? The same tool does that too — and shows you the size difference." },
      { type: "tip", text: "Need both formats? Convert to WebP for your site and keep the JPG for print and email. Two files, zero compromises." },
    ],
  },
];

export const blogBySlug = Object.fromEntries(blogPosts.map((post) => [post.slug, post])) as Record<
  string,
  BlogPost
>;
