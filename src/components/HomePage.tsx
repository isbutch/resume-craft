import { LucideIcon } from './LucideIcon';
import { ResumeData, TemplateId } from '../types';

const templates: { id: TemplateId; name: string; description: string; tag: string }[] = [
  { id: 'classic', name: '经典 · 有条不紊', description: '清晰的单栏结构，让每一段经历都有重点。', tag: '通用求职' },
  { id: 'minimal', name: '极简 · 恰到好处', description: '简洁的线条与留白，让内容自己说话。', tag: '简约风格' },
];

function Paper({ variant = 'classic' }: { variant?: string }) {
  return <div className={`home-paper paper-${variant}`} aria-hidden="true">
    <div className="paper-person"><div><strong>戈蓬町</strong><p>后端开发工程师 / BACKEND ENGINEER</p><small>resume@example.invalid · 技术简历示例</small></div><div className="paper-avatar">戈</div></div>
    <div className="paper-content">{['专业技能', '工作经历', '项目经历', '教育背景'].map((label, i) => <section key={label}><h3>{label}<span>0{i + 1}</span></h3>{i > 0 && <h4>{['', '数字化服务团队 · 后端开发', '企业知识库检索与问答平台', '云岚大学 · 软件工程'][i]}</h4>}<div className="paper-line" /><div className="paper-line" /><div className="paper-line short" />{i === 1 && <><div className="paper-line" /><div className="paper-line medium" /></>}</section>)}</div>
  </div>;
}

export function HomePage({ data, hasDraft, onEnter, onCreate, onTemplate }: {
  data: ResumeData; hasDraft: boolean; onEnter: () => void; onCreate: () => void; onTemplate: (id: TemplateId) => void;
}) {
  return <div className="home-page">
    <header className="home-nav"><a className="craft-brand" href="#/" aria-label="CraftCV 首页"><span className="brand-symbol"><LucideIcon name="FileText" size={21} /></span>CraftCV<span className="brand-caption">简历工坊</span></a><nav aria-label="主导航"><a href="#templates">简历模板</a><a href="#workflow">使用指南</a><button className="craft-button primary small" onClick={onEnter}>进入编辑器 <LucideIcon name="ArrowUpRight" size={16} /></button></nav></header>
    <main>
      <section className="home-hero">
        <div className="hero-copy"><div className="hero-kicker"><span /> 为下一次机会，做好准备</div><h1>你的经历，<br />值得被<span>认真看见。</span></h1><p className="hero-description">把时间留给打磨内容，把排版交给 CraftCV。<br className="desktop-break" />一份清晰、专业、有你风格的简历，从这里开始。</p><div className="hero-actions"><button className="craft-button primary" onClick={onEnter}>{hasDraft ? '继续编辑简历' : '开始制作简历'}<LucideIcon name="ArrowRight" size={18} /></button><a className="craft-button secondary" href="#templates">挑选一个模板</a></div><div className="hero-promises"><span><LucideIcon name="Check" size={14} /> 无需注册</span><span><LucideIcon name="Check" size={14} /> 本地保存</span><span><LucideIcon name="Check" size={14} /> PDF 导出</span></div></div>
        <div className="hero-art"><div className="art-orbit" /><div className="art-caption">YOUR NEXT CHAPTER.</div><div className="hero-paper"><Paper /></div><div className="art-note"><span><LucideIcon name="Check" size={18} /></span><div><strong>让好内容，自带好排版</strong><small>实时预览 · 自由定制</small></div></div><span className="art-spark">✳</span></div>
      </section>
      <section className="draft-strip"><div className="draft-icon"><LucideIcon name={hasDraft ? 'FileCheck' : 'FilePlus2'} size={24} /></div><div className="draft-copy"><h2>{hasDraft ? `接着写，${data.personalInfo.name || '你的故事'}` : '从一张白纸，写下你的下一步'}</h2><p>{hasDraft ? `${data.title} · 当前浏览器中的简历草稿` : '也可以跳过示例内容，直接创建一份空白简历。'}</p></div><button className="text-action" onClick={hasDraft ? onEnter : onCreate}>{hasDraft ? '打开我的简历' : '新建空白简历'}<LucideIcon name="ArrowRight" size={17} /></button></section>
      <section id="templates" className="home-templates"><div className="home-section-heading"><div><span className="section-kicker">MADE FOR YOUR STORY</span><h2>选一种风格，开始表达。</h2></div><p>两种布局，同样专注于你的内容。<br />进入编辑器后，可随时切换与调整。</p></div><div className="template-grid">{templates.map(template => <button key={template.id} className="template-card" onClick={() => onTemplate(template.id)} aria-label={`使用${template.name}模板`}><div className={`template-art template-art-${template.id}`}><Paper variant={template.id} /><span className="template-use">使用此模板 <LucideIcon name="ArrowUpRight" size={16} /></span></div><div className="template-description"><div><h3>{template.name}</h3><span>{template.tag}</span></div><p>{template.description}</p></div></button>)}</div><p className="template-note"><LucideIcon name="Info" size={14} /> 模板展示为示意效果；选择模板只调整排版，保留当前简历内容。</p></section>
      <section id="workflow" className="home-workflow"><div className="home-section-heading"><div><span className="section-kicker">LESS FRICTION, MORE FOCUS</span><h2>从经历到简历，只需三步。</h2></div></div><div className="workflow-grid">{[{ icon: 'PenLine', title: '写下你的经历', text: '分模块填写个人信息、教育和项目，用具体成果展示你的能力。' }, { icon: 'PanelsTopLeft', title: '调整你的风格', text: '选择模板、配色和字体，在实时预览中找到合适的阅读节奏。' }, { icon: 'Download', title: '准备好，投出下一份', text: '通过浏览器打印保存为 PDF；导出 JSON 备份，方便日后继续修改。' }].map((step, i) => <article key={step.title}><div><LucideIcon name={step.icon} size={22} /><span>0{i + 1}</span></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>
      <section className="home-bottom"><div><LucideIcon name="ShieldCheck" size={23} /><p><strong>你的简历，由你掌握。</strong><span>简历内容保存在当前浏览器。清理浏览器数据前，记得导出备份。</span></p></div><button className="craft-button primary" onClick={onEnter}>进入编辑器<LucideIcon name="ArrowRight" size={18} /></button></section>
    </main><footer className="home-footer"><span>CraftCV · 简历工坊</span><span>认真记录每一段成长。</span><a href="#workflow">使用指南 <LucideIcon name="ArrowUpRight" size={13} /></a></footer>
  </div>;
}
