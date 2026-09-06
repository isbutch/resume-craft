import React from 'react';
import { ResumeData } from '../types';
import { LucideIcon } from './LucideIcon';
import { getAvatarSrc } from '../utils/avatarHelper';

interface TemplateProps {
  data: ResumeData;
}

export const TemplateMinimal: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, sections, styling } = data;
  const { themeColor, avatarShape, avatarSize, showAvatar, fontSize, lineSpacing } = styling;

  const textSizes = {
    sm: {
      name: 'text-2xl',
      title: 'text-xs',
      sectionTitle: 'text-xs',
      body: 'text-xs',
      meta: 'text-[10px]'
    },
    base: {
      name: 'text-3xl',
      title: 'text-sm',
      sectionTitle: 'text-sm',
      body: 'text-sm',
      meta: 'text-xs'
    },
    lg: {
      name: 'text-4xl',
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
      
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('▪');
      let content = trimmed;
      if (isBullet) {
        content = trimmed.substring(1).trim();
      }

      // Auto-bold key-value pairs
      const kvMatch = content.match(/^([^:：]{2,25})[:：]\s*(.*)$/);
      let contentNode: React.ReactNode = content;
      if (kvMatch) {
        contentNode = (
          <>
            <span className="font-bold text-slate-950 mr-1">{kvMatch[1]}:</span>
            <span>{kvMatch[2]}</span>
          </>
        );
      }

      return (
        <div key={idx} className={`text-slate-700 flex items-start py-[1px] text-xs text-justify ${spacingClass}`}>
          {isBullet ? (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-350 shrink-0 mt-[5.5px] mr-1.5"></span>
          ) : null}
          <span className="flex-1 font-[420]">{contentNode}</span>
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
      className="w-full text-slate-800 bg-white space-y-3"
      style={{ fontSize: fontSize === 'sm' ? '11.5px' : fontSize === 'base' ? '12.5px' : '13.5px' }}
    >
      {/* 1. MINIMAL HEADER: Clean, airy & sophisticated */}
      <header className="flex justify-between items-start pb-3 border-b border-slate-200/80 gap-4">
        <div className="space-y-1.5 flex-1">
          <div>
            <h1 
              className={`font-black tracking-tight text-slate-950 ${textSizes.name}`}
              style={{ letterSpacing: '-0.02em' }}
            >
              {personalInfo.name}
            </h1>
            {personalInfo.subTitle && (
              <p className="font-medium text-slate-500 tracking-wide text-xs pt-0.5" style={{ color: themeColor }}>
                {personalInfo.subTitle}
              </p>
            )}
          </div>

          {/* Clean contact list */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-slate-600 font-medium">
            {personalInfo.contacts.filter(c => c.show && c.value).map(contact => (
              <span key={contact.id} className="flex items-center gap-1.5 text-[11px]">
                <LucideIcon name={contact.icon} size={11} className="text-slate-400" />
                <span className="font-mono text-slate-700 select-all">{contact.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Minimal Avatar (Clean & Crisp, no gray washed-out filter) */}
        {showAvatar && personalInfo.avatar && (
          <div className="shrink-0">
            <img 
              src={getAvatarSrc(personalInfo.avatar)} 
              alt={personalInfo.name} 
              referrerPolicy="no-referrer"
              className={`object-cover border border-slate-200/80 shadow-xs ${getAvatarShapeClass()}`}
              style={{ 
                width: `${avatarSize}px`, 
                height: `${avatarSize}px` 
              }}
            />
          </div>
        )}
      </header>

      {/* 2. BODY CONTENT */}
      {(styling.sectionOrder || ['skills', 'education', 'projects', 'internships', 'research']).map((key) => {
        switch (key) {
          case 'education':
            return sections.education.header.show && (
              <section className="group-section space-y-1" key="education">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-0.5">
                  <h2 className={`font-bold tracking-wider text-slate-950 uppercase ${textSizes.sectionTitle}`}>
                    {sections.education.header.title}
                  </h2>
                  <span className="h-[2px] w-6 rounded-full" style={{ backgroundColor: themeColor }}></span>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  {sections.education.items.map(edu => (
                    <div key={edu.id} className="space-y-0.5">
                      <div className="flex justify-between items-baseline flex-wrap gap-2 text-xs">
                        <div className="font-bold text-slate-900 flex items-center flex-wrap gap-1.5">
                          <span>{edu.school}</span>
                          {edu.is211 && <span className="px-1 py-[0.1px] text-[8.5px] font-bold border rounded select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>211</span>}
                          {edu.is985 && <span className="px-1 py-[0.1px] text-[8.5px] font-bold border rounded select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>985</span>}
                          {edu.isDoubleFirst && <span className="px-1 py-[0.1px] text-[8.5px] font-bold border rounded select-none" style={{ color: themeColor, borderColor: `${themeColor}40`, backgroundColor: `${themeColor}08` }}>双一流</span>}
                          <span className="text-slate-300 font-normal">/</span>
                          {edu.degree && (
                            <span className="text-slate-700 font-medium">
                              {edu.degree}
                            </span>
                          )}
                          <span className="text-slate-700 font-normal">{edu.majorAndDegree}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[10.5px] font-medium">{edu.timePeriod}</span>
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
              <section className="group-section space-y-1" key="skills">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-0.5">
                  <h2 className={`font-bold tracking-wider text-slate-950 uppercase ${textSizes.sectionTitle}`}>
                    {sections.skills.header.title}
                  </h2>
                  <span className="h-[2px] w-6 rounded-full" style={{ backgroundColor: themeColor }}></span>
                </div>

                <div className="space-y-0.5 pt-0.5 text-xs">
                  {sections.skills.items.map(skill => (
                    <div key={skill.id}>
                      {renderLines(`• ${skill.content}`)}
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'projects':
            return sections.projects.header.show && (
              <section className="group-section space-y-1" key="projects">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-0.5">
                  <h2 className={`font-bold tracking-wider text-slate-950 uppercase ${textSizes.sectionTitle}`}>
                    {sections.projects.header.title}
                  </h2>
                  <span className="h-[2px] w-6 rounded-full" style={{ backgroundColor: themeColor }}></span>
                </div>

                <div className="space-y-2 pt-0.5">
                  {sections.projects.items.map((proj, idx) => (
                    <div key={proj.id} className="space-y-0.5">
                      <div className="flex justify-between items-baseline flex-wrap gap-2 text-xs">
                        <div className="font-extrabold text-slate-950 flex items-center gap-1.5">
                          <span>{idx + 1}. {proj.name}</span>
                          {proj.role && (
                            <span className="font-medium text-slate-500 text-[11px] before:content-['('] after:content-[')']">
                              {proj.role}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 font-mono text-[10.5px] font-medium">{proj.timePeriod}</span>
                      </div>

                      {proj.techChain && proj.techChain.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {proj.techChain.map((tag, tagIdx) => (
                            <span 
                              key={tagIdx} 
                              className="px-1.5 py-[0.2px] bg-slate-50 border border-slate-200/80 rounded text-[9.5px] text-slate-600 font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-0.5 text-xs pt-0.5">
                        {proj.description && (
                          <div className={`text-slate-700 text-justify flex items-start gap-1 ${spacingClass}`}>
                            <span className="font-semibold text-slate-900 shrink-0">项目概述:</span>
                            <span className="flex-1">{proj.description}</span>
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
              <section className="group-section space-y-1" key="internships">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-0.5">
                  <h2 className={`font-bold tracking-wider text-slate-950 uppercase ${textSizes.sectionTitle}`}>
                    {sections.internships.header.title || '工作与实习经历'}
                  </h2>
                  <span className="h-[2px] w-6 rounded-full" style={{ backgroundColor: themeColor }}></span>
                </div>

                <div className="space-y-2 pt-0.5">
                  {sections.internships.items.map((intern, idx) => (
                    <div key={intern.id} className="space-y-0.5">
                      <div className="flex justify-between items-baseline flex-wrap gap-2 text-xs">
                        <div className="font-extrabold text-slate-950 flex items-center gap-1.5">
                          <span>{idx + 1}. {intern.name}</span>
                          {intern.role && (
                            <span className="font-medium text-slate-500 text-[11px] before:content-['('] after:content-[')']">
                              {intern.role}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 font-mono text-[10.5px] font-medium">{intern.timePeriod}</span>
                      </div>

                      {intern.techChain && intern.techChain.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {intern.techChain.map((tag, tagIdx) => (
                            <span 
                              key={tagIdx} 
                              className="px-1.5 py-[0.2px] bg-slate-50 border border-slate-200/80 rounded text-[9.5px] text-slate-600 font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-0.5 text-xs pt-0.5">
                        {intern.description && (
                          <div className={`text-slate-700 text-justify flex items-start gap-1 ${spacingClass}`}>
                            <span className="font-semibold text-slate-900 shrink-0">职责定位:</span>
                            <span className="flex-1">{intern.description}</span>
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
              <section className="group-section space-y-1" key="research">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-0.5">
                  <h2 className={`font-bold tracking-wider text-slate-950 uppercase ${textSizes.sectionTitle}`}>
                    {sections.research.header.title || '科研学术与竞赛'}
                  </h2>
                  <span className="h-[2px] w-6 rounded-full" style={{ backgroundColor: themeColor }}></span>
                </div>

                <div className="space-y-2 pt-0.5">
                  {sections.research.items.map((item, idx) => (
                    <div key={item.id} className="space-y-0.5">
                      <div className="flex justify-between items-baseline flex-wrap gap-2 text-xs">
                        <div className="font-extrabold text-slate-950 flex items-center gap-1.5">
                          <span>{idx + 1}. {item.name}</span>
                          {item.role && (
                            <span className="font-medium text-slate-500 text-[11px] before:content-['('] after:content-[')']">
                              {item.role}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 font-mono text-[10.5px] font-medium">{item.timePeriod}</span>
                      </div>

                      <div className="space-y-0.5 text-xs pt-0.5">
                        {item.description && (
                          <div className={`text-slate-700 text-justify flex items-start gap-1 ${spacingClass}`}>
                            <span className="font-semibold text-slate-900 shrink-0">项目情况:</span>
                            <span className="flex-1">{item.description}</span>
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
    </div>
  );
};

export default TemplateMinimal;
