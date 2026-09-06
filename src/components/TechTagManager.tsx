import React, { useState, useRef } from 'react';
import { LucideIcon } from './LucideIcon';

interface TechTagManagerProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  label?: string;
  placeholder?: string;
}

const TECH_DICTIONARY: Record<string, string> = {
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'vue': 'Vue.js',
  'vue.js': 'Vue.js',
  'vuejs': 'Vue.js',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'springboot': 'Spring Boot',
  'spring boot': 'Spring Boot',
  'spring cloud': 'Spring Cloud',
  'springcloud': 'Spring Cloud',
  'spring': 'Spring Framework',
  'mysql': 'MySQL',
  'redis': 'Redis',
  'docker': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'python': 'Python',
  'pytorch': 'PyTorch',
  'tensorflow': 'TensorFlow',
  'java': 'Java',
  'golang': 'Go',
  'go': 'Go',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',
  'nuxt': 'Nuxt.js',
  'nuxtjs': 'Nuxt.js',
  'nuxt.js': 'Nuxt.js',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'git': 'Git',
  'linux': 'Linux',
  'nginx': 'Nginx',
  'kafka': 'Kafka',
  'elasticsearch': 'ElasticSearch',
  'es': 'ElasticSearch',
  'rabbitmq': 'RabbitMQ',
  'mongodb': 'MongoDB',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mybatis': 'MyBatis',
  'mybatis-plus': 'MyBatis-Plus',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express',
  'nest': 'NestJS',
  'nestjs': 'NestJS',
  'vite': 'Vite',
  'webpack': 'Webpack',
  'html': 'HTML5',
  'html5': 'HTML5',
  'css': 'CSS3',
  'css3': 'CSS3',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'flink': 'Flink',
  'spark': 'Spark',
  'hadoop': 'Hadoop',
  'hive': 'Hive',
  'ci/cd': 'CI/CD'
};

