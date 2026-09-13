import { useState, useEffect, useRef } from 'react';
import { ResumeData, TemplateId } from './types';
import { ResumeEditor } from './components/ResumeEditor';
import { ResumePreview } from './components/ResumePreview';
import { HomePage } from './components/HomePage';
import { LucideIcon } from './components/LucideIcon';
import { WechatRewardMenuItem, WechatRewardModal } from './components/WechatReward';
import { preparePrintImage, withTimeout } from './utils/printPreparation';
import { blankResume, freshResume, parseResume, STORAGE_KEY, MAX_BACKUP_BYTES } from './utils/resumeData';

type DraftLoadResult = {
  data: ResumeData;
  exists: boolean;
  notice: string;
  storageUnavailable: boolean;
};

function loadDraft(): DraftLoadResult {
  let saved: string | null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { data: freshResume(), exists: false, notice: '浏览器禁止访问本地存储，当前修改无法在刷新后保留。', storageUnavailable: true };
  }
  if (!saved) return { data: freshResume(), exists: false, notice: '', storageUnavailable: false };

  let parsed: ResumeData;
  try {
    parsed = parseResume(JSON.parse(saved));
  } catch {
    return { data: freshResume(), exists: false, notice: '本地记录与当前版本不兼容，已显示匿名示例；请使用原备份重新导入。', storageUnavailable: false };
  }

  if (parsed.id === 'resume-1') {
    parsed.id = crypto.randomUUID();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch {}
  }

  return { data: parsed, exists: true, notice: '', storageUnavailable: false };
}

