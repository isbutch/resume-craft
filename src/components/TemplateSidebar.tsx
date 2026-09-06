import React from 'react';
import { ResumeData } from '../types';
import { LucideIcon } from './LucideIcon';
import { getAvatarSrc } from '../utils/avatarHelper';

interface TemplateProps {
  data: ResumeData;
}

export const TemplateSidebar: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, styling } = data;
  const { themeColor, avatarShape, avatarSize, showAvatar, fontSize, lineSpacing } = styling;

  const textSizes = {
    sm: {
      name: 'text-xl',
      title: 'text-xs',
      sectionTitle: 'text-xs',
      body: 'text-xs',
      meta: 'text-[10px]'
    },
    base: {
      name: 'text-2xl',
      title: 'text-sm',
      sectionTitle: 'text-sm',
      body: 'text-sm',
      meta: 'text-xs'
    },
    lg: {
      name: 'text-3xl',
      title: 'text-base',
      sectionTitle: 'text-base',
      body: 'text-base',
      meta: 'text-sm'
    }
  }[fontSize];

  const spacingClass = {
    tight: 'leading-[1.34]',
    normal: 'leading-[1.46]',
    relaxed: 'leading-[1.62]'
  }[lineSpacing || 'normal'];

  const renderLines = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-1"></div>;

      const isSubHeading = trimmed.startsWith('★') || trimmed.startsWith('■') || (trimmed.endsWith(':') && trimmed.length < 15);
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('▪');
      
      let content = trimmed;
      if (isBullet) {
        content = trimmed.substring(1).trim();
      }

      if (isSubHeading) {
        let prefix = '▪';
        let displayContent = content;
        if (trimmed.startsWith('★')) {
          prefix = '★';
          displayContent = trimmed.substring(1).trim();
        } else if (trimmed.startsWith('■')) {
          prefix = '■';
          displayContent = trimmed.substring(1).trim();
        } else if (trimmed.startsWith('▪')) {
          prefix = '▪';
          displayContent = trimmed.substring(1).trim();
        }
        return (
          <div key={idx} className={`font-semibold text-slate-800 ${idx > 0 ? 'mt-1.5 mb-0.5' : 'mb-0.5'} text-xs flex items-center gap-1`}>
            <span style={{ color: themeColor }}>{prefix}</span>
            <span>{displayContent}</span>
          </div>
        );
      }

      // Auto-bold key-value pairs
      const kvMatch = content.match(/^([^:：]{2,25})[:：]\s*(.*)$/);
      let contentNode: React.ReactNode = content;
      if (kvMatch && !isSubHeading) {
        contentNode = (
          <>
            <span className="font-bold text-slate-950 mr-1">{kvMatch[1]}:</span>
            <span>{kvMatch[2]}</span>
          </>
        );
      }

      return (
        <div key={idx} className={`flex items-start gap-1.5 py-[1px] text-xs text-justify ${spacingClass}`}>
          {isBullet ? (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-[5.5px] mr-0.5"></span>
          ) : null}
          <span className="flex-1 text-slate-700 font-[450]">{contentNode}</span>
        </div>
      );
    });
  };

  const getAvatarShapeClass = () => {
    switch (avatarShape) {
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-none';
      case 'rounded': return 'rounded-xl';
      default: return 'rounded-lg';
    }
  };

  return (
    <div 
      className="w-full flex flex-col md:flex-row gap-5 bg-white text-slate-800"
      style={{ fontSize: fontSize === 'sm' ? '11.5px' : fontSize === 'base' ? '12.5px' : '13.5px' }}
    >
      {/* 1. LEFT SIDEBAR: Card-style refined profile panel */}
      <aside className="w-full md:w-[27%] shrink-0 flex flex-col gap-3.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 shadow-2xs">
        
        {/* Avatar & Header */}
        <div className="flex flex-col items-center text-center gap-2">
          {showAvatar && personalInfo.avatar && (
            <div className="relative">
              <img 
                src={getAvatarSrc(personalInfo.avatar)} 
                alt={personalInfo.name} 
                referrerPolicy="no-referrer"
                className={`object-cover border-2 border-white shadow-sm ring-1 ring-slate-200/60 ${getAvatarShapeClass()}`}
                style={{ 
                  width: `${Math.min(avatarSize, 95)}px`, 
                  height: `${Math.min(avatarSize, 95)}px` 
                }}
              />
            </div>
          )}

          <div className="space-y-1 w-full">
            <h1 
              className={`font-extrabold tracking-tight text-slate-900 ${textSizes.name}`}
              style={{ color: themeColor }}
            >
              {personalInfo.name}
            </h1>
            {personalInfo.subTitle && (
              <p className="text-[11px] font-medium text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60 inline-block shadow-2xs">
                {personalInfo.subTitle}
              </p>
            )}
          </div>
        </div>

        {/* Contact Info Items */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">基本联系方式</span>
          {personalInfo.contacts.filter(c => c.show && c.value).map(contact => (
            <div key={contact.id} className="flex items-center gap-2 text-slate-700 bg-white/70 px-2 py-1 rounded-md border border-slate-150/60 text-xs">
              <span className="shrink-0 text-slate-400">
                <LucideIcon name={contact.icon} size={11} style={{ color: themeColor }} />
              </span>
              <span className="font-mono text-slate-705 text-[10.5px] truncate select-all">{contact.value}</span>
            </div>
          ))}
        </div>

        {/* Tech Stacks Tag Cloud in Sidebar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">技术亮点雷达</span>
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set([
              ...(sections.projects?.items?.flatMap(p => p.techChain) || []),
              ...(sections.internships?.items?.flatMap(p => p.techChain) || []),
            ])).filter(Boolean).slice(0, 14).map((tech, i) => (
              <span 
                key={i} 
                className="px-1.5 py-[0.5px] rounded text-[9.5px] font-medium border bg-white shadow-2xs"
                style={{ 
                  borderColor: `${themeColor}26`, 
                  color: themeColor 
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Education Highlight in sidebar */}
        {sections.education?.header?.show && sections.education.items.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">最高学历</span>
            {sections.education.items.slice(0, 1).map(edu => (
              <div key={edu.id} className="bg-white/70 p-2 rounded-lg border border-slate-150/60 text-xs space-y-0.5">
                <div className="font-bold text-slate-900 text-[11px]">{edu.school}</div>
                <div className="text-[10px] text-slate-600 flex justify-between">
                  <span>{edu.majorAndDegree}</span>
                  <span className="font-semibold text-slate-800">{edu.degree}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* 2. RIGHT MAIN WORKSPACE: Spacious & Structured */}
      <main className="flex-1 space-y-2.5 min-w-0">
        {(styling.sectionOrder || ['skills', 'education', 'projects', 'internships', 'research']).map((key) => {
          switch (key) {
            case 'education':
              return sections.education.header.show && (
                <section className="group-section space-y-1.5" key="education">
                  {/* Section Title */}
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <span 
                      className="w-1.5 h-3.5 rounded-full shrink-0" 
                      style={{ backgroundColor: themeColor }}
                    ></span>
                    <h2 className={`font-bold text-slate-900 tracking-wider ${textSizes.sectionTitle}`}>
                      {sections.education.header.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-1.5">
                    {sections.education.items.map(edu => (
                      <div key={edu.id} className="space-y-0.5">
                        <div className="flex justify-between items-center flex-wrap gap-x-2 text-xs">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="font-bold text-slate-950">{edu.school}</span>
                            {edu.is211 && <span className="px-1 py-[0.1px] text-[8.5px] font-bold border rounded select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>211</span>}
                            {edu.is985 && <span className="px-1 py-[0.1px] text-[8.5px] font-bold border rounded select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>985</span>}
                            {edu.isDoubleFirst && <span className="px-1 py-[0.1px] text-[8.5px] font-bold border rounded select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>双一流</span>}
                            <span className="text-slate-300">|</span>
                            {edu.degree && (
                              <span className="px-1 py-[0.1px] text-[9px] font-semibold text-slate-700 bg-slate-100 rounded">
                                {edu.degree}
                              </span>
                            )}
                            <span className="font-medium text-slate-800">{edu.majorAndDegree}</span>
                          </div>
                          <span className="text-slate-600 font-mono text-[10px] shrink-0 font-medium">{edu.timePeriod}</span>
                        </div>
                        {edu.description && (
                          <div className="text-xs pt-0.5">
                            {renderLines(edu.description)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'skills':
              return sections.skills.header.show && (
                <section className="group-section space-y-1.5" key="skills">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <span className="w-1.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                    <h2 className={`font-bold text-slate-900 tracking-wider ${textSizes.sectionTitle}`}>
                      {sections.skills.header.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-0.5 text-xs">
                    {sections.skills.items.map(skill => (
                      <div key={skill.id} className="text-xs">
                        {renderLines(`• ${skill.content}`)}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'projects':
              return sections.projects.header.show && (
                <section className="group-section space-y-1.5" key="projects">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <span className="w-1.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                    <h2 className={`font-bold text-slate-900 tracking-wider ${textSizes.sectionTitle}`}>
                      {sections.projects.header.title}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {sections.projects.items.map((proj, idx) => (
                      <div key={proj.id} className="space-y-1">
                        <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-950">{idx + 1}. {proj.name}</span>
                            {proj.role && (
                              <span className="text-[10.5px] font-semibold text-slate-600 before:content-['|'] before:mr-1 before:text-slate-300">
                                {proj.role}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-600 font-mono font-medium">
                            {proj.timePeriod}
                          </span>
                        </div>

                        {proj.techChain && proj.techChain.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {proj.techChain.map((tag, tagIdx) => (
                              <span 
                                key={tagIdx} 
                                className="px-1.5 py-[0.2px] rounded text-[9.5px] font-medium border"
                                style={{ 
                                  backgroundColor: `${themeColor}08`, 
                                  borderColor: `${themeColor}20`,
                                  color: themeColor 
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="space-y-0.5 text-xs">
                          {proj.description && (
                            <div className={`text-justify flex items-start gap-1 ${spacingClass}`}>
                              <span className="font-bold text-slate-900 shrink-0">项目描述:</span>
                              <span className="text-slate-700 flex-1">{proj.description}</span>
                            </div>
                          )}
                          {proj.contributions && (
                            <div className="space-y-0.5">
                              {renderLines(proj.contributions)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'internships':
              return sections.internships && sections.internships.header.show && (
                <section className="group-section space-y-1.5" key="internships">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <span className="w-1.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                    <h2 className={`font-bold text-slate-900 tracking-wider ${textSizes.sectionTitle}`}>
                      {sections.internships.header.title || '工作与实习经历'}
                    </h2>
                  </div>
                  
                  <div className="space-y-2">
                    {sections.internships.items.map((intern, idx) => (
                      <div key={intern.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs flex-wrap gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-950">{idx + 1}. {intern.name}</span>
                            {intern.role && (
                              <span className="text-[10.5px] font-semibold text-slate-600 before:content-['|'] before:mr-1 before:text-slate-300">
                                {intern.role}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-600 text-[10px] font-mono font-medium">{intern.timePeriod}</span>
                        </div>

                        {intern.techChain && intern.techChain.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {intern.techChain.map((tag, tagIdx) => (
                              <span 
                                key={tagIdx} 
                                className="px-1.5 py-[0.2px] rounded text-[9.5px] font-medium border"
                                style={{ 
                                  backgroundColor: `${themeColor}08`, 
                                  borderColor: `${themeColor}20`,
                                  color: themeColor 
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="space-y-0.5 text-xs">
                          {intern.description && (
                            <div className={`text-justify flex items-start gap-1 ${spacingClass}`}>
                              <span className="font-bold text-slate-900 shrink-0">职责定位:</span>
                              <span className="text-slate-700 flex-1">{intern.description}</span>
                            </div>
                          )}
                          {intern.contributions && (
                            <div className="space-y-0.5">
                              {renderLines(intern.contributions)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'research':
              return sections.research && sections.research.header.show && (
                <section className="group-section space-y-1.5" key="research">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <span className="w-1.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                    <h2 className={`font-bold text-slate-900 tracking-wider ${textSizes.sectionTitle}`}>
                      {sections.research.header.title || '科研学术与竞赛'}
                    </h2>
                  </div>
                  
                  <div className="space-y-2">
                    {sections.research.items.map((item, idx) => (
                      <div key={item.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs flex-wrap gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-950">{idx + 1}. {item.name}</span>
                            {item.role && (
                              <span className="text-[10.5px] font-semibold text-slate-600 before:content-['|'] before:mr-1 before:text-slate-300">
                                {item.role}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-600 text-[10px] font-mono font-medium">{item.timePeriod}</span>
                        </div>

                        <div className="space-y-0.5 text-xs">
                          {item.description && (
                            <div className={`text-justify flex items-start gap-1 ${spacingClass}`}>
                              <span className="font-bold text-slate-900 shrink-0">项目情况:</span>
                              <span className="text-slate-700 flex-1">{item.description}</span>
                            </div>
                          )}
                          {item.contributions && (
                            <div className="space-y-0.5">
                              {renderLines(item.contributions)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>
    </div>
  );
};

export default TemplateSidebar;