export const TechTagManager: React.FC<TechTagManagerProps> = ({
  tags = [],
  onChange,
  label = '技术栈标签',
  placeholder = '输入技术名称（支持逗号/斜杠/空格分割批量添加）'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2000);
  };

  // Batch parsing tags from input string
  const parseAndAddTags = (text: string) => {
    if (!text.trim()) return;
    // Split by comma, Chinese comma, slash, pipe, or new line
    const rawTokens = text.split(/[,，/|\n]+/);
    const newTagsToAdd: string[] = [];

    for (let token of rawTokens) {
      const trimmed = token.trim();
      if (!trimmed) continue;
      // Check duplicate against existing + pending
      const isDuplicate = tags.some(t => t.toLowerCase() === trimmed.toLowerCase()) ||
                          newTagsToAdd.some(t => t.toLowerCase() === trimmed.toLowerCase());
      if (!isDuplicate) {
        newTagsToAdd.push(trimmed);
      }
    }

    if (newTagsToAdd.length > 0) {
      onChange([...tags, ...newTagsToAdd]);
      setInputValue('');
      if (newTagsToAdd.length > 1) {
        showToast(`已批量添加 ${newTagsToAdd.length} 个标签`);
      }
    } else {
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      parseAndAddTags(inputValue);
    }
  };

  // Remove tag
  const handleRemove = (index: number) => {
    const updated = tags.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  // Start inline editing
  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(tags[index]);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 50);
  };

  // Save inline editing
  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    if (!trimmed) {
      // If cleared, remove
      handleRemove(editingIndex);
    } else {
      const updated = [...tags];
      updated[editingIndex] = trimmed;
      onChange(updated);
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  // Reorder tags
  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tags.length) return;
    const updated = [...tags];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const updated = [...tags];
    const [draggedTag] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedTag);
    onChange(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Smart Optimization / Standardization
  const handleSmartOptimize = () => {
    if (tags.length === 0) return;
    const seen = new Set<string>();
    const optimized: string[] = [];

    for (let tag of tags) {
      const lower = tag.trim().toLowerCase();
      // Canonical dictionary lookup or default formatting
      let canonical = TECH_DICTIONARY[lower];
      if (!canonical) {
        // If not found in dictionary, format words nicely
        if (/^[a-z0-9\s-]+$/i.test(tag)) {
          // Words like "react-router" -> "React-Router"
          canonical = tag.split(/([\s-]+)/).map(w => 
            w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w
          ).join('');
        } else {
          canonical = tag.trim();
        }
      }

      const lowerKey = canonical.toLowerCase();
      if (!seen.has(lowerKey)) {
        seen.add(lowerKey);
        optimized.push(canonical);
      }
    }

    onChange(optimized);
    showToast('✨ 已完成标准规范化与自动去重！');
  };

  // Clear All
  const handleClearAll = () => {
    if (tags.length === 0) return;
    onChange([]);
    showToast('已清空所有标签');
  };

  return (
    <div className="space-y-2 text-slate-700">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <LucideIcon name="Tag" size={12} className="text-slate-500" />
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">
            ({tags.length}个标签，双击标签可编辑，支持拖拽/箭头排序)
          </span>
        </label>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSmartOptimize}
            disabled={tags.length === 0}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border transition cursor-pointer ${
              tags.length > 0 
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300' 
                : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
            }`}
            title="一键纠正大小写规范（如 react -> React）、清理多余空格并去重"
          >
            <LucideIcon name="Sparkles" size={11} className="text-amber-500" />
            <span>智能规范</span>
          </button>

          {tags.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
              title="清空全部标签"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* Tags Display Container */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px] flex flex-wrap gap-1.5 items-center relative transition-all">
        {tags.length === 0 ? (
          <span className="text-[11px] text-slate-400 italic px-1 select-none">
            暂无已填技术栈，可在下方输入框批量填写添加
          </span>
        ) : (
          tags.map((tag, index) => {
            const isEditing = editingIndex === index;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            if (isEditing) {
              return (
                <div key={index} className="inline-flex items-center gap-1 bg-white p-0.5 border-2 border-indigo-500 rounded-lg shadow-sm">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={handleSaveEdit}
                    className="px-1.5 py-0.5 text-[11px] font-semibold outline-none w-28 text-slate-800 bg-white"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSaveEdit(); }}
                    className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                    title="保存修改 (Enter)"
                  >
                    <LucideIcon name="Check" size={12} />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onDoubleClick={() => handleStartEdit(index)}
                className={`group relative px-2 py-1 rounded-lg border text-[11px] font-semibold select-none flex items-center gap-1.5 transition-all duration-150 ${
                  isDragging ? 'opacity-40 border-dashed border-indigo-400 bg-indigo-50' : ''
                } ${
                  isDragOver ? 'border-2 border-indigo-500 bg-indigo-50 scale-105' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400 hover:shadow-xs'
                }`}
              >
                {/* Drag handle / reorder indicator */}
                <span className="text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing text-[9px]">
                  ⋮⋮
                </span>

                {/* Tag Content */}
                <span className="cursor-pointer" title="双击进行编辑">{tag}</span>

                {/* Action Buttons on Hover */}
                <div className="flex items-center gap-0.5 ml-0.5 border-l border-slate-200 pl-1 opacity-80 group-hover:opacity-100">
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(index)}
                    className="p-0.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                    title="编辑此标签"
                  >
                    <LucideIcon name="Pencil" size={10} />
                  </button>

                  {/* Left reorder */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'left')}
                      className="p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer hidden group-hover:inline-block"
                      title="左移"
                    >
                      <LucideIcon name="ChevronLeft" size={10} />
                    </button>
                  )}

                  {/* Right reorder */}
                  {index < tags.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'right')}
                      className="p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer hidden group-hover:inline-block"
                      title="右移"
                    >
                      <LucideIcon name="ChevronRight" size={10} />
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-0.5 text-slate-400 hover:text-rose-600 transition cursor-pointer font-bold"
                    title="删除标签"
                  >
                    <LucideIcon name="X" size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Notice toast */}
        {notice && (
          <div className="absolute right-2 top-2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg animate-fade-in pointer-events-none">
            {notice}
          </div>
        )}
      </div>

      {/* Tag Input Field & Add Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="editor-input pr-8"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => parseAndAddTags(inputValue)}
          disabled={!inputValue.trim()}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
            inputValue.trim()
              ? 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-950 shadow-xs'
              : 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <LucideIcon name="Plus" size={12} />
          <span>添加标签</span>
        </button>
      </div>
    </div>
  );
};

export default TechTagManager;
