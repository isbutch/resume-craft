# CraftCV · 简历工坊

[English](README.md) | 简体中文

CraftCV 是一款无需注册的浏览器端简历编辑器，用于编写、预览并导出专业简历。

![CraftCV 主页](docs/assets/homepage.png)

## 核心功能

- 从主页开始制作，也可直接通过 `#/editor` 进入编辑器。
- 分模块编辑个人信息、教育背景、专业技能、工作经历、项目与成果，右侧实时预览 A4 效果。
- 提供经典与极简两种布局，切换时保留已有内容。
- 支持头像上传与裁剪、字体与配色调整，以及通过浏览器打印窗口导出 PDF。
- 支持近期编辑的撤销／重做，以及 JSON 备份导入和导出。

## 数据与隐私

简历数据仅保存在当前浏览器的 `localStorage` 中；项目不提供账号和服务端存储。清理浏览器数据或更换设备前，请先导出 JSON 备份。

内置简历为匿名示例，仅用于展示排版和技术表达方式。加载旧版本内置示例缓存时，会自动迁移为当前匿名示例。

## 本地运行

```bash
npm install
npm run dev
```

打开 Vite 输出的本地地址。构建并预览生产版本：

```bash
npm run build
npm run preview
```

## 验证

```bash
npm run lint
npm test
npm run build
```

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion

## 协议

[MIT](LICENSE)
