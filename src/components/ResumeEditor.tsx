import React, { useEffect, useState } from 'react';
import { ResumeData, ContactField, EducationItem, ProjectItem, SkillItem, FontFamily, TemplateId, AvatarShape, SectionHeader } from '../types';
import { PRESET_THEMES, FONTS_LIST, SYSTEM_ICONS } from '../data/defaultResume';
import { LucideIcon } from './LucideIcon';
import { TechTagManager } from './TechTagManager';
import { AvatarUploader } from './AvatarUploader';

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  onReset: () => void;
}

type TabType = 'styling' | 'personal' | 'education' | 'skills' | 'projects' | 'internships' | 'research';

const QuickFormatBar: React.FC<{
  onInsert: (snippet: string) => void;
}> = ({ onInsert }) => (
  <div className="flex items-center flex-wrap gap-1 mb-1 text-[10px] text-slate-500 select-none">
    <span className="text-[9px] text-slate-400 font-bold mr-0.5">快捷排版:</span>
    <button
      type="button"
      onClick={() => onInsert('• ')}
      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
      title="插入圆点列表项"
    >
      • 列表
    </button>
    <button
      type="button"
      onClick={() => onInsert('★ ')}
      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
      title="插入星标重点"
    >
      ★ 星标
    </button>
    <button
      type="button"
      onClick={() => onInsert('■ ')}
      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
      title="插入方块小节"
    >
      ■ 方块
    </button>
    <button
      type="button"
      onClick={() => onInsert('核心亮点: ')}
      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
      title="插入自动加粗键值"
    >
      加粗标题:
    </button>
  </div>
);

