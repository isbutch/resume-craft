import React, { useEffect, useRef, useState } from 'react';
import { ResumeData } from '../types';
import { TemplateClassic } from './TemplateClassic';
import { TemplateMinimal } from './TemplateMinimal';
import { LucideIcon } from './LucideIcon';

interface ResumePreviewProps {
  data: ResumeData;
  onChange?: (data: ResumeData) => void;
}

const A4_WIDTH_PX = 794; // approx width of 210mm in pixels at standard screen DPI

const getPageVerticalMarginMm = (pagePadding: ResumeData['styling']['pagePadding']) => {
  switch (pagePadding) {
    case 'compact': return 8;
    case 'comfortable': return 15;
    case 'normal':
    default: return 10;
  }
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, onChange }) => {
  const { styling } = data;
  const { templateId, fontFamily, sectionSpacing, fontSize, lineSpacing = 'normal', pagePadding = 'normal' } = styling;
  const paperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pageCount, setPageCount] = useState(1);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const [pageBreakPositions, setPageBreakPositions] = useState<number[]>([]);

  // Initialize scale based on screen width to prevent visual jump/flicker on load
  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        const padding = 48;
        const targetWidth = window.innerWidth - padding;
        return Math.max(0.3, Math.min(1.0, targetWidth / A4_WIDTH_PX));
      }
    }
    return 1.0;
  });

  const [wheelZoomEnabled, setWheelZoomEnabled] = useState(false);
  const [autoFitWidth, setAutoFitWidth] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const panStateRef = useRef({ startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  // Custom inline style mapping for Chinese-friendly fonts
  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'yahei':
        return '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", -apple-system, sans-serif';
      case 'simsun':
        return '"SimSun", "STSong", "Songti SC", Georgia, serif';
      case 'kaiti':
        return '"KaiTi", "STKaiti", "BiauKai", "Kaiti SC", cursive, serif';
      case 'sans':
        return '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Inter, system-ui, -apple-system, sans-serif';
      case 'serif':
        return '"SimSun", "STSong", "Songti SC", Georgia, "Times New Roman", serif';
      case 'mono':
        return '"LXGW WenKai", "LXGW WenKai Mono", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif';
      default:
        return '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif';
    }
  };

  useEffect(() => {
    const updatePageCount = () => {
      const paper = paperRef.current;
      const content = contentRef.current;
      if (!paper || !content) return;

      // clientWidth/scrollHeight are layout-space measurements. Using
      // getBoundingClientRect() here made the result depend on the preview's
      // CSS transform scale, while computed padding stayed unscaled. That
      // could report one page at one zoom level and two pages at another.
      const paperWidth = paper.clientWidth;
      if (!paperWidth) return;

      const a4PageHeight = paperWidth * (297 / 210);
      const pixelsPerMm = paperWidth / 210;
      const pageMarginMm = getPageVerticalMarginMm(pagePadding);
      const printablePageHeight = a4PageHeight - (pageMarginMm * 2 * pixelsPerMm);
      setPageHeight((current) => (current && Math.abs(current - a4PageHeight) < 0.5 ? current : a4PageHeight));
      const styles = window.getComputedStyle(paper);
      const paddingTop = parseFloat(styles.paddingTop);
      const contentHeight = Math.max(content.scrollHeight, content.offsetHeight);
      // Absorb sub-pixel rounding at an exact A4 boundary so a fraction of a
      // pixel cannot create a phantom extra page.
      const nextPageCount = Math.max(1, Math.ceil((contentHeight - 0.5) / printablePageHeight));
      const nextBreakPositions = Array.from(
        { length: Math.max(0, nextPageCount - 1) },
        (_, index) => paddingTop + printablePageHeight * (index + 1),
      );

      setPageCount((current) => (current === nextPageCount ? current : nextPageCount));
      setPageBreakPositions((current) => {
        if (
          current.length === nextBreakPositions.length &&
          current.every((value, index) => Math.abs(value - nextBreakPositions[index]) < 0.5)
        ) {
          return current;
        }
        return nextBreakPositions;
      });
    };

    updatePageCount();

    const observer = new ResizeObserver(updatePageCount);
    if (paperRef.current) observer.observe(paperRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    window.addEventListener('resize', updatePageCount);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePageCount);
    };
  }, [data]);

  // Handle auto-fit logic based on container resizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      if (!autoFitWidth) return;
      const containerWidth = container.getBoundingClientRect().width;
      if (!containerWidth) return;

      // We leave 24px padding for mobile aesthetics
      const padding = 48;
      const targetWidth = containerWidth - padding;
      
      if (containerWidth < A4_WIDTH_PX + padding) {
        // Mobile / tablet screen: auto scale down to fit container width
        const newScale = Math.max(0.3, Math.min(1.0, targetWidth / A4_WIDTH_PX));
        setScale(newScale);
      } else {
        // Larger screen: keep scale at 1.0 or scale up slightly to fit if container width is larger
        const newScale = Math.max(0.3, Math.min(1.5, targetWidth / A4_WIDTH_PX));
        // On very wide desktop layout, keeping it at 1.0 is cleaner unless requested, 
        // but since autoFitWidth is true, we can set it to a comfortable 1.0 by default on wide layouts
        if (containerWidth >= A4_WIDTH_PX + 80) {
          setScale(1.0);
        } else {
          setScale(newScale);
        }
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [autoFitWidth]);

  // Handle Ctrl+Scroll Wheel or direct Scroll Wheel Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || wheelZoomEnabled) {
        e.preventDefault();
        setAutoFitWidth(false); // Disable auto fit when manual zooming
        
        const zoomSpeed = 0.05;
        const delta = -e.deltaY;
        setScale((prev) => {
          const next = prev + (delta > 0 ? zoomSpeed : -zoomSpeed);
          return Math.max(0.4, Math.min(2.0, Number(next.toFixed(2))));
        });
      }
    };

    // React's standard onWheel does not support { passive: false }, so we bind natively
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [wheelZoomEnabled]);

  // Click-and-drag panning on empty/blank space around the paper (grab-to-scroll),
  // so users can freely pan in any direction once zoomed in, not just via scrollbars.
  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    // Only start panning when the click originates outside the paper itself,
    // so text selection inside the resume content keeps working normally.
    if (e.button !== 0 || (paperRef.current && paperRef.current.contains(e.target as Node))) {
      return;
    }
    panStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
    setIsPanning(true);
  };

  useEffect(() => {
    if (!isPanning) return;

    const handlePointerMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const { startX, startY, scrollLeft, scrollTop } = panStateRef.current;
      container.scrollLeft = scrollLeft - (e.clientX - startX);
      container.scrollTop = scrollTop - (e.clientY - startY);
    };

    const handlePointerUp = () => setIsPanning(false);

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [isPanning]);

  const handleZoomIn = () => {
    setAutoFitWidth(false);
    setScale((prev) => Math.min(2.0, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setAutoFitWidth(false);
    setScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
  };

  const handleZoomReset = () => {
    setAutoFitWidth(false);
    setScale(1.0);
  };

  const handleFitWidth = () => {
    setAutoFitWidth(true);
  };

  // Section Spacing padding rules
  const getSpacingClass = () => {
    switch (sectionSpacing) {
      case 'compact':
        return 'print-compact [&_.group-section]:mt-1.5 [&_.group-section]:space-y-1.5 [&_section]:space-y-1.5 pb-0';
      case 'comfortable':
        return 'print-comfortable [&_.group-section]:mt-4.5 [&_.group-section]:space-y-3.5 [&_section]:space-y-3.5 pb-2';
      case 'normal':
      default:
        return 'print-normal [&_.group-section]:mt-3 [&_.group-section]:space-y-2.5 [&_section]:space-y-2.5 pb-0.5';
    }
  };

  // Line height scaling
  const getLineHeightValue = () => {
    switch (lineSpacing) {
      case 'tight': return 1.34;
      case 'relaxed': return 1.62;
      case 'normal':
      default: return 1.46;
    }
  };

  // Page padding rules
  const getPagePaddingStyle = () => {
    switch (pagePadding) {
      case 'compact':
        return '8mm 12mm 8mm 12mm';
      case 'comfortable':
        return '15mm 18mm 15mm 18mm';
      case 'normal':
      default:
        return '10mm 15mm 10mm 15mm';
    }
  };

  // One-click optimize to single page
  const handleAutoFitSinglePage = () => {
    if (!onChange) return;
    onChange({
      ...data,
      styling: {
        ...data.styling,
        fontSize: 'sm',
        lineSpacing: 'tight',
        sectionSpacing: 'compact',
        pagePadding: 'compact',
      }
    });
  };

  // Pluggable template selection
  const renderSelectedTemplate = () => {
    switch (templateId) {
      case 'minimal':
        return <TemplateMinimal data={data} />;
      case 'classic':
      default:
        return <TemplateClassic data={data} />;
    }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col items-center focus:outline-none">
      {/* Resume rendering helpers for A4 preview and browser PDF export. */}
      <style>{`
        @media print {
          @page {
            margin: ${getPageVerticalMarginMm(pagePadding)}mm 0;
          }
        }

        .resume-paper-container {
          /* Keep normal text/selection cursor over the paper even while the
             surrounding blank canvas shows a grab cursor for panning. */
          cursor: auto;
          color-adjust: exact;
          -webkit-print-color-adjust: exact;
          font-kerning: normal;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          line-height: ${getLineHeightValue()};
        }

        .resume-paper-container * {
          box-sizing: border-box;
        }

        /* ===== Critical: Chinese/English vertical alignment fix ===== */
        .resume-paper-container h1,
        .resume-paper-container h2,
        .resume-paper-container h3,
        .resume-paper-container p,
        .resume-paper-container span,
        .resume-paper-container li,
        .resume-paper-container div {
          letter-spacing: 0;
        }

        /* Force all inline text and icon containers to vertically center */
        .resume-paper-container .flex.items-center,
        .resume-paper-container .inline-flex.items-center {
          align-items: center;
        }

        /* SVG icon alignment: force block + vertical center */
        .resume-paper-container svg {
          display: block;
          flex-shrink: 0;
          vertical-align: middle;
        }

        /* Section header icon+title alignment */
        .resume-paper-container section > div:first-child {
          display: flex;
          align-items: center;
        }

        .resume-paper-container section > div:first-child > span:has(svg) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          min-width: 24px;
          min-height: 24px;
          vertical-align: middle;
        }

        /* H2 section titles: align baseline with icon */
        .resume-paper-container h2 {
          line-height: 1.3;
          display: inline-flex;
          align-items: center;
        }

        /* font-mono now maps to LXGW WenKai */
        .resume-paper-container .font-mono {
          font-family: "LXGW WenKai", "LXGW WenKai Mono", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif;
          line-height: 1.5;
        }

        /* Contact info icon container */
        .resume-paper-container .inline-flex > svg,
        .resume-paper-container span:has(> svg) {
          vertical-align: middle;
        }

        /* Tags & badges alignment fix */
        .resume-paper-container span[class*="px-1"][class*="py-"] {
          display: inline-flex;
          align-items: center;
          vertical-align: middle;
          line-height: 1.4;
        }


        /* ===== Page break separator styling ===== */
        .resume-page-separator {
          pointer-events: none;
          user-select: none;
        }

        /* Dynamically scale the hardcoded Tailwind utility classes based on user setting */
        .resume-paper-container .text-xs {
          font-size: ${fontSize === 'sm' ? '11.5px' : fontSize === 'base' ? '12.5px' : '13.5px'} !important;
        }
        
        .resume-paper-container .text-[10px] {
          font-size: ${fontSize === 'sm' ? '9.5px' : fontSize === 'base' ? '10.5px' : '11.5px'} !important;
        }
        
        /* Darken text colors universally for better contrast */
        .resume-paper-container .text-slate-600,
        .resume-paper-container .text-slate-600 {
          color: #1e293b !important;
        }
        .resume-paper-container .text-slate-700 {
          color: #111827 !important;
        }

        /* ===== Elegant Thin Scrollbar for zoom container ===== */
        .resume-scroll-container::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .resume-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .resume-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .resume-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Redesigned Floating Zoom Control Bar (Bright white, elegant shadows, no heavy gray borders) */}
      <div className="preview-toolbar flex items-center gap-1.5 mb-4 mt-2 bg-white border border-slate-100/90 rounded-full px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] shrink-0 z-30 select-none transition-all duration-200">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.4}
          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
          title="缩小 (Ctrl + 鼠标滚轮下滚)"
        >
          <LucideIcon name="Minus" size={13} />
        </button>
        
        <span className="text-xs font-semibold min-w-[3rem] text-center text-slate-600">
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          disabled={scale >= 2.0}
          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
          title="放大 (Ctrl + 鼠标滚轮上滚)"
        >
          <LucideIcon name="Plus" size={13} />
        </button>
        
        <div className="h-4 w-[1px] bg-slate-100 mx-1.5"></div>
        
        <button
          onClick={() => setWheelZoomEnabled(!wheelZoomEnabled)}
          style={{
            color: wheelZoomEnabled ? data.styling.themeColor : undefined,
            backgroundColor: wheelZoomEnabled ? `${data.styling.themeColor}0a` : undefined,
            borderColor: wheelZoomEnabled ? data.styling.themeColor : 'transparent',
          }}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-150 cursor-pointer flex items-center gap-1 ${
            wheelZoomEnabled 
              ? 'shadow-sm font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
          title={wheelZoomEnabled ? "直接滚动鼠标轮进行缩放 (已开启)" : "直接滚动鼠标轮进行缩放 (已关闭，默认需按住 Ctrl 键)"}
        >
          <LucideIcon name="MousePointer" size={11} />
          <span>滚轮缩放</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-100 mx-1.5"></div>

        <button
          onClick={handleZoomReset}
          className="px-3 py-1 rounded-full text-[10px] font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-100/50 transition-all duration-150 cursor-pointer flex items-center gap-1"
          title="重置为 100%"
        >
          <LucideIcon name="RotateCcw" size={11} />
          <span>100%</span>
        </button>

        <button
          onClick={handleFitWidth}
          style={{
            color: autoFitWidth ? data.styling.themeColor : undefined,
            backgroundColor: autoFitWidth ? `${data.styling.themeColor}0a` : undefined,
            borderColor: autoFitWidth ? data.styling.themeColor : 'transparent',
          }}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-150 cursor-pointer flex items-center gap-1 ${
            autoFitWidth 
              ? 'shadow-sm font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
          title="自动适应当前容器宽度"
        >
          <LucideIcon name="Maximize2" size={11} />
          <span>自适应</span>
        </button>

        {/* Page status badge & single page optimizer shortcut */}
        <div className="h-4 w-[1px] bg-slate-100 mx-1.5"></div>

        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
            pageCount === 1 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' 
              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pageCount === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{pageCount === 1 ? '标准 1 页' : `共 ${pageCount} 页`}</span>
          </span>

          {pageCount > 1 && onChange && (
            <button
              onClick={handleAutoFitSinglePage}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-2xs hover:shadow-xs transition cursor-pointer flex items-center gap-1"
              title="一键将字号、行距、边距调整为紧凑模式，尝试压缩为 1 页"
            >
              <LucideIcon name="Sparkles" size={10} />
              <span>紧凑排版</span>
            </button>
          )}
        </div>
      </div>

      {/* A4 Paper Simulator Wrapper — this single viewport owns both scroll axes and
          supports click-and-drag panning on the blank canvas around the paper, so it
          works well even on ultra-wide monitors with lots of surrounding space. */}
      <div
        ref={containerRef}
        onMouseDown={handlePanStart}
        className={`w-full flex-1 min-h-0 overflow-auto resume-scroll-container pb-10 ${
          isPanning ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
      >
        <div
          className="origin-top transition-all duration-100 block"
          style={{
            width: `${A4_WIDTH_PX * scale}px`,
            height: pageHeight ? `${pageHeight * pageCount * scale}px` : 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: '24px',
            paddingRight: '24px',
            boxSizing: 'content-box',
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${A4_WIDTH_PX}px`,
              minWidth: `${A4_WIDTH_PX}px`,
            }}
          >
            <div
              id="resume-print-area"
              ref={paperRef}
              className={`resume-paper-container bg-white text-slate-800 transition-all duration-300 ${getSpacingClass()}`}
              style={{
                fontFamily: getFontFamilyStyle(),
                width: '210mm',
                minWidth: '210mm',
                minHeight: pageHeight ? `${pageHeight * pageCount}px` : '297mm',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 2px rgba(0, 0, 0, 0.05)',
                padding: getPagePaddingStyle(),
                lineHeight: getLineHeightValue(),
                position: 'relative',
                margin: '0 auto'
              }}
            >
              {/* Subtle Page Break Separators (preview only, hidden during export) */}
              {pageBreakPositions.map((breakPosition, index) => (
                  <div
                    key={index}
                    className="resume-page-separator absolute left-0 right-0 flex items-center"
                    style={{
                      top: `${breakPosition}px`,
                      zIndex: 30,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <div className="flex-1 border-t border-dashed border-blue-400/60"></div>
                    <span className="absolute right-0 text-[10px] text-blue-400/80 bg-white px-2 font-mono">
                      第 {index + 1} 页 / 共 {pageCount} 页
                    </span>
                  </div>
              ))}

              <div ref={contentRef} className="relative z-10">
                {renderSelectedTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
