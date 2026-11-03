# PDF compatibility verification

Verified on 2026-11-03 with a production Vite build and local Chrome.

- `npm run lint`, the 21 existing data checks, six PDF pagination checks, and `npm run build` pass.
- Clicked the compatibility download button for three local one-page resume variants. Each downloaded a single-page A4 PDF with one image, no fonts, no text layer, no links, and no JavaScript/action/form/attachment objects.
- Verified a long Minimal resume downloads as three pages; rendered all pages and inspected page boundaries and final content.
- Verified the regular print button still prepares a portal, removes preview decorations, invokes printing, and cleans up after `afterprint`.
- Rendered and visually inspected downloaded pages, including Chinese text, bold text, avatars, and SVG icons.
- Compatibility libraries load only when requested; the initial application bundle does not include the raster renderer or PDF writer.

The standard export keeps selectable text. The fallback uses image-only pages, so automated resume parsing requires OCR. Slight overflow (up to 15% of one page's content height) scales down to avoid a nearly empty second page; longer content paginates. Pagination seeks blank rows near the page end, but does not guarantee whole sections stay together.

No live Beisen upload was performed as part of this local check. The rejection rule is unknown, and acceptance is not guaranteed. Original browser PDFs checked locally did not contain JavaScript, automatic actions, embedded files, or forms; `/AAAAAA+...` was a subset font name, not an `/AA` action dictionary. Do not infer malicious code from the upload message alone.

Personal resume data and generated PDFs/previews are not committed to this tool repository.
