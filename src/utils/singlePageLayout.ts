import type { ResumeStyling } from '../types';

export function pageMargins(styling: ResumeStyling) {
  if (styling.fitToOnePage && styling.pagePadding === 'compact') return { vertical: 6, horizontal: 10 };
  switch (styling.pagePadding) {
    case 'compact': return { vertical: 8, horizontal: 12 };
    case 'comfortable': return { vertical: 15, horizontal: 18 };
    default: return { vertical: 10, horizontal: 15 };
  }
}

export function singlePageLayout(contentHeight: number, paperWidth: number, marginMm: number, enabled: boolean) {
  const available = paperWidth / 210 * (297 - marginMm * 2);
  if (!Number.isFinite(contentHeight) || contentHeight < 0 || !Number.isFinite(available) || available <= 2) {
    throw new Error('无效的页面尺寸');
  }
  const needed = contentHeight > 0 ? Math.min(1, (available - 2) / contentHeight) : 1;
  // A lower bound protects readability; excess content remains visible on more pages.
  const scale = enabled && needed >= 0.85 ? Math.floor(needed * 1000) / 1000 : 1;
  return { scale, pages: Math.max(1, Math.ceil((contentHeight * scale - 0.5) / available)), available };
}

/** Measure the actual print snapshot after fonts and images have finished loading. */
export function prepareSinglePagePrint(paper: HTMLElement, styling: ResumeStyling) {
  const portal = paper.parentElement;
  const content = paper.querySelector<HTMLElement>('.resume-content');
  if (!portal || !content) return;
  const previous = portal.style.cssText;
  try {
    Object.assign(portal.style, { display: 'block', position: 'fixed', left: '-10000px', top: '0', width: '210mm' });
    const margins = pageMargins(styling);
    content.style.width = `${210 - 2 * margins.horizontal}mm`;
    content.style.zoom = '1';
    const layout = singlePageLayout(Math.max(content.scrollHeight, content.offsetHeight), paper.clientWidth, margins.vertical, !!styling.fitToOnePage);
    content.style.zoom = String(layout.scale);
    return layout;
  } finally {
    portal.style.cssText = previous;
  }
}
