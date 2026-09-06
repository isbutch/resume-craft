import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Award, Briefcase, Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Circle, Code, Download, Ellipsis, ExternalLink, Eye, FileCheck, FilePlus2, FileText, GraduationCap, HardDrive, HelpCircle, Info, Layers, Layout, Loader2, Mail, MapPin, Maximize2, Minus, MousePointer, Palette, PanelsTopLeft, PenLine, Pencil, Phone, Plus, Redo2, RotateCcw, ShieldCheck, Sliders, Sparkles, Tag, Trash2, Undo2, Upload, User, Wrench, X, XCircle, type LucideIcon as IconType } from 'lucide-react';
import type { CSSProperties } from 'react';

// Explicit allowlist keeps the bundle small and prevents arbitrary export lookup
// when an icon name comes from an imported backup.
const icons: Record<string, IconType> = { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Award, Briefcase, Calendar, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Circle, Code, Download, Ellipsis, ExternalLink, Eye, FileCheck, FilePlus2, FileText, GraduationCap, HardDrive, HelpCircle, Info, Layers, Layout, Loader2, Mail, MapPin, Maximize2, Minus, MousePointer, Palette, PanelsTopLeft, PenLine, Pencil, Phone, Plus, Redo2, RotateCcw, ShieldCheck, Sliders, Sparkles, Tag, Trash2, Undo2, Upload, User, Wrench, X, XCircle };
export function LucideIcon({ name, className = '', size = 18, style }: {
  name: string; className?: string; size?: number; style?: CSSProperties;
}) {
  const Icon = Object.hasOwn(icons, name) ? icons[name] : HelpCircle;
  return <Icon className={className} size={size} style={style} aria-hidden="true" />;
}
export default LucideIcon;
