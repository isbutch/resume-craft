# Resume Craft

[English](README.md) | [简体中文](README.zh-CN.md)

浏览器端简历编辑器，支持实时预览、多模板与 PDF 导出。数据仅保存在 `localStorage`。

## 功能

- 编辑个人信息、教育、技能、项目与工作经历
- 模板：Classic / Minimal
- 头像上传与技术栈标签
- 打印 / PDF 导出

## 操作流程

主页（`#/`）提供继续编辑、空白创建和模板入口，也可以通过 `#/editor` 直接打开编辑器。切换模板保留已有内容。编辑器支持本次会话内撤销／重做（最多 30 个记录点）、简历命名，以及更多菜单中的 JSON 导入导出、恢复示例和空白创建。

修改自动保存在当前浏览器，保存失败会明确提示。清理浏览器数据或换设备前请导出 JSON 备份。导入限制为 5 MB，并校验数据结构；已停用模板的旧备份兼容转换为经典布局。PDF 导出使用浏览器打印窗口，请选择“另存为 PDF”。页面中的页数为估算值，保存前请核对打印预览。

## 检查

```bash
npm run lint
npm test
npm run build
```

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion

## 使用

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## 协议

[MIT](LICENSE)
