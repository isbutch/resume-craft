import { INITIAL_RESUME_DATA } from '../data/defaultResume';
import { ResumeData } from '../types';

export const STORAGE_KEY = 'RESUME_BUILDER_DATA';
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export const freshResume = (): ResumeData => structuredClone(INITIAL_RESUME_DATA);

/**
 * Identifies only the first shipped demo. It used this fixed document ID;
 * user-created resumes receive a generated ID and are never matched by project,
 * skill, name, or generic contact text.
 */
export const isRetiredExample = (data: ResumeData) =>
  data.id === 'resume-1';

type RecordValue = Record<string, unknown>;
const object = (value: unknown): RecordValue => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('数据必须为对象');
  return value as RecordValue;
};
// Copy known fields only. Missing fields migrate from defaults; wrong types are rejected.
const fields = <T extends object>(value: unknown, defaults: T): T => {
  const input = object(value);
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    if (input[key as string] === undefined) continue;
    if (typeof input[key as string] !== typeof defaults[key]) throw new Error(`字段 ${String(key)} 类型错误`);
    result[key] = input[key as string] as T[keyof T];
  }
  return result;
};
const list = <T>(value: unknown, parse: (value: unknown) => T): T[] => {
  if (!Array.isArray(value) || value.length > 500) throw new Error('列表格式错误或条目过多');
  return value.map(parse);
};
const uniqueIds = <T extends { id: string }>(items: T[]): T[] => {
  const ids = new Set<string>();
  return items.map(item => {
    const id = item.id && !ids.has(item.id) ? item.id : crypto.randomUUID();
    ids.add(id);
    return { ...item, id };
  });
};

export function parseResume(value: unknown): ResumeData {
  const input = object(value);
  const personal = object(input.personalInfo);
  const sections = object(input.sections);
  const result = freshResume();
  Object.assign(result, fields(input, { id: result.id, title: result.title }));
  Object.assign(result.personalInfo, fields(personal, { name: '', subTitle: '', avatar: '' }));
  if (personal.contacts !== undefined) result.personalInfo.contacts = uniqueIds(list(personal.contacts, item => fields(item, { id: '', label: '', value: '', icon: 'Mail', show: true })));
  const avatar = result.personalInfo.avatar;
  if (avatar && !/^(https?:\/\/|\/(?!\/)|data:image\/(png|jpeg|webp);base64,)/i.test(avatar)) throw new Error('头像地址格式不受支持');
  for (const key of Object.keys(result.sections) as (keyof ResumeData['sections'])[]) {
    if (sections[key] === undefined) continue;
    const section = object(sections[key]);
    const target = result.sections[key]!;
    target.header = fields(section.header ?? {}, target.header);
    const items = section.items ?? [];
    if (key === 'education') result.sections.education.items = uniqueIds(list(items, item => fields(item, { id: '', school: '', majorAndDegree: '', degree: '', is211: false, is985: false, isDoubleFirst: false, timePeriod: '', description: '' })));
    else if (key === 'skills') result.sections.skills.items = uniqueIds(list(items, item => {
      const skill = fields(item, { id: '', content: '', proficiency: '' });
      if (!['', 'basic', 'medium', 'advanced'].includes(skill.proficiency)) throw new Error('技能熟练度无效');
      return skill as ResumeData['sections']['skills']['items'][number];
    }));
    else result.sections[key]!.items = uniqueIds(list(items, item => {
      const project = fields(item, { id: '', name: '', role: '', timePeriod: '', description: '', contributions: '' });
      const techChain = list(object(item).techChain ?? [], tag => { if (typeof tag !== 'string') throw new Error('技术标签必须为文本'); return tag; });
      return { ...project, techChain };
    }));
  }
  const styling = object(input.styling ?? {});
  const { sectionOrder, ...defaults } = result.styling;
  result.styling = fields(styling, defaults);
  const choices = {
    templateId: ['classic', 'minimal'], fontFamily: ['sans', 'serif', 'mono', 'yahei', 'kaiti', 'simsun'],
    fontSize: ['sm', 'base', 'lg'], lineSpacing: ['tight', 'normal', 'relaxed'], avatarShape: ['circle', 'square', 'rounded'],
    sectionSpacing: ['compact', 'normal', 'comfortable'], pagePadding: ['compact', 'normal', 'comfortable'],
  };
  // Retired layouts are migrated without changing resume content.
  if (['elegant', 'sidebar'].includes(result.styling.templateId)) result.styling.templateId = 'classic';
  for (const [key, values] of Object.entries(choices)) {
    const val = result.styling[key as keyof typeof choices];
    if (val !== undefined && !values.includes(val)) throw new Error(`排版选项 ${key} 无效`);
  }
  if (!/^#[\da-f]{6}$/i.test(result.styling.themeColor)) throw new Error('主题色无效');
  if (!Number.isFinite(result.styling.avatarSize) || result.styling.avatarSize < 40 || result.styling.avatarSize > 200) throw new Error('头像尺寸超出范围');
  const order = list(styling.sectionOrder ?? sectionOrder ?? Object.keys(result.sections), item => {
    if (typeof item !== 'string' || !Object.hasOwn(result.sections, item)) throw new Error('模块顺序无效');
    return item;
  });
  result.styling.sectionOrder = [...new Set([...order, ...Object.keys(result.sections)])];
  return result;
}

export function blankResume(): ResumeData {
  const data = freshResume();
  data.id = crypto.randomUUID();
  data.title = '我的简历';
  data.personalInfo = { name: '', subTitle: '', avatar: '', contacts: data.personalInfo.contacts.map(c => ({ ...c, value: '' })) };
  data.styling.showAvatar = false;
  for (const [key, section] of Object.entries(data.sections)) {
    section.items = [];
    section.header.show = !['internships', 'research'].includes(key);
  }
  return data;
}