export default function App() {
  const [initial] = useState(loadDraft);
  const [data, updateData] = useState<ResumeData>(initial.data);
  const [hasDraft, setHasDraft] = useState(initial.exists);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState(initial.notice);
  const [route, setRoute] = useState(() => location.hash === '#/editor' ? 'editor' : 'home');
  const [activePaneMobile, setActivePaneMobile] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>(initial.storageUnavailable ? 'error' : 'saved');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const current = useRef(data);
  const revision = useRef(0);
  const history = useRef<{ past: ResumeData[]; future: ResumeData[]; last: number }>({ past: [], future: [], last: 0 });
  const [, renderHistory] = useState(0);
  const setData = (next: ResumeData) => {
    const now = Date.now();
    if (now - history.current.last > 700) history.current.past = [...history.current.past.slice(-29), current.current];
    history.current.last = now;
    history.current.future = [];
    current.current = next; revision.current++;
    updateData(next); setDirty(true); setSaveStatus('saving');
  };
  const undo = (redo = false) => {
    const from = redo ? history.current.future : history.current.past;
    const to = redo ? history.current.past : history.current.future;
    const previous = from.pop();
    if (!previous) return;
    to.push(current.current); history.current.last = 0;
    current.current = previous; revision.current++;
    updateData(previous); setDirty(true); setSaveStatus('saving'); renderHistory(n => n + 1);
  };
  const replaceData = (next: ResumeData) => { history.current.last = 0; setData(next); history.current.last = 0; };
  const enter = () => { location.hash = '#/editor'; };
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const navigate = () => { setRoute(location.hash === '#/editor' ? 'editor' : 'home'); if (location.hash === '#/') requestAnimationFrame(() => window.scrollTo(0, 0)); };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => {
    if (route === 'editor') {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      };
    }
  }, [route]);
  useEffect(() => { document.title = route === 'editor' ? '编辑简历 · CraftCV' : 'CraftCV · 让你的经历被认真看见'; }, [route]);
  useEffect(() => {
    if (!dirty) return;
    const persist = () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current.current)); setSaveStatus('saved'); setHasDraft(true); }
      catch { setSaveStatus('error'); setNotice('浏览器本地空间不足或存储被禁用，当前修改未能自动保存。'); }
    };
    const timer = window.setTimeout(persist, 400);
    const flush = () => { if (document.visibilityState === 'hidden') persist(); };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current.current)); }
      catch { event.preventDefault(); event.returnValue = ''; }
    };
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', persist);
    window.addEventListener('beforeunload', beforeUnload);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', flush); window.removeEventListener('pagehide', persist); window.removeEventListener('beforeunload', beforeUnload); };
  }, [data, dirty]);
  useEffect(() => {
    const close = (e: Event) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) menuRef.current.open = false; };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape' && menuRef.current?.open) { menuRef.current.open = false; menuRef.current.querySelector('summary')?.focus(); } };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);
  const handleResetToPreset = () => {
    if (window.confirm('恢复示例会替换当前内容。确认继续？操作后可撤销。')) { replaceData(freshResume()); setNotice('已恢复示例，可使用撤销恢复原内容。'); }
  };
  const handleClearAll = () => {
    if ((hasDraft || dirty) && !window.confirm('新建空白简历会替换当前内容。建议先导出备份，确认继续？')) return;
    replaceData(blankResume()); enter(); setNotice('已创建空白简历，从个人信息开始填写吧。');
  };
  const selectTemplate = (templateId: TemplateId) => { replaceData({ ...data, styling: { ...data.styling, templateId } }); enter(); };
  const handleExportJSON = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url;
    a.download = ((data.personalInfo.name || '我的简历') + '_备份.json').replace(/[<>:"/\\|?*]/g, '_');
    a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) { setNotice('导入失败：备份文件不能超过 5 MB。'); return; }
    const startRevision = revision.current;
    setIsImporting(true);
    try {
      const parsed = parseResume(JSON.parse(await file.text()));
      if (revision.current !== startRevision) { setNotice('读取期间简历发生了修改，请重新选择备份以免覆盖新内容。'); return; }
      if ((hasDraft || dirty) && !window.confirm('导入备份将替换当前简历，确认继续？操作后可撤销。')) return;
      if (parsed.id === 'resume-1' || parsed.id === 'demo-resume-v2') {
        parsed.id = crypto.randomUUID();
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      replaceData(parsed);
      setDirty(false);
      setHasDraft(true);
      setSaveStatus('saved');
      enter();
      setNotice('备份导入成功，已保存到此浏览器。');
    } catch (error) {
      const isStorageError = error instanceof DOMException && ['QuotaExceededError', 'SecurityError'].includes(error.name);
      setNotice(isStorageError
        ? '导入失败：浏览器本地空间不足或存储被禁用，当前简历未修改。请压缩头像后重试，或保留 JSON 备份。'
        : '导入失败：备份格式或字段与当前版本不兼容，当前简历未修改。');
    }
    finally { setIsImporting(false); }
  };
  // Keep a prepared snapshot until afterprint; no timer may clear an open dialog.
  const printCleanupRef = useRef<(() => void) | null>(null);
  const exportBusyRef = useRef(false);
  useEffect(() => () => printCleanupRef.current?.(), []);

  const handleExportPDF = async () => {
    if (exportBusyRef.current) return;
    const source = document.getElementById('resume-print-area');
    if (!source) return;
    printCleanupRef.current?.();
    exportBusyRef.current = true;
    setIsExporting(true);

    const portal = document.createElement('div');
    portal.id = 'print-portal';
    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    clone.querySelectorAll('.resume-page-separator, .page-number-badge').forEach(el => el.remove());
    portal.appendChild(clone);
    document.body.appendChild(portal);

    const cleanup = () => {
      portal.remove();
      window.removeEventListener('afterprint', cleanup);
      printCleanupRef.current = null;
      exportBusyRef.current = false;
      setIsExporting(false);
    };
    printCleanupRef.current = cleanup;
    window.addEventListener('afterprint', cleanup, { once: true });

    try {
      // Font readiness prevents printing during a web-font swap.
      await withTimeout(document.fonts.ready);
      const originals = Array.from(source.querySelectorAll('img'));
      const copies = Array.from(clone.querySelectorAll('img'));
      await Promise.all(originals.map((image, index) => preparePrintImage(image, copies[index])));
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      window.print();
      // Some browsers return before closing the dialog. Keep the snapshot until
      // afterprint (or the next explicit export), but allow retry if printing is blocked.
      exportBusyRef.current = false;
      setIsExporting(false);
    } catch (error) {
      cleanup();
      console.error('PDF preparation failed', error);
      window.alert(`无法准备 PDF：${error instanceof Error ? error.message : '请稍后重试。'}`);
    }
  };

  const statusText = saveStatus === 'error' ? '保存失败，请导出备份' : saveStatus === 'saving' ? '正在保存…' : hasDraft ? '已保存到此浏览器' : '示例内容 · 编辑后自动保存';
  return <>
    {route === 'home' ? <HomePage data={data} hasDraft={hasDraft} onEnter={enter} onCreate={handleClearAll} onTemplate={selectTemplate} /> :
      <div className="workspace-shell">
        <header className="workspace-header">
          <a href="#/" className="craft-brand" aria-label="返回首页"><span className="brand-symbol"><LucideIcon name="FileText" size={20} /></span><span className="workspace-brand-text">CraftCV</span><LucideIcon name="ChevronLeft" size={14} /><span className="back-label">首页</span></a>
          <div className="workspace-document"><input aria-label="简历名称" maxLength={80} value={data.title} placeholder="我的简历" onChange={e => setData({ ...data, title: e.target.value })} /><span role="status" className={'save-status status-' + saveStatus}><i />{statusText}</span></div>
          <div className="workspace-actions"><button className="icon-button" onClick={() => undo()} disabled={!history.current.past.length} title="撤销" aria-label="撤销"><LucideIcon name="Undo2" size={17} /></button><button className="icon-button" onClick={() => undo(true)} disabled={!history.current.future.length} title="重做" aria-label="重做"><LucideIcon name="Redo2" size={17} /></button>
            <details ref={menuRef} className="workspace-menu">
              <summary aria-label="更多操作"><LucideIcon name="Ellipsis" size={20} /><span>更多</span></summary>
              <div className="workspace-menu-panel" onClick={() => { if (menuRef.current) menuRef.current.open = false; }}>
                <button onClick={handleExportJSON}><LucideIcon name="Download" size={16} />导出 JSON 备份</button>
                <button disabled={isImporting} onClick={() => fileInputRef.current?.click()}><LucideIcon name="Upload" size={16} />{isImporting ? '读取中…' : '导入 JSON 备份'}</button>
                <hr />
                <a href="https://github.com/isbutch/resume-craft" target="_blank" rel="noreferrer"><LucideIcon name="Github" size={16} />GitHub 开源项目</a>
                <WechatRewardMenuItem onOpenModal={() => {
                  setShowRewardModal(true);
                  if (menuRef.current) menuRef.current.open = false;
                }} />
                <hr />
                <button onClick={handleResetToPreset}><LucideIcon name="RotateCcw" size={16} />恢复示例内容</button>
                <button className="danger" onClick={handleClearAll}><LucideIcon name="FilePlus2" size={16} />新建空白简历</button>
              </div>
            </details>
            <button className="craft-button primary small" onClick={handleExportPDF} disabled={isExporting}><LucideIcon name={isExporting ? 'Loader2' : 'Download'} size={16} /><span>{isExporting ? '准备中…' : '导出 PDF'}</span></button>
          </div>
        </header>
        {saveStatus === 'error' && <div className="save-warning" role="alert">本地保存不可用，请导出 JSON 备份以保留修改。<button onClick={handleExportJSON}>立即备份</button></div>}
        <div className="workspace-mobile-tabs"><button aria-pressed={activePaneMobile === 'edit'} onClick={() => setActivePaneMobile('edit')}><LucideIcon name="PenLine" size={16} />编辑内容</button><button aria-pressed={activePaneMobile === 'preview'} onClick={() => setActivePaneMobile('preview')}><LucideIcon name="Eye" size={16} />实时预览</button></div>
        <main className="workspace-main"><section aria-label="简历编辑" className={'workspace-editor mobile-' + activePaneMobile}><ResumeEditor data={data} onChange={setData} onReset={handleResetToPreset} /></section><section aria-label="简历预览" className={'workspace-preview mobile-' + activePaneMobile}><ResumePreview data={data} onChange={setData} /></section></main>
        <footer className="workspace-footer"><span><LucideIcon name="HardDrive" size={12} />数据保存在当前浏览器</span><span>PDF 导出：在打印窗口中选择「另存为 PDF」</span></footer>
      </div>}
    <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImportJSON} className="hidden" aria-label="导入简历备份文件" />
    <WechatRewardModal isOpen={showRewardModal} onClose={() => setShowRewardModal(false)} />
    {notice && <div className="app-notice" role="status"><LucideIcon name="Info" size={18} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="关闭提示"><LucideIcon name="X" size={17} /></button></div>}
  </>;
}
