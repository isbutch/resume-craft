import { preparePrintImage, withTimeout } from './printPreparation';

export function imagePageLayout(width: number, height: number) {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) throw new Error('无效的页面尺寸。');
  const widthMm = 198;
  const heightMm = 285;
  const naturalHeight = height * widthMm / width;
  // Slight overflow should not leave a mostly empty second page. Limit shrinking.
  const fitSinglePage = naturalHeight <= heightMm * 1.15;
  const drawWidthMm = fitSinglePage ? Math.min(widthMm, heightMm * width / height) : widthMm;
  return { drawWidthMm, pageHeight: fitSinglePage ? height : Math.floor(width * heightMm / widthMm) };
}

/** Use each pixel row exactly once; prefer whitespace near page boundaries. */
export function pageSlices(height: number, pageHeight: number, chooseBreak = (_start: number, end: number) => end) {
  if (!Number.isInteger(height) || height <= 0 || !Number.isInteger(pageHeight) || pageHeight <= 0) {
    throw new Error('无效的页面尺寸。');
  }
  const slices: { start: number; end: number }[] = [];
  for (let start = 0; start < height;) {
    const idealEnd = Math.min(height, start + pageHeight);
    const candidate = idealEnd < height ? chooseBreak(start, idealEnd) : idealEnd;
    const end = Number.isInteger(candidate) && candidate > start && candidate <= idealEnd ? candidate : idealEnd;
    slices.push({ start, end });
    start = end;
  }
  return slices;
}

/** Image-only PDF: no fonts, links, forms, scripts, or browser tag tree. */
export async function canvasToCompatibilityPdf(canvas: HTMLCanvasElement, title: string) {
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  pdf.setCreator('CraftCV');
  pdf.setProducer('CraftCV');
  const margin = 6;
  const { drawWidthMm: contentWidth, pageHeight } = imagePageLayout(canvas.width, canvas.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('浏览器无法创建画布。');
  const slices = pageSlices(canvas.height, pageHeight, (start, end) => {
    // Look for two consecutive blank rows so a line of text is not cut in half.
    const rows = Math.min(end - start - 1, Math.ceil(canvas.width * 0.06));
    if (rows < 2) return end;
    const { data } = context.getImageData(0, end - rows, canvas.width, rows);
    let blankRows = 0;
    for (let y = rows - 1; y >= 0; y--) {
      let blank = true;
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (data[i] < 248 || data[i + 1] < 248 || data[i + 2] < 248) { blank = false; break; }
      }
      blankRows = blank ? blankRows + 1 : 0;
      if (blankRows >= 2) return end - rows + y + 1;
    }
    return end;
  });
  const mm = 72 / 25.4;
  for (const { start, end } of slices) {
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = end - start;
    const ctx = slice.getContext('2d');
    if (!ctx) throw new Error('浏览器无法创建画布。');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, start, canvas.width, slice.height, 0, 0, slice.width, slice.height);
    const image = await pdf.embedJpg(slice.toDataURL('image/jpeg', 0.94));
    const page = pdf.addPage([210 * mm, 297 * mm]);
    const imageHeight = slice.height * contentWidth / canvas.width * mm;
    page.drawImage(image, { x: (210 - contentWidth) / 2 * mm, y: (297 - margin) * mm - imageHeight, width: contentWidth * mm, height: imageHeight });
    slice.width = slice.height = 0;
  }
  // Traditional cross-reference tables are understood by older upload scanners.
  return pdf.save({ useObjectStreams: false });
}

export async function exportCompatibilityPdf(source: HTMLElement, title: string) {
  const { default: html2canvas } = await import('html2canvas-pro');
  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  clone.querySelectorAll('.resume-page-separator, .page-number-badge').forEach(el => el.remove());
  Object.assign(clone.style, {
    position: 'fixed', top: '0', left: '-10000px', width: '210mm', minWidth: '210mm',
    minHeight: '0', height: 'auto', margin: '0', paddingTop: '0', paddingBottom: '0',
    transform: 'none', transition: 'none', boxShadow: 'none', border: 'none', borderRadius: '0',
    background: '#fff', overflow: 'visible',
  });
  document.body.appendChild(clone);
  try {
    if (document.fonts) await withTimeout(document.fonts.ready);
    const originals = Array.from(source.querySelectorAll('img'));
    const copies = Array.from(clone.querySelectorAll('img'));
    await Promise.all(originals.map((image, index) => preparePrintImage(image, copies[index])));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const width = clone.offsetWidth;
    const height = clone.offsetHeight;
    // Bound memory for long resumes while keeping roughly 240 dpi for A4.
    const scale = Math.min(2.5, Math.sqrt(24000000 / (width * height)), 32000 / height);
    if (scale < 1) throw new Error('简历过长，请分成较短的简历后导出。');
    const canvas = await html2canvas(clone, { scale, backgroundColor: '#fff', useCORS: true, logging: false, imageTimeout: 15000 });
    const bytes = await canvasToCompatibilityPdf(canvas, title);
    canvas.width = canvas.height = 0;
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || '我的简历'}_兼容版.pdf`.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  } finally {
    clone.remove();
  }
}
