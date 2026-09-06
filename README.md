# Resume Craft

[English](README.md) | [简体中文](README.zh-CN.md)

In-browser resume editor with live preview, multiple templates, and PDF export. Data stays in `localStorage`.

## Features

- Edit personal info, education, skills, projects, and work experience
- Templates: Classic / Minimal
- Avatar upload and tech-stack tags
- Print / PDF export

## Workflow

The home page (`#/`) provides editor and template entry points. Open `#/editor` to edit directly. Switching templates preserves content. The editor supports undo/redo for this session (up to 30 checkpoints), a document title, and a More menu for JSON backup, import, reset, and blank creation.

Changes are stored in this browser with explicit failure feedback. Export a JSON backup before clearing browser storage or moving devices. Imports are validated and limited to 5 MB; retired layouts migrate to Classic. PDF export opens the browser print dialog: choose Save as PDF. Pagination in the preview is an estimate; check the print preview before saving.

## Validation

```bash
npm run lint
npm test
npm run build
```

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion

## Usage

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## License

[MIT](LICENSE)
