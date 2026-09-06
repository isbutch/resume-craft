import React from 'react';
import { ResumeData } from '../types';
import { LucideIcon } from './LucideIcon';
import { getAvatarSrc } from '../utils/avatarHelper';

interface TemplateProps {
  data: ResumeData;
}

export const TemplateClassic: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, styling } = data;
  const { themeColor, avatarShape, avatarSize, showAvatar, fontSize, lineSpacing } = styling;

  // Text Sizes Mapping
  const textSizes = {
    sm: {
      name: 'text-2xl',
      title: 'text-sm',
      sectionTitle: 'text-sm',
      body: 'text-xs',
      meta: 'text-[10px]'
    },
    base: {
      name: 'text-3xl',
      title: 'text-base',
      sectionTitle: 'text-base',
      body: 'text-sm',
      meta: 'text-xs'
    },
    lg: {
      name: 'text-4xl',
      title: 'text-lg',
      sectionTitle: 'text-lg',
      body: 'text-base',
      meta: 'text-sm'
    }
  }[fontSize];

  // Line spacing mapping
  const spacingClass = {
    tight: 'leading-[1.34]',
    normal: 'leading-[1.46]',
    relaxed: 'leading-[1.62]'
  }[lineSpacing || 'normal'];

  // Parse multiline string nicely
  const renderLines = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-1"></div>;

      // Detect subheaders or markers (EndsWith(':') is removed to allow unified kvMatch bolding)
      const isSubHeading = trimmed.startsWith('★') || trimmed.startsWith('■');
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('▪');
      
      let content = trimmed;
      if (isBullet) {
        content = trimmed.substring(1).trim();
      }

      if (isSubHeading) {
        let prefix = '■';
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
          <div key={idx} className={`font-semibold text-slate-800 ${idx > 0 ? 'mt-2 mb-0.5' : 'mb-0.5'} flex items-center gap-1.5 text-xs`}>
            <span style={{ color: themeColor }}>{prefix}</span>
            <span>{displayContent}</span>
          </div>
        );
      }

      let contentNode: React.ReactNode = content;
      
      // Auto-bold key-value pairs (e.g. "所获荣誉: 一等奖", "岗位：前端", "角色定位/所获荣誉等级:")
      const kvMatch = content.match(/^([^:：]{2,25})[:：]\s*(.*)$/);
      if (kvMatch && !isSubHeading) {
        contentNode = (
          <>
            <span className="font-bold text-slate-950 mr-1">{kvMatch[1]}:</span>
            <span>{kvMatch[2]}</span>
          </>
        );
      }

      return (
        <div key={idx} className={`flex items-start gap-1.5 py-[1px] text-justify ${spacingClass}`}>
          {isBullet ? (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-[5px] mr-0.5"></span>
          ) : null}
          <span className={`flex-1 text-slate-900 font-[450] ${spacingClass}`}>{contentNode}</span>
        </div>
      );
    });
  };

  const renderInlineKV = (text: string) => {
    if (!text) return null;
    const kvMatch = text.match(/^([^:：]{2,25})[:：]\s*(.*)$/);
    if (kvMatch) {
      return (
        <div className="flex items-center gap-1.5 before:content-[''] before:h-3 before:w-[1.5px] before:bg-slate-400 before:rounded-full ml-0.5 pl-0.5">
          <span className="text-xs text-slate-900 font-[450]">
            <span className="font-bold text-slate-950 mr-1">{kvMatch[1]}:</span>
            <span>{kvMatch[2]}</span>
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 before:content-[''] before:h-3 before:w-[1.5px] before:bg-slate-400 before:rounded-full ml-0.5 pl-0.5">
        <span className="text-xs text-slate-800 font-[450]">{text}</span>
      </div>
    );
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
    <div className="w-full text-slate-800 bg-white" style={{ fontSize: fontSize === 'sm' ? '11.5px' : fontSize === 'base' ? '12.5px' : '13.5px' }}>
      
      {/* 1. HEADER SECTION */}
      <header className="flex flex-row justify-between items-start gap-3 pb-1.5 mb-0 border-b border-slate-200">
        <div className="flex-1 space-y-0.5">
          <div>
            <h1 
              className={`font-bold tracking-tight mb-0.5 ${textSizes.name}`} 
              style={{ color: themeColor }}
              id="resume-name"
            >
              {personalInfo.name}
            </h1>
            {personalInfo.subTitle && (
              <p className={`font-medium text-slate-500 tracking-wide ${textSizes.title}`}>{personalInfo.subTitle}</p>
            )}
          </div>

          {/* Fully redesigned contact container: compact inline wrap without extra top border */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0">
            {personalInfo.contacts.filter(c => c.show && c.value).map(contact => (
              <div key={contact.id} className="flex items-center gap-2 text-slate-600 text-xs" style={{ lineHeight: '1.5' }}>
                <span className="inline-flex items-center justify-center p-1 rounded-md bg-slate-50 border border-slate-100 shrink-0 text-slate-500" style={{ verticalAlign: 'middle' }}>
                  <LucideIcon name={contact.icon} size={12} style={{ color: themeColor, display: 'block' }} />
                </span>
                <span className="font-mono text-slate-700 break-all select-all" style={{ verticalAlign: 'middle' }}>{contact.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Avatar */}
        {showAvatar && personalInfo.avatar && (
          <div className="shrink-0 mx-0">
            <img 
              src={getAvatarSrc(personalInfo.avatar)} 
              alt={personalInfo.name} 
              referrerPolicy="no-referrer"
              className={`object-cover border border-slate-200 shadow-xs ${getAvatarShapeClass()}`}
              style={{ 
                width: `${avatarSize}px`, 
                height: `${avatarSize}px` 
              }}
            />
          </div>
        )}
      </header>

      {/* 2. BODY CONTENT */}
      <div className="mt-2.5 space-y-2.5">
        {(styling.sectionOrder || ['skills', 'education', 'projects', 'internships', 'research']).map((key) => {
          switch (key) {
            case 'education':
              return sections.education.header.show && (
                <section className="group-section" key="education">
                  <div 
                    className="flex items-center gap-2 pb-1 border-b-2 mb-2"
                    style={{ borderBottomColor: themeColor }}
                  >
                    <span className="inline-flex items-center justify-center p-1 rounded-md" style={{ backgroundColor: `${themeColor}12`, color: themeColor, lineHeight: 0 }}>
                      <LucideIcon name={sections.education.header.icon} size={16} />
                    </span>
                    <h2 className={`font-bold text-slate-950 tracking-wider ${textSizes.sectionTitle}`} style={{ lineHeight: '1.3' }}>
                      {sections.education.header.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-1.5">
                    {sections.education.items.map(edu => (
                      <div key={edu.id} className="space-y-1">
                        <div className="flex justify-between items-start flex-wrap gap-x-4 gap-y-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="font-bold text-slate-900">{edu.school}</span>
                            {edu.is211 && (
                              <span className="px-1 py-[0.5px] text-[9px] font-extrabold rounded-md border select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>
                                211
                              </span>
                            )}
                            {edu.is985 && (
                              <span className="px-1 py-[0.5px] text-[9px] font-extrabold rounded-md border select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>
                                985
                              </span>
                            )}
                            {edu.isDoubleFirst && (
                              <span className="px-1 py-[0.5px] text-[9px] font-extrabold rounded-md border select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>
                                双一流
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 text-right">
                            {edu.degree && (
                              <span className="px-1 py-[0.5px] text-[10px] font-semibold text-slate-800 rounded-md bg-slate-200/60 border border-slate-300 select-none">
                                {edu.degree}
                              </span>
                            )}
                            <span className="font-bold text-slate-900">{edu.majorAndDegree}</span>
                            <span className={`text-slate-700 font-medium font-mono text-right shrink-0 ${textSizes.meta}`}>{edu.timePeriod}</span>
                          </div>
                        </div>
                        {edu.description && (
                          <div className="space-y-0.5 text-xs pt-1">
                            {renderLines(edu.description)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'internships':
              return sections.internships && sections.internships.header.show && (
                <section className="group-section" key="internships">
                  <div 
                    className="flex items-center gap-2 pb-1 border-b-2 mb-2"
                    style={{ borderBottomColor: themeColor }}
                  >
                    <span className="inline-flex items-center justify-center p-1 rounded-md" style={{ backgroundColor: `${themeColor}12`, color: themeColor, lineHeight: 0 }}>
                      <LucideIcon name={sections.internships.header.icon || 'Briefcase'} size={16} />
                    </span>
                    <h2 className={`font-bold text-slate-950 tracking-wider ${textSizes.sectionTitle}`} style={{ lineHeight: '1.3' }}>
                      {sections.internships.header.title || '实习经历'}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {sections.internships.items.map((intern, idx) => (
                      <div key={intern.id} className="space-y-1">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{idx + 1}、{intern.name}</span>
                            {intern.role && renderInlineKV(intern.role)}
                          </div>
                          <span className={`text-slate-700 font-medium font-mono ${textSizes.meta}`}>{intern.timePeriod}</span>
                        </div>

                        {intern.techChain && intern.techChain.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {intern.techChain.map((tag, tagIdx) => (
                              <span 
                                key={tagIdx} 
                                className="px-1.5 py-[0.5px] rounded border text-[10px] font-medium select-none"
                                style={{ 
                                  backgroundColor: `${themeColor}09`, 
                                  borderColor: `${themeColor}1a`,
                                  color: themeColor
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1 pl-1">
                          {intern.description && (
                            <div className={`text-xs text-justify flex items-start gap-1.5 ${spacingClass}`}>
                              <span className="font-bold text-slate-900 shrink-0 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                                职责描述:
                              </span>
                              <span className="text-slate-700 flex-1">{intern.description}</span>
                            </div>
                          )}
                          {intern.contributions && (
                            <div className="text-xs space-y-0.5">
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
                <section className="group-section" key="research">
                  <div 
                    className="flex items-center gap-2 pb-1 border-b-2 mb-2"
                    style={{ borderBottomColor: themeColor }}
                  >
                    <span className="inline-flex items-center justify-center p-1 rounded-md" style={{ backgroundColor: `${themeColor}12`, color: themeColor, lineHeight: 0 }}>
                      <LucideIcon name={sections.research.header.icon || 'Award'} size={16} />
                    </span>
                    <h2 className={`font-bold text-slate-950 tracking-wider ${textSizes.sectionTitle}`} style={{ lineHeight: '1.3' }}>
                      {sections.research.header.title || '科研学术与竞赛'}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {sections.research.items.map((item, idx) => (
                      <div key={item.id} className="space-y-1">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{idx + 1}、{item.name}</span>
                            {item.role && renderInlineKV(item.role)}
                          </div>
                          <span className={`text-slate-700 font-medium font-mono ${textSizes.meta}`}>{item.timePeriod}</span>
                        </div>

                        {item.techChain && item.techChain.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.techChain.map((tag, tagIdx) => (
                              <span 
                                key={tagIdx} 
                                className="px-1.5 py-[0.5px] rounded border text-[10px] font-medium select-none"
                                style={{ 
                                  backgroundColor: `${themeColor}09`, 
                                  borderColor: `${themeColor}1a`,
                                  color: themeColor
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1 pl-1">
                          {item.description && (
                            <div className={`text-xs text-justify flex items-start gap-1.5 ${spacingClass}`}>
                              <span className="font-bold text-slate-900 shrink-0 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                                项目情况:
                              </span>
                              <span className="text-slate-700 flex-1">{item.description}</span>
                            </div>
                          )}
                          {item.contributions && (
                            <div className="text-xs space-y-0.5">
                              {renderLines(item.contributions)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            case 'skills':
              return sections.skills.header.show && (
                <section className="group-section" key="skills">
                  <div 
                    className="flex items-center gap-2 pb-1 border-b-2 mb-2"
                    style={{ borderBottomColor: themeColor }}
                  >
                    <span className="inline-flex items-center justify-center p-1 rounded-md" style={{ backgroundColor: `${themeColor}12`, color: themeColor, lineHeight: 0 }}>
                      <LucideIcon name={sections.skills.header.icon} size={16} />
                    </span>
                    <h2 className={`font-bold text-slate-950 tracking-wider ${textSizes.sectionTitle}`} style={{ lineHeight: '1.3' }}>
                      {sections.skills.header.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-1 pl-1">
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
                <section className="group-section" key="projects">
                  <div 
                    className="flex items-center gap-2 pb-1 border-b-2 mb-2"
                    style={{ borderBottomColor: themeColor }}
                  >
                    <span className="inline-flex items-center justify-center p-1 rounded-md" style={{ backgroundColor: `${themeColor}12`, color: themeColor, lineHeight: 0 }}>
                      <LucideIcon name={sections.projects.header.icon} size={16} />
                    </span>
                    <h2 className={`font-bold text-slate-950 tracking-wider ${textSizes.sectionTitle}`} style={{ lineHeight: '1.3' }}>
                      {sections.projects.header.title}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {sections.projects.items.map((proj, idx) => (
                      <div key={proj.id} className="space-y-1">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{idx + 1}、{proj.name}</span>
                            {proj.role && renderInlineKV(proj.role)}
                          </div>
                          <span className={`text-slate-700 font-medium font-mono ${textSizes.meta}`}>{proj.timePeriod}</span>
                        </div>

                        {proj.techChain && proj.techChain.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {proj.techChain.map((tag, tagIdx) => (
                              <span 
                                key={tagIdx} 
                                className="px-1.5 py-[0.5px] rounded border text-[10px] font-medium select-none"
                                style={{ 
                                  backgroundColor: `${themeColor}09`, 
                                  borderColor: `${themeColor}1a`,
                                  color: themeColor
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1 pl-1">
                          {proj.description && (
                            <div className={`text-xs text-justify flex items-start gap-1.5 ${spacingClass}`}>
                              <span className="font-bold text-slate-900 shrink-0 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: themeColor }}></span>
                                项目描述:
                              </span>
                              <span className="text-slate-700 flex-1">{proj.description}</span>
                            </div>
                          )}

                          {proj.contributions && (
                            <div className="text-xs space-y-0.5">
                              {renderLines(proj.contributions)}
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
      </div>
    </div>
  );
};

export default TemplateClassic;
