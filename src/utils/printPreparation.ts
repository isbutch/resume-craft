/** Bound resource preparation only, never the lifetime of the print dialog. */
export async function withTimeout<T>(task: Promise<T>, milliseconds = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      task,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('资源加载超时，请检查网络后重试。')), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}

/** Only raster images are resampled; PDF text and SVG icons remain native. */
export async function preparePrintImage(source: HTMLImageElement, target: HTMLImageElement) {
  await withTimeout(source.decode());
  if (!source.naturalWidth || !source.naturalHeight) throw new Error('头像加载失败，请重新上传图片。');

  // offsetWidth is unaffected by the preview zoom. Keep about 300 dpi at print size.
  const scale = Math.min(1, Math.max(
    source.offsetWidth * 300 / 96 / source.naturalWidth,
    source.offsetHeight * 300 / 96 / source.naturalHeight,
  ));
  if (scale > 0 && scale < 0.9) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparent = false;
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] !== 255) { transparent = true; break; }
        }
        const optimized = canvas.toDataURL(transparent ? 'image/png' : 'image/jpeg', 0.9);
        // Do not enlarge already compact uploaded images. Remote images may forbid canvas access.
        if (!source.src.startsWith('data:') || optimized.length < source.src.length) {
          target.removeAttribute('srcset');
          target.src = optimized;
        }
      }
    } catch {
      // Cross-origin images remain printable at their original quality.
    }
  }
  target.loading = 'eager';
  await withTimeout(target.decode());
}
