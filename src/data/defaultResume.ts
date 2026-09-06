import { ResumeData } from '../types';

export const INITIAL_RESUME_DATA: ResumeData = {
  id: 'demo-resume-v2',
  title: '戈蓬町｜技术简历示例',
  personalInfo: {
    name: '戈蓬町',
    subTitle: '后端开发工程师｜技术简历示例',
    avatar: '/isbutch.png',
    contacts: [
      { id: 'c1', label: '电话', value: '000-0000-0000', icon: 'Phone', show: true },
      { id: 'c2', label: '邮箱', value: 'resume@example.invalid', icon: 'Mail', show: true },
      { id: 'c3', label: '主页', value: 'portfolio.example', icon: 'ExternalLink', show: true },
      { id: 'c4', label: '居住地', value: '上海', icon: 'MapPin', show: true },
    ]
  },
  sections: {
    education: {
      header: { id: 's-edu', title: '教育背景', icon: 'GraduationCap', show: true },
      items: [
        {
          id: 'edu-1',
          school: 'xx大学（示例）',
          majorAndDegree: '软件工程',
          degree: '本科',
          is211: false,
          is985: false,
          isDoubleFirst: false,
          timePeriod: '2019年09月 - 2023年06月',
          description: '★ 学习重点\n• 完成数据库系统、分布式系统与软件工程实践课程，形成从需求梳理到交付复盘的项目方法\n• 以服务稳定性与数据一致性为主题完成课程设计，沉淀接口设计、日志排障与性能分析实践\n\n★ 补充能力\n• 能阅读英文技术文档，使用 Git 进行协作，并将复杂问题拆解为可验证的交付项'
        }
      ]
    },
    skills: {
      header: { id: 's-skills', title: '专业技能', icon: 'Wrench', show: true },
      items: [
        { id: 'sk-1', content: 'Java / Spring Boot：能够完成 RESTful 接口、参数校验、异常治理与分层设计，关注可读性、可测试性和可维护性。' },
        { id: 'sk-2', content: 'MySQL：理解索引、事务隔离与执行计划；能围绕慢查询定位、表结构设计和分页场景进行基础优化。' },
        { id: 'sk-3', content: '缓存与异步：使用 Redis 处理热点数据与幂等控制，使用消息队列拆分耗时任务，并考虑重试、顺序与可观测性。' },
        { id: 'sk-4', content: '工程化：熟悉 Git 分支协作、Maven、Docker 与基础 CI 流程，可通过日志、指标和链路信息辅助问题定位。' },
        { id: 'sk-5', content: '接口与系统设计：能从业务边界、数据模型、权限控制、失败兜底四个维度梳理服务方案，并输出清晰的接口文档。' },
        { id: 'sk-6', content: '协作表达：习惯以“背景—行动—结果”描述工作，主动同步风险与进度，持续复盘可复用的技术方案。' }
      ]
    },
    projects: {
      header: { id: 's-proj', title: '项目经历', icon: 'Briefcase', show: true },
      items: [
        {
          id: 'proj-1',
          name: '企业知识库检索与问答平台（示例项目）',
          role: '后端开发',
          timePeriod: '2023年03月 - 2023年08月',
          techChain: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker'],
          description: '面向内部文档检索与知识沉淀的示例系统，提供资料上传、权限分级、全文检索与问答记录管理能力。',
          contributions: '• 负责文档、目录与成员权限的数据模型及接口设计，梳理角色边界与资源校验规则，降低权限逻辑分散带来的维护成本。\n• 为高频检索条件设计缓存键和失效策略，并通过接口日志记录关键查询参数，便于定位命中率与响应时间问题。\n• 使用 Docker 统一本地运行环境，补齐接口说明与异常返回规范，使前后端联调和新成员上手更顺畅。'
        }
      ]
    },
    internships: {
      header: { id: 's-intern', title: '工作经历', icon: 'Sparkles', show: true },
      items: [
        {
          id: 'intern-1',
          name: '数字化服务团队（示例经历）',
          role: '后端开发实习生',
          timePeriod: '2022年07月 - 2022年12月',
          techChain: ['Spring Boot', 'MySQL', 'Redis', 'Git'],
          description: '参与业务后台的功能迭代与运营支持，协助完善订单查询、状态流转和基础数据管理模块。',
          contributions: '• 在指导下完成订单筛选、状态更新和导出接口，按业务规则补充输入校验、权限判断和可读的错误提示。\n• 协助排查一次查询超时问题：结合执行计划与慢日志定位索引缺失，提交优化建议并完成回归验证。\n• 整理常见问题和发布检查清单，将重复沟通内容沉淀为团队可复用文档。'
        }
      ]
    },
    research: {
      header: { id: 's-research', title: '科研成果与竞赛', icon: 'Award', show: true },
      items: [
        {
          id: 'research-1',
          name: '服务可观测性课程实践（示例成果）',
          role: '方案设计与开发',
          timePeriod: '2022年03月 - 2022年06月',
          techChain: ['Java', 'Prometheus', 'Grafana', 'Docker'],
          description: '围绕服务监控、告警与问题定位设计的课程实践，用于展示从指标采集到故障复盘的完整技术表达。',
          contributions: '• 设计请求量、错误率和响应时间三类核心指标面板，并为异常波动设置分级告警阈值。\n• 编写故障演练记录模板，按“现象—排查—修复—预防”沉淀定位过程，帮助后续问题更快复现与验证。'
        }
      ]
    }
  },
  styling: {
    themeColor: '#111827', // Default to Dark Charcoal Black for professional contrast
    templateId: 'classic',
    fontFamily: 'mono',
    fontSize: 'base',
    lineSpacing: 'normal',
    avatarShape: 'rounded',
    avatarSize: 110,
    sectionSpacing: 'normal',
    pagePadding: 'normal',
    showAvatar: true,
    sectionOrder: ['skills', 'education', 'projects', 'internships', 'research']
  }
};