const appendSnippet = (currentText: string, snippet: string) => {
  if (!currentText) return snippet;
  return currentText.endsWith('\n') ? `${currentText}${snippet}` : `${currentText}\n${snippet}`;
};

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, onChange, onReset }) => {
  const { personalInfo } = data;
  const [themeColorDraft, setThemeColorDraft] = useState(data.styling.themeColor);
  useEffect(() => setThemeColorDraft(data.styling.themeColor), [data.styling.themeColor]);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  
  // Temporary states for additions
  const [newSkillText, setNewSkillText] = useState('');
  const [techInputs, setTechInputs] = useState<Record<string, string>>({});
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});

  const toggleItemCollapse = (id: string) => {
    setCollapsedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllCollapsed = (ids: string[], collapsed: boolean) => {
    setCollapsedItems(prev => {
      const next = { ...prev };
      ids.forEach(id => {
        next[id] = collapsed;
      });
      return next;
    });
  };

  // Deep update helper
  const updateStyling = (key: keyof ResumeData['styling'], value: any) => {
    onChange({
      ...data,
      styling: {
        ...data.styling,
        [key]: value
      }
    });
  };

  const handleSectionHeaderChange = (
    sectionKey: keyof ResumeData['sections'],
    field: keyof SectionHeader,
    value: any
  ) => {
    const section = data.sections[sectionKey];
    if (!section) return;
    onChange({
      ...data,
      sections: {
        ...data.sections,
        [sectionKey]: {
          ...section,
          header: {
            ...section.header,
            [field]: value
          }
        }
      }
    });
  };

  // Base edit handlers
  const handlePersonalInfoChange = (key: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [key]: value
      }
    });
  };

  // Contact update
  const handleContactChange = (index: number, key: keyof ContactField, value: any) => {
    const updatedContacts = [...data.personalInfo.contacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [key]: value
    };
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        contacts: updatedContacts
      }
    });
  };

  // --- EDUCATION OPERATIONS ---
  const handleEducationChange = (id: string, key: keyof EducationItem, value: any) => {
    const updated = data.sections.education.items.map(item => 
      item.id === id ? { ...item, [key]: value } : item
    );
    onChange({
      ...data,
      sections: {
        ...data.sections,
        education: {
          ...data.sections.education,
          items: updated
        }
      }
    });
  };

  const addEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${crypto.randomUUID()}`,
      school: '请输入学校/机构',
      majorAndDegree: '学院或院系名称',
      degree: '本科',
      is211: false,
      is985: false,
      isDoubleFirst: false,
      timePeriod: '2020年09月 - 2024年06月',
      description: '• 填写您的主修课程、绩点排名、主要学业成果等'
    };
    onChange({
      ...data,
      sections: {
        ...data.sections,
        education: {
          ...data.sections.education,
          items: [...data.sections.education.items, newItem]
        }
      }
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      sections: {
        ...data.sections,
        education: {
          ...data.sections.education,
          items: data.sections.education.items.filter(item => item.id !== id)
        }
      }
    });
  };

  // --- SKILLS OPERATIONS ---
  const handleSkillChange = (id: string, value: string) => {
    const updated = data.sections.skills.items.map(item => 
      item.id === id ? { ...item, content: value } : item
    );
    onChange({
      ...data,
      sections: {
        ...data.sections,
        skills: {
          ...data.sections.skills,
          items: updated
        }
      }
    });
  };

  const addSkill = () => {
    if (!newSkillText.trim()) return;
    const newItem: SkillItem = {
      id: `sk-${crypto.randomUUID()}`,
      content: newSkillText.trim()
    };
    onChange({
      ...data,
      sections: {
        ...data.sections,
        skills: {
          ...data.sections.skills,
          items: [...data.sections.skills.items, newItem]
        }
      }
    });
    setNewSkillText('');
  };

  const removeSkill = (id: string) => {
    onChange({
      ...data,
      sections: {
        ...data.sections,
        skills: {
          ...data.sections.skills,
          items: data.sections.skills.items.filter(item => item.id !== id)
        }
      }
    });
  };

  // --- PROJECT OPERATIONS ---
  const handleProjectChange = (id: string, key: keyof ProjectItem, value: any) => {
    const updated = data.sections.projects.items.map(item => 
      item.id === id ? { ...item, [key]: value } : item
    );
    onChange({
      ...data,
      sections: {
        ...data.sections,
        projects: {
          ...data.sections.projects,
          items: updated
        }
      }
    });
  };

  const addProject = () => {
    const newItem: ProjectItem = {
      id: `proj-${crypto.randomUUID()}`,
      name: '研发项目名称',
      role: '研发负责人',
      timePeriod: '2023年03月 - 至今',
      techChain: ['React', 'TypeScript'],
      description: '输入项目的核心功能、业务背景和主要应用场景（为用户解决了什么痛点）。',
      contributions: '• 输入您在项目中的具体工作职责与代码质量提升详情\n• 运用相关技术解决的高并发/高复杂业务痛点详情'
    };
    onChange({
      ...data,
      sections: {
        ...data.sections,
        projects: {
          ...data.sections.projects,
          items: [...data.sections.projects.items, newItem]
        }
      }
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      sections: {
        ...data.sections,
        projects: {
          ...data.sections.projects,
          items: data.sections.projects.items.filter(item => item.id !== id)
        }
      }
    });
  };

  const addProjectTech = (projectId: string) => {
    const text = techInputs[projectId]?.trim();
    if (!text) return;
    
    const proj = data.sections.projects.items.find(item => item.id === projectId);
    if (proj) {
      const chain = [...(proj.techChain || [])];
      if (!chain.includes(text)) {
        chain.push(text);
        handleProjectChange(projectId, 'techChain', chain);
      }
    }
    setTechInputs({ ...techInputs, [projectId]: '' });
  };

  const removeProjectTech = (projectId: string, tagToRemove: string) => {
    const proj = data.sections.projects.items.find(item => item.id === projectId);
    if (proj) {
      const chain = (proj.techChain || []).filter(tag => tag !== tagToRemove);
      handleProjectChange(projectId, 'techChain', chain);
    }
  };


  // --- INTERNSHIP OPERATIONS ---
  const handleInternshipChange = (id: string, key: keyof ProjectItem, value: any) => {
    const sectionData = data.sections.internships || { items: [] };
    const updated = (sectionData.items || []).map(item => 
      item.id === id ? { ...item, [key]: value } : item
    );
    onChange({
      ...data,
      sections: {
        ...data.sections,
        internships: {
          ...data.sections.internships,
          header: data.sections.internships?.header || { id: 's-intern', title: '实习经历', icon: 'Briefcase', show: true },
          items: updated
        }
      }
    });
  };

  const addInternship = () => {
    const newItem: ProjectItem = {
      id: `intern-${crypto.randomUUID()}`,
      name: '新实习企业名称',
      role: 'Java开发实习生',
      timePeriod: '2023年03月 - 2023年06月',
      techChain: ['Spring Boot', 'MySQL'],
      description: '简单描述您的实习工作职责与参与的产品业务线。',
      contributions: '• 负责日常代码模块研发与调试验证\n• 与团队共同协作迭代业务核心组件'
    };
    const sectionData = data.sections.internships || { items: [] };
    onChange({
      ...data,
      sections: {
        ...data.sections,
        internships: {
          ...data.sections.internships,
          header: data.sections.internships?.header || { id: 's-intern', title: '实习经历', icon: 'Briefcase', show: true },
          items: [...(sectionData.items || []), newItem]
        }
      }
    });
  };

  const removeInternship = (id: string) => {
    const sectionData = data.sections.internships || { items: [] };
    onChange({
      ...data,
      sections: {
        ...data.sections,
        internships: {
          ...data.sections.internships,
          header: data.sections.internships?.header || { id: 's-intern', title: '实习经历', icon: 'Briefcase', show: true },
          items: (sectionData.items || []).filter(item => item.id !== id)
        }
      }
    });
  };

  const addInternshipTech = (itemId: string) => {
    const text = techInputs[itemId]?.trim();
    if (!text) return;
    const sectionData = data.sections.internships || { items: [] };
    const item = (sectionData.items || []).find(it => it.id === itemId);
    if (item) {
      const chain = [...(item.techChain || [])];
      if (!chain.includes(text)) {
        chain.push(text);
        handleInternshipChange(itemId, 'techChain', chain);
      }
    }
    setTechInputs({ ...techInputs, [itemId]: '' });
  };

  const removeInternshipTech = (itemId: string, tagToRemove: string) => {
    const sectionData = data.sections.internships || { items: [] };
    const item = (sectionData.items || []).find(it => it.id === itemId);
    if (item) {
      const chain = (item.techChain || []).filter(tag => tag !== tagToRemove);
      handleInternshipChange(itemId, 'techChain', chain);
    }
  };


  // --- RESEARCH OPERATIONS ---
  const handleResearchChange = (id: string, key: keyof ProjectItem, value: any) => {
    const sectionData = data.sections.research || { items: [] };
    const updated = (sectionData.items || []).map(item => 
      item.id === id ? { ...item, [key]: value } : item
    );
    onChange({
      ...data,
      sections: {
        ...data.sections,
        research: {
          ...data.sections.research,
          header: data.sections.research?.header || { id: 's-research', title: '科研成果与竞赛', icon: 'Award', show: true },
          items: updated
        }
      }
    });
  };

  const addResearch = () => {
    const newItem: ProjectItem = {
      id: `research-${crypto.randomUUID()}`,
      name: '科研课题/赛事名称 (如：蓝桥杯)',
      role: '获得一等奖/核心研发',
      timePeriod: '2021年11月 - 2022年05月',
      techChain: ['Python', '算法'],
      description: '简单介绍科研目的、学术价值、所获荣誉奖项。',
      contributions: '• 输入您具体攻克的难题、发表的文献、或是获得的荣誉等'
    };
    const sectionData = data.sections.research || { items: [] };
    onChange({
      ...data,
      sections: {
        ...data.sections,
        research: {
          ...data.sections.research,
          header: data.sections.research?.header || { id: 's-research', title: '科研成果与竞赛', icon: 'Award', show: true },
          items: [...(sectionData.items || []), newItem]
        }
      }
    });
  };

  const removeResearch = (id: string) => {
    const sectionData = data.sections.research || { items: [] };
    onChange({
      ...data,
      sections: {
        ...data.sections,
        research: {
          ...data.sections.research,
          header: data.sections.research?.header || { id: 's-research', title: '科研成果与竞赛', icon: 'Award', show: true },
          items: (sectionData.items || []).filter(item => item.id !== id)
        }
      }
    });
  };

  const addResearchTech = (itemId: string) => {
    const text = techInputs[itemId]?.trim();
    if (!text) return;
    const sectionData = data.sections.research || { items: [] };
    const item = (sectionData.items || []).find(it => it.id === itemId);
    if (item) {
      const chain = [...(item.techChain || [])];
      if (!chain.includes(text)) {
        chain.push(text);
        handleResearchChange(itemId, 'techChain', chain);
      }
    }
    setTechInputs({ ...techInputs, [itemId]: '' });
  };

  const removeResearchTech = (itemId: string, tagToRemove: string) => {
    const sectionData = data.sections.research || { items: [] };
    const item = (sectionData.items || []).find(it => it.id === itemId);
    if (item) {
      const chain = (item.techChain || []).filter(tag => tag !== tagToRemove);
      handleResearchChange(itemId, 'techChain', chain);
    }
  };

  return (
    <div className="resume-editor w-full h-full flex flex-col bg-white text-slate-800 overflow-hidden">

      {/* 2. TABBED PANEL CONTAINING SIDE NAVIGATION TRACK & FORMS */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full">
        
        {/* VERTICAL LEFT NAV RAIL (Extremely high design fidelity) */}
        <nav className="w-16 bg-slate-50/80 border-r border-slate-200 flex flex-col items-center py-4 shrink-0 justify-between">
          <div className="flex flex-col items-center gap-3 w-full shrink-0">
            {[
              { id: 'styling', label: '排版', icon: 'Sliders' },
              { id: 'personal', label: '信息', icon: 'User' },
              { id: 'education', label: '教育', icon: 'GraduationCap' },
              { id: 'skills', label: '技能', icon: 'Wrench' },
              { id: 'internships', label: '经历', icon: 'Briefcase' },
              { id: 'projects', label: '项目', icon: 'Layers' },
              { id: 'research', label: '科研', icon: 'Award' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                aria-pressed={activeTab === tab.id}
                className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group select-none ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title={tab.label}
              >
                <LucideIcon name={tab.icon} size={16} />
                <span className="text-[11px] font-medium leading-none">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-slate-800 rounded-r-md"></div>
                )}
              </button>
            ))}
          </div>

          <div className="text-[8px] font-mono text-slate-400 select-none text-center shrink-0 pt-2">
            v1.2
          </div>
        </nav>

        {/* RIGHT PANEL INPUT FORMS FIELD AREA */}
        <div className="editor-fields flex-1 overflow-y-auto p-5 space-y-6 min-h-0 min-w-0">
          
          <header className="editor-section-heading">
            <span className="editor-eyebrow">简历编辑</span>
            <h2>{({ personal: '从认识你开始', education: '记录你的学习经历', skills: '展现你的专业能力', internships: '记录你的职场经历', projects: '让项目经历更有说服力', research: '呈现研究与获奖成果', styling: '为内容选择合适的排版' })[activeTab]}</h2>
            <p>{({ personal: '填写个人信息与联系方式，让招聘者快速了解你。', education: '补充学校、专业与学习成果，突出与你求职相关的经历。', skills: '用具体的技术与应用经验，描述你擅长的工作。', internships: '写清职责、采取的行动，以及实际取得的成果。', projects: '从项目背景到个人贡献，清晰呈现你的工作价值。', research: '记录课题、竞赛与成果，说明你的角色和贡献。', styling: '调整布局、字体与颜色，右侧预览会同步更新。' })[activeTab]}</p>
          </header>

          {/* TAB 1: STYLING & COMPONENT OPTIONS */}
          {activeTab === 'styling' && (
            <div className="space-y-6">
              {/* Template choice */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 tracking-wider flex items-center gap-2">
                  <LucideIcon name="Layout" size={14} className="text-slate-500" />
                  <span>简历整体布局（选择对应结构）</span>
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { 
                      id: 'classic', 
                      label: '经典商务单栏',
                      badge: '经典高密',
                      desc: '大厂主流高密度单栏排版，严谨精细时间线，信息承载量最大' 
                    },
                    { 
                      id: 'minimal', 
                      label: '极简留白排版',
                      badge: '留白美学',
                      desc: '克制纯粹的字体层次与纤细发丝线，通透呼吸感，高端求职首选' 
                    },
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => updateStyling('templateId', tmpl.id as TemplateId)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer group shadow-2xs ${
                        data.styling.templateId === tmpl.id 
                          ? 'border-slate-900 bg-slate-50/80 text-slate-900 ring-1 ring-slate-900/10' 
                          : 'border-slate-200 bg-white hover:border-slate-400 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full border transition-all ${
                            data.styling.templateId === tmpl.id ? 'bg-slate-900 border-slate-900' : 'bg-transparent border-slate-300'
                          }`}></span>
                          <span>{tmpl.label}</span>
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          data.styling.templateId === tmpl.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {tmpl.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 pl-4 leading-relaxed">{tmpl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Palette */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 tracking-wider flex items-center gap-2">
                  <LucideIcon name="Palette" size={14} className="text-slate-500" />
                  <span>主色调渲染</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {PRESET_THEMES.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => updateStyling('themeColor', preset.value)}
                      className={`h-8 px-3 rounded-lg flex items-center gap-1.5 border text-[11px] font-semibold cursor-pointer transition shadow-2xs ${
                        data.styling.themeColor === preset.value
                          ? 'border-slate-800 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${preset.bgClass} border border-white/20`} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-100 mt-2">
                  <span className="text-[10px] text-slate-500 font-mono">自定义拾色器:</span>
                  <input 
                    type="color" 
                    value={data.styling.themeColor}
                    onChange={(e) => updateStyling('themeColor', e.target.value)}
                    className="w-10 h-6 p-0 border-0 rounded-md cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={themeColorDraft}
                    aria-label="自定义主题色（六位十六进制）"
                    maxLength={7}
                    onChange={e => {
                      const value = e.target.value;
                      setThemeColorDraft(value);
                      if (/^#[\da-f]{6}$/i.test(value)) updateStyling('themeColor', value);
                    }}
                    onBlur={() => setThemeColorDraft(data.styling.themeColor)}
                    className="w-24 px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-600 font-mono text-xs focus:outline-slate-800"
                    placeholder="#111827"
                  />
                </div>
              </div>

              {/* Chinese Fonts Custom Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 tracking-wider flex items-center gap-2">
                  <LucideIcon name="FileText" size={14} className="text-slate-500" />
                  <span>排版字体搭配</span>
                </label>
                <select
                  value={data.styling.fontFamily}
                  onChange={(e) => updateStyling('fontFamily', e.target.value as FontFamily)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-750 text-xs focus:outline-slate-800"
                >
                  {FONTS_LIST.map(font => (
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>
              </div>

              {/* Avatar settings details */}
              <div className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <LucideIcon name="User" size={14} style={{ color: data.styling.themeColor }} />
                    <span>照片头像设置</span>
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={data.styling.showAvatar}
                      onChange={(e) => updateStyling('showAvatar', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                    <span className="text-[10px] text-slate-500 font-semibold select-none">显示头像</span>
                  </label>
                </div>

                {data.styling.showAvatar && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold block">头像轮廓：</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'circle', label: '圆形裁切' },
                          { id: 'rounded', label: '现代圆角' },
                          { id: 'square', label: '直角框' },
                        ].map(shape => (
                          <button
                            key={shape.id}
                            onClick={() => updateStyling('avatarShape', shape.id as AvatarShape)}
                            className={`py-1.5 px-2 rounded-lg border text-center text-[10px] transition cursor-pointer font-medium ${
                              data.styling.avatarShape === shape.id 
                                ? 'border-slate-900 bg-slate-950 text-white font-bold' 
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {shape.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>头像显示大小 (像素):</span>
                        <span className="font-mono font-bold" style={{ color: data.styling.themeColor }}>{data.styling.avatarSize}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="70" 
                        max="140" 
                        value={data.styling.avatarSize}
                        onChange={(e) => updateStyling('avatarSize', parseInt(e.target.value))}
                        className="w-full accent-slate-800 bg-slate-200 rounded-lg h-1 z-10 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Typography & Spacing 4-Grid Control Panel */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>基础字号</span>
                    <span className="text-[9px] font-normal text-slate-400">正文字体</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'sm', label: '小号' },
                      { id: 'base', label: '推荐' },
                      { id: 'lg', label: '大号' }
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => updateStyling('fontSize', sz.id)}
                        className={`py-1 rounded text-[10px] border font-bold transition cursor-pointer ${
                          data.styling.fontSize === sz.id 
                            ? 'border-slate-900 bg-slate-950 text-white shadow-2xs' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>正文行间距</span>
                    <span className="text-[9px] font-normal text-slate-400">单行行高</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'tight', label: '紧凑' },
                      { id: 'normal', label: '默认' },
                      { id: 'relaxed', label: '宽松' }
                    ].map(ls => (
                      <button
                        key={ls.id}
                        type="button"
                        onClick={() => updateStyling('lineSpacing', ls.id)}
                        className={`py-1 rounded text-[10px] border font-bold transition cursor-pointer ${
                          data.styling.lineSpacing === ls.id 
                            ? 'border-slate-900 bg-slate-950 text-white shadow-2xs' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {ls.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>模块间距</span>
                    <span className="text-[9px] font-normal text-slate-400">段落纵深</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'compact', label: '紧凑' },
                      { id: 'normal', label: '默认' },
                      { id: 'comfortable', label: '宽松' }
                    ].map(sp => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => updateStyling('sectionSpacing', sp.id)}
                        className={`py-1 rounded text-[10px] border font-bold transition cursor-pointer ${
                          data.styling.sectionSpacing === sp.id 
                            ? 'border-slate-900 bg-slate-950 text-white shadow-2xs' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>纸张边距</span>
                    <span className="text-[9px] font-normal text-slate-400">四周留白</span>
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'compact', label: '窄边' },
                      { id: 'normal', label: '适中' },
                      { id: 'comfortable', label: '宽边' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => updateStyling('pagePadding', pm.id)}
                        className={`py-1 rounded text-[10px] border font-bold transition cursor-pointer ${
                          (data.styling.pagePadding || 'normal') === pm.id 
                            ? 'border-slate-900 bg-slate-950 text-white shadow-2xs' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section Ordering */}
              <div className="space-y-3 pt-3 border-t border-slate-150">
                <label className="text-xs font-semibold text-slate-700 tracking-wider flex items-center gap-2">
                  <LucideIcon name="Layers" size={14} className="text-slate-500" />
                  <span>简历模块自定义排序</span>
                </label>
                <div className="space-y-1.5">
                  {(data.styling.sectionOrder || ['skills', 'education', 'projects', 'internships', 'research']).map((sectionKey, idx, arr) => {
                    const labelMap: Record<string, string> = {
                      education: '教育背景',
                      skills: '专业技能',
                      projects: '项目经历',
                      internships: '工作经历',
                      research: '科研成果与竞赛'
                    };

                    const handleMove = (direction: 'up' | 'down') => {
                      const newOrder = [...arr];
                      if (direction === 'up' && idx > 0) {
                        const temp = newOrder[idx];
                        newOrder[idx] = newOrder[idx - 1];
                        newOrder[idx - 1] = temp;
                      } else if (direction === 'down' && idx < arr.length - 1) {
                        const temp = newOrder[idx];
                        newOrder[idx] = newOrder[idx + 1];
                        newOrder[idx + 1] = temp;
                      }
                      updateStyling('sectionOrder', newOrder);
                    };

                    return (
                      <div key={sectionKey} className="flex items-center justify-between p-2 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 text-xs">
                        <span className="font-semibold text-slate-700">{labelMap[sectionKey] || sectionKey}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMove('up')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          >
                            <LucideIcon name="ArrowUp" size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMove('down')}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          >
                            <LucideIcon name="ArrowDown" size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="resume-name-input" className="text-xs font-semibold text-slate-600">姓名</label>
                  <input 
                    type="text" 
                    id="resume-name-input"
                    autoComplete="name"
                    value={personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    className="editor-input"
                    placeholder="如：戈蓬町"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="resume-subtitle-input" className="text-xs font-semibold text-slate-600">求职意向 / 个人简介</label>
                  <input 
                    type="text" 
                    id="resume-subtitle-input"
                    value={personalInfo.subTitle}
                    onChange={(e) => handlePersonalInfoChange('subTitle', e.target.value)}
                    className="editor-input"
                    placeholder="如：应届毕业生 | 计算机科学"
                  />
                </div>
              </div>

              <AvatarUploader
                avatar={personalInfo.avatar}
                shape={data.styling.avatarShape}
                size={data.styling.avatarSize}
                visible={data.styling.showAvatar}
                onApply={(avatar, avatarShape) => onChange({
                  ...data,
                  personalInfo: { ...data.personalInfo, avatar },
                  styling: { ...data.styling, avatarShape, showAvatar: true },
                })}
              />

              {/* Redesigned Contact numbers rows: supports very long string configurations */}
              <div className="space-y-3.5">
                <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-1">联系与常设信息编辑</span>
                <div className="space-y-3">
                  {personalInfo.contacts.map((contact, index) => (
                    <div key={contact.id} className="p-3 rounded-xl border border-slate-150 bg-slate-50/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                          <LucideIcon name={contact.icon} size={12} style={{ color: data.styling.themeColor }} />
                          {contact.label} 项配置：
                        </span>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={contact.show}
                            onChange={(e) => handleContactChange(index, 'show', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-7 h-3.5 bg-slate-200 rounded-full peer peer-checked:bg-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:after:translate-x-3.5"></div>
                          <span className="text-[9px] text-slate-400 select-none">显示</span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        {/* Selector for contact icons */}
                        <select
                          value={contact.icon}
                          onChange={(e) => handleContactChange(index, 'icon', e.target.value)}
                          className="w-28 pl-2 pr-6 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 cursor-pointer"
                        >
                          {SYSTEM_ICONS.map(ic => (
                            <option key={ic.name} value={ic.name}>{ic.label}</option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          value={contact.value}
                          onChange={(e) => handleContactChange(index, 'value', e.target.value)}
                          className="flex-1 editor-input select-all"
                          placeholder={`请输入${contact.label}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">教育背景列表</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer scale-75 origin-left">
                    <input 
                      type="checkbox" 
                      checked={data.sections.education.header.show}
                      onChange={(e) => handleSectionHeaderChange('education', 'show', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                    <span className="text-xs text-slate-500 font-bold select-none">显示此模块</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {data.sections.education.items.length > 1 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => setAllCollapsed(data.sections.education.items.map(i => i.id), false)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        全部展开
                      </button>
                      <span>/</span>
                      <button
                        type="button"
                        onClick={() => setAllCollapsed(data.sections.education.items.map(i => i.id), true)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        全部折叠
                      </button>
                    </div>
                  )}
                  <button
                    onClick={addEducation}
                    className="px-3 py-1 text-[10px] font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-900 hover:text-white transition cursor-pointer shadow-2xs"
                  >
                    + 添加学校经历
                  </button>
                </div>
              </div>

              {/* Education list view */}
              <div className="space-y-3">
                {data.sections.education.items.map((edu, index) => {
                  const isCollapsed = !!collapsedItems[edu.id];
                  const summaryTitle = edu.school || `未命名高校经历 #${index + 1}`;
                  const summarySub = [edu.majorAndDegree, edu.degree, edu.timePeriod].filter(Boolean).join(' · ');

                  return (
                    <div key={edu.id} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all shadow-2xs">
                      <div 
                        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 cursor-pointer transition select-none"
                        role="button" tabIndex={0} aria-expanded={!isCollapsed} onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleItemCollapse(edu.id); } }} onClick={() => toggleItemCollapse(edu.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <span className="text-slate-400 hover:text-slate-700 transition">
                            <LucideIcon name={isCollapsed ? "ChevronRight" : "ChevronDown"} size={14} />
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {summaryTitle}
                          </span>
                          {summarySub && (
                            <span className="text-[11px] text-slate-400 font-normal truncate hidden sm:inline">
                              ({summarySub})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => removeEducation(edu.id)}
                            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-0.5"
                            title="删除此经历"
                          >
                            <LucideIcon name="XCircle" size={12} />
                            <span>删除</span>
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="p-4 space-y-4 border-t border-slate-200/60 bg-white/50">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500">毕业/在读学校：</span>
                              <input 
                                type="text" 
                                value={edu.school}
                                onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)}
                                className="editor-input"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500">就读院系名称：</span>
                              <input 
                                type="text" 
                                value={edu.majorAndDegree}
                                onChange={(e) => handleEducationChange(edu.id, 'majorAndDegree', e.target.value)}
                                className="editor-input"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500">学历学阶学位：</span>
                              <select
                                value={edu.degree || '本科'}
                                onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                                className="editor-input cursor-pointer font-medium"
                              >
                                <option value="专科">专科 (College Diploma)</option>
                                <option value="本科">本科 (Bachelor)</option>
                                <option value="硕士">硕士 / 研究生 (Master)</option>
                                <option value="博士">博士 (Ph.D.)</option>
                                <option value="其他">其他学历</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500">就读起止时间：</span>
                              <input 
                                type="text" 
                                value={edu.timePeriod}
                                onChange={(e) => handleEducationChange(edu.id, 'timePeriod', e.target.value)}
                                className="editor-input"
                              />
                            </div>
                          </div>

                          {/* Highly requested corners checklist options */}
                          <div className="p-3 bg-white border border-slate-200/70 rounded-xl space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 block">中国高校专项标注（可在简历对应校名右方生成精致小微章）：</span>
                            <div className="flex flex-wrap gap-4 pt-1">
                              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={!!edu.is211}
                                  onChange={(e) => handleEducationChange(edu.id, 'is211', e.target.checked)}
                                  className="rounded border-slate-200 text-slate-900 focus:ring-0 accent-slate-800"
                                />
                                <span>211 重点建设高校</span>
                              </label>

                              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={!!edu.is985}
                                  onChange={(e) => handleEducationChange(edu.id, 'is985', e.target.checked)}
                                  className="rounded border-slate-200 text-slate-900 focus:ring-0 accent-slate-800"
                                />
                                <span>985 一流高校</span>
                              </label>

                              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={!!edu.isDoubleFirst}
                                  onChange={(e) => handleEducationChange(edu.id, 'isDoubleFirst', e.target.checked)}
                                  className="rounded border-slate-200 text-slate-900 focus:ring-0 accent-slate-800"
                                />
                                <span>双一流高校建设</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between flex-wrap">
                              <span className="text-[10px] font-bold text-slate-500">主修表现 / 学术能力说明 / 语能证书：</span>
                              <QuickFormatBar onInsert={(snippet) => handleEducationChange(edu.id, 'description', appendSnippet(edu.description, snippet))} />
                            </div>
                            <textarea 
                              value={edu.description}
                              rows={5}
                              onChange={(e) => handleEducationChange(edu.id, 'description', e.target.value)}
                              className="editor-textarea font-mono min-h-[6.5rem]"
                              placeholder="输入荣誉奖项或主修绩点..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CORE SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">专业核心技能点</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer scale-75 origin-left">
                    <input 
                      type="checkbox" 
                      checked={data.sections.skills.header.show}
                      onChange={(e) => handleSectionHeaderChange('skills', 'show', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                    <span className="text-xs text-slate-500 font-bold select-none">显示此模块</span>
                  </label>
                </div>
              </div>

              {/* Skill add item */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <span className="text-[10px] text-slate-500 font-extrabold block">新增专业技能句段：</span>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="例如：具有扎实的 Java 基础，熟练应用 Spring 框架核心原理"
                    className="flex-1 editor-input"
                  />
                  <button 
                    onClick={addSkill}
                    className="px-4 py-2 bg-slate-900 border border-slate-950 text-white rounded-lg text-xs font-bold transition hover:bg-slate-800 cursor-pointer shadow-xs"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* Skills sorting list */}
              <div className="space-y-2.5">
                {data.sections.skills.items.map((skill, index) => (
                  <div key={skill.id} className="p-3 rounded-lg border border-slate-150 bg-white flex items-start justify-between gap-3 shadow-2xs">
                    <span className="text-xs text-slate-400 font-bold select-none mt-1 shrink-0">#{index + 1}</span>
                    <textarea 
                      value={skill.content}
                      onChange={(e) => handleSkillChange(skill.id, e.target.value)}
                      rows={2}
                      className="flex-1 border-0 bg-transparent p-0 text-xs text-slate-800 focus:ring-0 resize-y outline-none font-mono leading-relaxed min-h-[2.75rem]"
                    />
                    <button 
                      onClick={() => removeSkill(skill.id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer shrink-0"
                      title="移除此技能"
                    >
                      <LucideIcon name="Trash2" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PLUGGABLE INTERNSHIP (实习经历) */}
          {activeTab === 'internships' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">实习经历</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer scale-75 origin-left">
                    <input 
                      type="checkbox" 
                      checked={!!data.sections.internships?.header.show}
                      onChange={(e) => handleSectionHeaderChange('internships', 'show', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                    <span className="text-xs text-slate-500 font-bold select-none">显示此模块</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {data.sections.internships && data.sections.internships.items.length > 1 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => setAllCollapsed(data.sections.internships.items.map(i => i.id), false)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        全部展开
                      </button>
                      <span>/</span>
                      <button
                        type="button"
                        onClick={() => setAllCollapsed(data.sections.internships.items.map(i => i.id), true)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        全部折叠
                      </button>
                    </div>
                  )}
                  <button
                    onClick={addInternship}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-900 hover:text-white transition cursor-pointer"
                  >
                    + 新增实习记录
                  </button>
                </div>
              </div>

              {(!data.sections.internships || data.sections.internships.items.length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-6">暂无实习经历记录，点击上方按钮新增。</p>
              ) : (
                <div className="space-y-3">
                  {data.sections.internships.items.map((intern, idx) => {
                    const isCollapsed = !!collapsedItems[intern.id];
                    const summaryTitle = intern.name || `未命名企业经历 #${idx + 1}`;
                    const summarySub = [intern.role, intern.timePeriod].filter(Boolean).join(' · ');

                    return (
                      <div key={intern.id} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all shadow-2xs">
                        <div 
                          className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 cursor-pointer transition select-none"
                          role="button" tabIndex={0} aria-expanded={!isCollapsed} onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleItemCollapse(intern.id); } }} onClick={() => toggleItemCollapse(intern.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                            <span className="text-slate-400 hover:text-slate-700 transition">
                              <LucideIcon name={isCollapsed ? "ChevronRight" : "ChevronDown"} size={14} />
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {summaryTitle}
                            </span>
                            {summarySub && (
                              <span className="text-[11px] text-slate-400 font-normal truncate hidden sm:inline">
                                ({summarySub})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => removeInternship(intern.id)}
                              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-0.5"
                              title="移除此经历"
                            >
                              <LucideIcon name="XCircle" size={12} />
                              <span>移除</span>
                            </button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="p-4 space-y-3.5 border-t border-slate-200/60 bg-white/50">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500">企业/组织名称:</span>
                                <input 
                                  type="text" 
                                  value={intern.name}
                                  onChange={(e) => handleInternshipChange(intern.id, 'name', e.target.value)}
                                  className="editor-input"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500">实习岗位名称:</span>
                                <input 
                                  type="text" 
                                  value={intern.role}
                                  onChange={(e) => handleInternshipChange(intern.id, 'role', e.target.value)}
                                  className="editor-input"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500">实习起止时间:</span>
                                <input 
                                  type="text" 
                                  value={intern.timePeriod}
                                  onChange={(e) => handleInternshipChange(intern.id, 'timePeriod', e.target.value)}
                                  className="editor-input"
                                />
                              </div>
                            </div>

                            <TechTagManager
                              tags={intern.techChain || []}
                              onChange={(newTags) => handleInternshipChange(intern.id, 'techChain', newTags)}
                              label="实习涵盖的主要技术栈"
                              placeholder="输入技术名称（如 Spring Boot，支持逗号/斜杠/空格批量输入）"
                            />

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500">部门与业务背景简述：</span>
                              <textarea 
                                value={intern.description}
                                onChange={(e) => handleInternshipChange(intern.id, 'description', e.target.value)}
                                rows={3}
                                className="editor-textarea min-h-[4.5rem]"
                                placeholder="参与核心业务线优化..."
                              />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between flex-wrap">
                                <span className="text-[10px] font-bold text-slate-500">具体工作产出与业绩贡献（回车分行）：</span>
                                <QuickFormatBar onInsert={(snippet) => handleInternshipChange(intern.id, 'contributions', appendSnippet(intern.contributions, snippet))} />
                              </div>
                              <textarea 
                                value={intern.contributions}
                                onChange={(e) => handleInternshipChange(intern.id, 'contributions', e.target.value)}
                                rows={5}
                                className="editor-textarea font-mono min-h-[7rem]"
                                placeholder="• 负责核心接口性能重构..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PROJECT EXPERIENCE */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">主要研究/实践项目经历</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer scale-75 origin-left">
                    <input 
                      type="checkbox" 
                      checked={data.sections.projects.header.show}
                      onChange={(e) => handleSectionHeaderChange('projects', 'show', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                    <span className="text-xs text-slate-500 font-bold select-none">显示此模块</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {data.sections.projects.items.length > 1 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => setAllCollapsed(data.sections.projects.items.map(i => i.id), false)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        全部展开
                      </button>
                      <span>/</span>
                      <button
                        type="button"
                        onClick={() => setAllCollapsed(data.sections.projects.items.map(i => i.id), true)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        全部折叠
                      </button>
                    </div>
                  )}
                  <button
                    onClick={addProject}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-900 hover:text-white transition cursor-pointer"
                  >
                    + 新增科研/实践经历
                  </button>
                </div>
              </div>

              {/* Projects cards mapping */}
              <div className="space-y-3">
                {data.sections.projects.items.map((proj, idx) => {
                  const isCollapsed = !!collapsedItems[proj.id];
                  const summaryTitle = proj.name || `未命名实践项目 #${idx + 1}`;
                  const summarySub = [proj.role, proj.timePeriod].filter(Boolean).join(' · ');

                  return (
                    <div key={proj.id} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all shadow-2xs">
                      <div 
                        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 cursor-pointer transition select-none"
                        role="button" tabIndex={0} aria-expanded={!isCollapsed} onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleItemCollapse(proj.id); } }} onClick={() => toggleItemCollapse(proj.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <span className="text-slate-400 hover:text-slate-700 transition">
                            <LucideIcon name={isCollapsed ? "ChevronRight" : "ChevronDown"} size={14} />
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {summaryTitle}
                          </span>
                          {summarySub && (
                            <span className="text-[11px] text-slate-400 font-normal truncate hidden sm:inline">
                              ({summarySub})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => removeProject(proj.id)}
                            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-0.5"
                            title="删除此项目"
                          >
                            <LucideIcon name="XCircle" size={12} />
                            <span>删除</span>
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="p-4 space-y-3.5 border-t border-slate-200/60 bg-white/50">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500">实践项目名称：</span>
                              <input 
                                type="text" 
                                value={proj.name}
                                onChange={(e) => handleProjectChange(proj.id, 'name', e.target.value)}
                                className="editor-input"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500">担当角色/岗位：</span>
                              <input 
                                type="text" 
                                value={proj.role}
                                onChange={(e) => handleProjectChange(proj.id, 'role', e.target.value)}
                                className="editor-input"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-500">开展时间周期：</span>
                            <input 
                              type="text" 
                              value={proj.timePeriod}
                              onChange={(e) => handleProjectChange(proj.id, 'timePeriod', e.target.value)}
                              className="editor-input"
                            />
                          </div>

                          {/* Technology tags manager with edit, reorder & smart optimize */}
                          <TechTagManager
                            tags={proj.techChain || []}
                            onChange={(newTags) => handleProjectChange(proj.id, 'techChain', newTags)}
                            label="项目核心技术栈"
                            placeholder="输入技术名称（如 React, TypeScript, Tailwind，支持逗号/斜杠/空格分割）"
                          />

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500">项目/课题背景描述：</span>
                            <textarea 
                              value={proj.description}
                              onChange={(e) => handleProjectChange(proj.id, 'description', e.target.value)}
                              rows={3}
                              className="editor-textarea min-h-[4.5rem]"
                              placeholder="请输入项目的宏观目的及最终克服的系统痛点..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between flex-wrap">
                              <span className="text-[10px] font-bold text-slate-500">个人的具体贡献职责 (回车分行)：</span>
                              <QuickFormatBar onInsert={(snippet) => handleProjectChange(proj.id, 'contributions', appendSnippet(proj.contributions, snippet))} />
                            </div>
                            <textarea 
                              value={proj.contributions}
                              onChange={(e) => handleProjectChange(proj.id, 'contributions', e.target.value)}
                              rows={5}
                              className="editor-textarea font-mono min-h-[7rem]"
                              placeholder="• 负责完成了切片上传、断点续传等核心控制..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: PLUGGABLE RESEARCH & AWARDS (科研成果与竞赛) */}
          {activeTab === 'research' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">科研成果与竞赛</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer scale-75 origin-left">
                    <input 
                      type="checkbox" 
                      checked={!!data.sections.research?.header.show}
                      onChange={(e) => handleSectionHeaderChange('research', 'show', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-slate-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                    <span className="text-xs text-slate-500 font-bold select-none">显示此模块</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {data.sections.research && data.sections.research.items.length > 1 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => setAllCollapsed(data.sections.research.items.map(i => i.id), false)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        全部展开
                      </button>
                      <span>/</span>
                      <button
                        type="button"
                        onClick={() => setAllCollapsed(data.sections.research.items.map(i => i.id), true)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        全部折叠
                      </button>
                    </div>
                  )}
                  <button
                    onClick={addResearch}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-900 hover:text-white transition cursor-pointer"
                  >
                    + 新增科研学术成就
                  </button>
                </div>
              </div>

              {(!data.sections.research || data.sections.research.items.length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-6">暂无科研和竞赛成果记录，点击上方按钮新增。</p>
              ) : (
                <div className="space-y-3">
                  {data.sections.research.items.map((item, idx) => {
                    const isCollapsed = !!collapsedItems[item.id];
                    const summaryTitle = item.name || `未命名科研/竞赛 #${idx + 1}`;
                    const summarySub = [item.role, item.timePeriod].filter(Boolean).join(' · ');

                    return (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all shadow-2xs">
                        <div 
                          className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 cursor-pointer transition select-none"
                          role="button" tabIndex={0} aria-expanded={!isCollapsed} onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleItemCollapse(item.id); } }} onClick={() => toggleItemCollapse(item.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                            <span className="text-slate-400 hover:text-slate-700 transition">
                              <LucideIcon name={isCollapsed ? "ChevronRight" : "ChevronDown"} size={14} />
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {summaryTitle}
                            </span>
                            {summarySub && (
                              <span className="text-[11px] text-slate-400 font-normal truncate hidden sm:inline">
                                ({summarySub})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => removeResearch(item.id)}
                              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-0.5"
                              title="移除此项"
                            >
                              <LucideIcon name="XCircle" size={12} />
                              <span>移除</span>
                            </button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="p-4 space-y-3.5 border-t border-slate-200/60 bg-white/50">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500">科研项目/学术竞赛名称:</span>
                                <input 
                                  type="text" 
                                  value={item.name}
                                  onChange={(e) => handleResearchChange(item.id, 'name', e.target.value)}
                                  className="editor-input"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500">角色定位/所获荣誉等级:</span>
                                <input 
                                  type="text" 
                                  value={item.role}
                                  onChange={(e) => handleResearchChange(item.id, 'role', e.target.value)}
                                  className="editor-input"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500">经历起止时间:</span>
                                <input 
                                  type="text" 
                                  value={item.timePeriod}
                                  onChange={(e) => handleResearchChange(item.id, 'timePeriod', e.target.value)}
                                  className="editor-input"
                                />
                              </div>
                            </div>

                            <TechTagManager
                              tags={item.techChain || []}
                              onChange={(newTags) => handleResearchChange(item.id, 'techChain', newTags)}
                              label="科研/竞赛配套技术栈"
                              placeholder="输入技术名称（如 PyTorch, Python, 算法，支持逗号/斜杠/空格批量输入）"
                            />

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500">科研课题详情 / 项目简介：</span>
                              <textarea 
                                value={item.description}
                                onChange={(e) => handleResearchChange(item.id, 'description', e.target.value)}
                                rows={3}
                                className="editor-textarea min-h-[4.5rem]"
                                placeholder="学术赛事或研发体系细节..."
                              />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between flex-wrap">
                                <span className="text-[10px] font-bold text-slate-500">承担的研究工作及成果（回车分行）：</span>
                                <QuickFormatBar onInsert={(snippet) => handleResearchChange(item.id, 'contributions', appendSnippet(item.contributions, snippet))} />
                              </div>
                              <textarea 
                                value={item.contributions}
                                onChange={(e) => handleResearchChange(item.id, 'contributions', e.target.value)}
                                rows={5}
                                className="editor-textarea font-mono min-h-[7rem]"
                                placeholder="• 主研某核心算法优化并在核心顶会上发表相关短文..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
