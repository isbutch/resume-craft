/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Available font families
export type FontFamily = 'sans' | 'serif' | 'mono' | 'yahei' | 'kaiti' | 'simsun';

// Layout Templates
export type TemplateId = 'classic' | 'minimal';

// Avatar shapes
export type AvatarShape = 'circle' | 'square' | 'rounded';

// Styling Configuration
export interface ResumeStyling {
  themeColor: string; // Hex color code or Tailwind color class context
  templateId: TemplateId;
  fontFamily: FontFamily;
  fontSize: 'sm' | 'base' | 'lg';
  lineSpacing: 'tight' | 'normal' | 'relaxed';
  avatarShape: AvatarShape;
  avatarSize: number; // in pixels (e.g. 80 to 140)
  sectionSpacing: 'compact' | 'normal' | 'comfortable';
  pagePadding?: 'compact' | 'normal' | 'comfortable';
  showAvatar: boolean;
  sectionOrder?: string[]; // Order of sections, e.g. ['skills', 'education', 'projects', ...]
}

// Personal Contact item
export interface ContactField {
  id: string;
  label: string;
  value: string;
  icon: string; // Lucide icon name, e.g. "Phone", "Mail", "MapPin"
  show: boolean;
}

// Personal Info Section
export interface PersonalInfo {
  name: string;
  avatar: string; // base64 encoded or URL
  subTitle: string; // e.g. "本科 | 计算机科学与技术" or "求职意向：Java后端开发"
  contacts: ContactField[];
}

// Education Item
export interface EducationItem {
  id: string;
  school: string;
  majorAndDegree: string; // e.g. "信息工程学院"
  degree?: string; // e.g. "本科", "硕士", "博士", "专科"
  is211?: boolean; // Tag for 211 school
  is985?: boolean; // Tag for 985 school
  isDoubleFirst?: boolean; // Tag for 双一流
  timePeriod: string; // e.g. "2019年09月 - 2023年06月"
  description: string; // Can support bullet points or markdown
}

// Project Item
export interface ProjectItem {
  id: string;
  name: string;
  role: string; // e.g. "开发人员"
  timePeriod: string; // e.g. "2022年10月 - 2023年01月"
  techChain: string[]; // Tech stacks to highlight, e.g. ["Spring Boot", "JWT", "Redis"]
  description: string; // Overall project description
  contributions: string; // Work details / accomplishments
}

// Professional Skill Item
export interface SkillItem {
  id: string;
  content: string; // e.g. "具有扎实的 Java 基础，理解 OOP 编程思想"
  proficiency?: 'basic' | 'medium' | 'advanced' | ''; // Optional highlight
}

// Standard Section Settings (Customizable icons and names)
export interface SectionHeader {
  id: string;
  title: string;
  icon: string; // Lucide name
  show: boolean;
}

// Full Resume Data
export interface ResumeData {
  id: string;
  title: string; // Document title
  personalInfo: PersonalInfo;
  sections: {
    education: {
      header: SectionHeader;
      items: EducationItem[];
    };
    skills: {
      header: SectionHeader;
      items: SkillItem[];
    };
    projects: {
      header: SectionHeader;
      items: ProjectItem[];
    };
    internships?: {
      header: SectionHeader;
      items: ProjectItem[];
    };
    research?: {
      header: SectionHeader;
      items: ProjectItem[];
    };
  };
  styling: ResumeStyling;
}
