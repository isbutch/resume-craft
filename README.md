# CraftCV

[简体中文](README.zh-CN.md) | English

CraftCV is a browser-based resume editor for writing, previewing, and exporting a polished resume without an account.

![CraftCV home page](docs/assets/homepage.png)

## What it does

- Start from the home page or open `#/editor` directly.
- Edit profile, education, skills, work experience, projects, and achievements with a live A4 preview.
- Choose between Classic and Minimal layouts while preserving your content.
- Upload and crop an avatar, adjust typography and colors, and export through the browser print dialog.
- Undo or redo recent edits, then import or export a JSON backup.

## Data and privacy

Resume data stays in the current browser's `localStorage`; CraftCV does not provide an account or server-side storage. Export a JSON backup before clearing browser data or moving to another device.

The bundled resume is an anonymized example for layout reference. Older built-in demo caches are migrated to the current anonymous example on load.

## Recruitment-site compatible PDF

Use the regular **Export PDF** first to keep selectable, searchable text. If a recruitment site such as Beisen rejects the file as containing illegal code, try **More → 导出兼容 PDF（图片版）**.

The compatibility export renders the resume locally into images and creates a simple A4 PDF without embedded fonts, hyperlinks, forms, scripts, or a browser tag tree. Long resumes paginate near blank rows to avoid splitting text. No resume is uploaded to a server.

**Image-only PDFs have no selectable or searchable text; automated resume parsing requires OCR.** Keep the normal PDF and JSON backup. Acceptance must still be checked on the target website; a rejection alone does not establish that a PDF contains malicious code.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For a production build:

```bash
npm run build
npm run preview
```

## Validation

```bash
npm run lint
npm test
npm run build
```

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion

## License

[MIT](LICENSE)
