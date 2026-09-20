import React from 'react';

interface ExperienceDescriptionProps {
  label?: string;
  themeColor: string;
  children: React.ReactNode;
  className?: string;
}

const DEFAULT_DESCRIPTION_LABELS = ['项目描述', '项目概述', '经历描述', '经历概述', '背景描述', '业务背景'];

export const stripLeadingDescriptionLabel = (description: string, label?: string) => {
  const trimmed = description.trim();
  const separatorIndex = trimmed.search(/[:：]/);
  if (separatorIndex < 0) return trimmed;
  const prefix = trimmed.slice(0, separatorIndex).trim();
  const knownLabels = label?.trim() ? [label.trim(), ...DEFAULT_DESCRIPTION_LABELS] : DEFAULT_DESCRIPTION_LABELS;
  return knownLabels.includes(prefix) ? trimmed.slice(separatorIndex + 1).trimStart() : trimmed;
};

export const ExperienceDescription: React.FC<ExperienceDescriptionProps> = ({
  label,
  themeColor,
  children,
  className = ''
}) => (
  <div className={`flex items-start gap-0.5 text-justify ${className}`}>
    {label?.trim() && (
      <span
        className="shrink-0 font-bold"
        style={{ color: themeColor }}
      >
        {label.trim()}：
      </span>
    )}
    <div className="min-w-0 flex-1 font-normal text-slate-700">{children}</div>
  </div>
);
