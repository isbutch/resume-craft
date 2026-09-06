import { useEffect, useRef, useState } from 'react';
import { AvatarShape } from '../types';
import { getAvatarSrc } from '../utils/avatarHelper';

const shapes: { id: AvatarShape; label: string }[] = [
  { id: 'rounded', label: '圆角' }, { id: 'circle', label: '圆形' }, { id: 'square', label: '方形' },
];
const radius = (shape: AvatarShape, size: number) => shape === 'circle' ? '50%' : shape === 'rounded' ? `${12 / size * 100}%` : '0';
const clamp = (n: number) => Math.max(-1, Math.min(1, n));

export function AvatarUploader({ avatar, shape, size, visible, onApply }: {
  avatar: string; shape: AvatarShape; size: number; visible: boolean;
  onApply: (avatar: string, shape: AvatarShape) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const request = useRef(0);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [draft, setDraft] = useState('');
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [draftShape, setDraftShape] = useState(shape);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => () => { request.current++; }, []);

  const open = async (src: string) => {
    const current = ++request.current;
    setBusy(true); setError('');
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      await img.decode();
      if (current !== request.current) { if (src.startsWith('blob:')) URL.revokeObjectURL(src); return; }
      image.current = img;
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setDraft(src); setZoom(1); setPosition({ x: 0, y: 0 }); setDraftShape(shape);
      dialog.current?.showModal();
    } catch {
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      if (current === request.current) setError('无法读取图片，请选择本地 JPG、PNG 或 WebP 图片。');
    } finally { if (current === request.current) setBusy(false); }
  };
  const upload = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('请选择 JPG、PNG 或 WebP 图片。'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('图片不能超过 10 MB。'); return; }
    const url = URL.createObjectURL(file);
    void open(url);
  };
  useEffect(() => () => { if (draft.startsWith('blob:')) URL.revokeObjectURL(draft); }, [draft]);
  const side = Math.min(dimensions.width, dimensions.height) / zoom;
  const imageStyle = {
    width: `${dimensions.width / side * 100}%`, height: `${dimensions.height / side * 100}%`,
    maxWidth: 'none', left: `${50 + position.x * (dimensions.width / side - 1) * 50}%`,
    top: `${50 + position.y * (dimensions.height / side - 1) * 50}%`,
    transform: 'translate(-50%, -50%)',
  };
  const move = (dx: number, dy: number, width: number) => {
    const limitX = (dimensions.width / side - 1) * width / 2;
    const limitY = (dimensions.height / side - 1) * width / 2;
    setPosition(p => ({ x: limitX ? clamp(p.x + dx / limitX) : 0, y: limitY ? clamp(p.y + dy / limitY) : 0 }));
  };
  const apply = () => {
    if (!image.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = Math.max(1, Math.min(640, Math.round(side)));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image.current, (dimensions.width - side) * (1 - position.x) / 2,
        (dimensions.height - side) * (1 - position.y) / 2, side, side, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = false;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 255) { transparent = true; break; }
      onApply(canvas.toDataURL(transparent ? 'image/png' : 'image/jpeg', 0.92), draftShape);
      dialog.current?.close();
    } catch { setError('无法裁剪这张图片，请重新上传本地图片。'); }
  };
  return <section className="avatar-upload">
    <div className="flex items-center justify-between gap-2 mb-3"><h3 className="text-sm font-semibold">简历头像</h3><span className="text-xs text-slate-500">拖动裁剪 · 实时预览</span></div>
    <div className="flex items-center gap-4">
      {avatar ? <img src={getAvatarSrc(avatar)} alt="当前简历头像" className="w-18 h-18 object-cover border border-slate-200" style={{ borderRadius: radius(shape, size) }} /> : <div className="w-18 h-18 rounded-xl bg-slate-100" />}
      <div className="space-y-2 flex-1">
        <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="上传头像图片" onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }} />
        <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} className="avatar-primary" onClick={() => picker.current?.click()}>{busy ? '读取图片中…' : '上传照片'}</button>
        {avatar && <button type="button" disabled={busy} className="avatar-secondary" onClick={() => void open(getAvatarSrc(avatar))}>调整裁剪</button>}</div>
        <p className="text-xs text-slate-500">JPG、PNG、WebP，最大 10 MB</p>
      </div>
    </div>
    {!visible && <p className="mt-3 text-xs text-amber-700">头像当前已隐藏，应用裁剪后会自动显示。</p>}
    {error && !dialog.current?.open && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
    <dialog ref={dialog} className="avatar-dialog" aria-labelledby="avatar-crop-title" onClose={() => { setDraft(''); image.current = null; drag.current = null; }}>
      <div className="flex items-start justify-between gap-4"><div><h2 id="avatar-crop-title" className="text-xl font-semibold">调整头像</h2><p className="text-sm text-slate-500 mt-2">拖动照片选择位置，缩放以调整人物大小。</p></div><button type="button" className="avatar-secondary" aria-label="关闭头像裁剪" onClick={() => dialog.current?.close()}>关闭</button></div>
      <div className="avatar-crop-layout">
        <div>
          <div className="avatar-crop-stage" style={{ borderRadius: radius(draftShape, size) }} tabIndex={0} role="group" aria-label="头像裁剪区域，可拖动照片或按方向键移动" onKeyDown={e => {
            const delta = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key];
            if (delta) { e.preventDefault(); move(delta[0], delta[1], e.currentTarget.clientWidth); }
          }} onPointerDown={e => { if (e.button !== 0) return; e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY }; }} onPointerMove={e => {
            const last = drag.current; if (!last || last.id !== e.pointerId) return;
            move(e.clientX - last.x, e.clientY - last.y, e.currentTarget.clientWidth);
            drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
          }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
            {draft && <img src={draft} alt="待裁剪照片" draggable={false} className="absolute pointer-events-none" style={imageStyle} />}
            <div className="avatar-crop-grid" aria-hidden="true" />
          </div>
          <label className="flex justify-between text-sm mt-5 mb-2" htmlFor="avatar-zoom">缩放照片 <span>{zoom.toFixed(1)}×</span></label>
          <input id="avatar-zoom" className="w-full accent-slate-900" type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} />
          <button type="button" className="avatar-secondary mt-2" onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}>重置位置</button>
        </div>
        <aside className="avatar-crop-preview"><h3 className="text-sm font-semibold">裁剪后预览</h3><p className="text-xs text-slate-500 mt-1 mb-5">与简历头像形状同步</p>
          <div className="relative overflow-hidden mx-auto bg-slate-100" style={{ width: size, height: size, borderRadius: radius(draftShape, size) }}>{draft && <img src={draft} alt="裁剪结果实时预览" draggable={false} className="absolute" style={imageStyle} />}</div>
          <div className="flex flex-wrap justify-center gap-2 mt-6">{shapes.map(s => <button type="button" key={s.id} aria-pressed={draftShape === s.id} className={draftShape === s.id ? 'avatar-primary' : 'avatar-secondary'} onClick={() => setDraftShape(s.id)}>{s.label}</button>)}</div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">切换形状不会丢失选区。确认后更新到简历。</p>
        </aside>
      </div>
      {error && <p role="alert" className="text-sm text-rose-600 mb-3">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><button type="button" className="avatar-secondary" onClick={() => dialog.current?.close()}>取消</button><button type="button" className="avatar-primary" onClick={apply}>应用头像</button></div>
    </dialog>
  </section>;
}