export const PRESET_THEMES = [
  { name: '极简黑 (默认)', value: '#111827', bgClass: 'bg-slate-900' },
  { name: '绅士蓝 (深邃)', value: '#1e3a8a', bgClass: 'bg-blue-900' },
  { name: '翡翠绿 (清新)', value: '#0d9488', bgClass: 'bg-teal-600' },
  { name: '天空蓝 (活力)', value: '#0284c7', bgClass: 'bg-sky-600' },
  { name: '高级灰 (稳重)', value: '#4b5563', bgClass: 'bg-gray-600' },
  { name: '黛罗兰 (典雅)', value: '#7c3aed', bgClass: 'bg-purple-600' },
  { name: '赤砂红 (热情)', value: '#b91c1c', bgClass: 'bg-red-700' },
];

export const FONTS_LIST = [
  { id: 'mono', name: '霞鹜文楷 (系统推荐)', css: 'font-mono' },
  { id: 'sans', name: '无衬线黑体 (现代)', css: 'font-sans' },
  { id: 'yahei', name: '微软雅黑 (兼容)', css: 'font-sans' },
  { id: 'kaiti', name: '优美楷体 (艺术)', css: 'font-serif font-medium' },
  { id: 'simsun', name: '经典宋体 (传统)', css: 'font-serif' }
];

export const SYSTEM_ICONS = [
  { name: 'Phone', label: '电话' },
  { name: 'Mail', label: '邮箱' },
  { name: 'MapPin', label: '地址/位置' },
  { name: 'ShieldCheck', label: '政治面貌/信赖' },
  { name: 'GraduationCap', label: '学历学校背景' },
  { name: 'FileText', label: '简历/参考成果' },
  { name: 'Briefcase', label: '工作与实习经历' },
  { name: 'Wrench', label: '专业技能亮点' },
  { name: 'Calendar', label: '日期与时间段' },
  { name: 'ExternalLink', label: '网络链接/个人页' },
  { name: 'User', label: '身份基本信息' },
  { name: 'Code', label: '代码系统与高亮' },
  { name: 'Award', label: '科研成就荣誉' },
  { name: 'Sparkles', label: '特异亮点推荐' },
];
