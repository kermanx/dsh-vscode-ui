# DSH VS Code UI

把本机 DSH Web 界面适配为 VS Code Classic（Modern UI 关闭）风格。支持浅色、深色和跟随系统主题，沿用 DSH 的字体偏好。

- 左侧 Activity Bar 为 48px，使用 24px Codicons、2px 活动指示线和键盘漫游焦点。搜索位于会话侧栏顶部；新建会话位于会话侧栏标题栏。
- 会话侧栏以 22px Tree View 行展示工作区和会话，分别显示选中、键盘焦点、失焦与悬停状态。方向键只移动焦点，Enter 选中工作区或打开会话；支持 Home/End、Page Up/Down、输入首字母定位、Space 展开文件夹，以及键盘上下文菜单。
- 树采用单选，选中项与当前打开的会话独立：点击工作区名称会选中工作区，展开箭头只改变展开状态；Shift/Ctrl/Meta 点击会话只选择、不打开；Escape 或点击树内空白处清除选择，中央会话继续保留。DSH 重绘、侧栏隐藏或工作区折叠不会把本地选择恢复成旧会话。
- 从树点击或按 Enter 打开会话时保留树焦点，阻止会话输入框的自动聚焦打断树导航；主动点击输入框、按 Tab 或使用快捷键时正常交出焦点。
- 插件、看板、自动化和第三方面板进入各自的侧栏视图。点击活动图标切换内容，再点当前图标收起；重开恢复该视图和调整后的宽度。已访问面板保留挂载，中央会话不会随活动图标切换而卸载。
- 设置、菜单、输入框、按钮、编辑器标签、对话工具调用等采用对应 Classic 组件的尺寸、颜色与状态。
- 会话与详情视图切换采用 PanelTitle 的紧凑文字标签；右侧打开的文件采用 EditorTabs；设置作用域和分段选项分别使用 SettingsEditor、Radio 的样式。会话与轨迹详情支持左右键移动标签焦点、Enter/Space 激活。
- 保留 DSH 原生会话、工作区、插件管理、设置、右侧文件/终端面板和底部扩展功能。

## 开发和全局安装

```sh
npm install
npm run build
dsh plugin --profile web add /absolute/path/to/dsh-vscode-ui
```

本仓库已通过本地链接安装到当前用户的 `~/.dsh/profiles/web`。常规 `dsh web` 启动会应用该插件。变更 bundle patch 或 package manifest 后重启 DSH；仅重新构建客户端后刷新浏览器。因为插件拥有根布局，开发时 DSH 的热卸载可能短暂移除根节点，此时需要手动刷新页面。

```sh
npm test
```

测试涵盖中央会话草稿与面板状态保留、树的焦点/选中分离与卸载恢复、Activity Bar 切换和焦点交接、视图标签导航、主题 token 完整性、侧栏宽度恢复，以及 DSH 导航取消协议。

卸载后重启 DSH 可恢复原布局：

```sh
dsh plugin --profile web remove dsh-vscode-ui
```

## 适配边界

目前针对 DSH `0.2.1-alpha.2` 的 Web slot/service 协议验证。插件通过 bundle patch 取代 `ui-layout` 和 `ui-sidebar`，其余原生功能继续由 DSH 提供。第三方页面的内部业务 UI（包括 iframe）由原插件负责；此插件提供侧栏容器和可用的滚动区域。看板内容仍需要 dshw daemon 正常运行。

`src/layout/` 基于 DSH 的 MIT 布局协议实现，保留主题投影、快捷键、异步导航取消、窗口测量和右侧栏交互。升级 DSH 时应重新核对布局及 slot 协议。样式选择器兼容开发版与发布版的 CSS Modules 类名。

## 参考来源

严格对照 [vscode-ui skill](https://github.com/kermanx/vscode-ui-skill) 的 Classic 实现适配，参考提交：`4378eb0b965339a354d357fcb5ae33d2e10bf20e`。主要参考 ActivityBar、CompositeBar、TreeView、SidebarTitle、WorkbenchLayout、Button、InputBox、Menu、SettingsEditor、EditorTabs 和 Theme。

颜色来自参考中的 Light 2026 / Dark 2026 主题及其继承 token；图标由构建期 Codicon 数据生成。参考代码、样式和资源已适配进本仓库，运行时不依赖 skill 路径或缓存。各派生源文件记录组件来源与改动；适用的 Microsoft、DeepSeek MIT 声明保留在源文件及 LICENSE 中。

建议将 vscode-ui skill 安装到本项目的 `.agents/skills/vscode-ui/`，方便以后继续按相同参考维护。
