# DSH VS Code UI

为 DeepSeek Harness（DSH）的 Web 界面提供 VS Code Classic（关闭 Modern UI 时的经典界面）风格：用活动栏切换功能，用树形侧栏管理工作区和会话，让对话、文件和终端保持在熟悉的工作台布局里。

> 本项目是独立维护的第三方社区插件，不属于 DeepSeek Harness 或 Visual Studio Code 官方项目。
>
> - 插件的支持与兼容性维护由本项目负责，问题请在本仓库反馈。
> - 插件依赖 DSH 的 Web 布局和扩展接口；升级 DSH 后，可能需要同步更新本插件。

## 主要功能

- 经典工作台：48px 活动栏、Codicons 图标和紧凑的树形侧栏，统一设置、菜单、按钮、输入框、文件标签和工具调用的外观。
- 会话树：按工作区浏览会话，区分选中、焦点和悬停状态；搜索入口位于侧栏顶部，新建会话位于标题栏。
- 独立侧栏视图：插件、看板、自动化和第三方面板通过活动栏切换。收起再展开时恢复当前视图和调整后的宽度。
- 保留工作状态：切换侧栏功能时，中央会话和草稿保持不变，已访问的侧栏面板也保留状态。
- 键盘导航：会话树、活动栏和视图标签支持键盘操作；从树中打开会话后，焦点继续留在树内，方便接着浏览。
- 主题与字体：支持浅色、深色和跟随系统，沿用 DSH 中保存的字体与字号偏好。
- 原生功能：继续使用 DSH 的会话、工作区、插件管理、设置、右侧文件与终端面板，以及底部扩展功能。

## 环境要求

- DSH：适配 `master` 的 Web 布局与服务接口，验证基准为 `353c550cac64c9bcb01a0f1c6f54bf4ea3cdfa94`（2026-10-28）。使用新版侧栏菜单和访问权限接口，旧版 DSH 需要单独确认兼容性。
- 界面：使用 `dsh web` 或其他加载 Web 界面的 profile。纯终端运行不会显示这套界面。
- 构建工具：仅开发和修改源码时需要 Node.js 和 npm；发布版本已包含构建产物。
- 插件安装：`dsh plugin` 通过 pnpm 管理 profile 中的依赖，请确保 DSH 能找到可用的 pnpm。

## 安装

### 从插件市场安装

在 DSH 插件市场选择“VS Code 经典界面”。从 `0.2.1` 起，Git 发布版本直接包含 `dist/`，安装时无需运行构建脚本，也无需添加 pnpm `allowBuilds` 配置。

如果 `0.2.0` 安装时报 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`，请刷新市场索引后安装 `0.2.1` 或更新版本。旧版本依赖安装时构建，会被 pnpm 默认策略拦截。

### 从本地源码安装

将仓库下载到本地后，在仓库根目录执行：

```sh
npm ci
npm run build
dsh plugin --profile web add "$PWD"
```

构建不需要额外的 DSH 源码 checkout。安装完成后，启动或重启对应的 profile：

```sh
dsh web
```

插件只对安装它的 profile 生效；使用其他 profile 时，将命令中的 `web` 替换为对应名称。可通过以下命令查看合成后的配置，确认 `vscode-ui` 已启用：

```sh
dsh --profile web --dump-config
```

### 更新本地安装

更新源码后重新运行 `npm ci` 和 `npm run build`。使用本地目录链接安装时，仅修改客户端代码或样式，构建后刷新浏览器即可；修改 `package.json` 或 `cordis.patch.yml` 后需要重启 DSH。

## 使用方式

### 活动栏与侧栏

- 点击左侧活动图标，切换会话、插件、看板或自动化等视图；再次点击当前图标可收起侧栏。
- 活动栏的“更多”承载 DSH 和第三方插件提供的入口操作。扩展菜单可以打开面板或调整入口固定状态，当前打开的面板始终保留可见入口。
- 拖动侧栏边界调整宽度，收起后重新展开会恢复原宽度。
- 在会话视图顶部搜索会话，或点击标题栏的新建按钮创建会话。
- “新建会话”按钮跟随 DSH 的访问权限；无创建权限时隐藏。
- 切换侧栏视图时，中央会话继续保留，可以一边查看其他功能，一边继续当前对话。

### 会话树

- 点击会话打开它；点击工作区名称选中该工作区，点击展开箭头仅切换展开状态。
- 方向键移动焦点或展开、折叠工作区；按 `Enter` 选中工作区或打开会话，按 `Space` 切换工作区的展开状态。
- `Home` / `End` 跳到首尾，`Page Up` / `Page Down` 按可见区域移动，输入首字母可定位条目。
- 按住 `Shift`、`Ctrl` 或 `Meta` 点击会话时，只改变选中项，不打开会话；树仍为单选。
- 按 `Escape` 或点击树内空白处清除选择，已经打开的中央会话继续保留。

从树中打开会话后，键盘焦点仍留在树内。需要输入消息时，可以点击输入框、按 `Tab` 或使用 DSH 的快捷键切换焦点。

### 视图标签

会话与轨迹详情使用紧凑的文字标签，支持左右方向键移动焦点、`Enter` / `Space` 激活。右侧打开的文件使用编辑器标签样式，文件和终端操作继续沿用 DSH 的原生功能。

## 配置

安装后自动应用界面，无需额外配置。主题、字体和字号在 DSH 原有设置中调整，插件会跟随浅色、深色或系统主题选择。

目前没有独立的插件配置项。活动栏和会话树采用固定的 Classic 布局，侧栏宽度可直接拖动调整。

## 卸载

```sh
dsh plugin --profile web remove dsh-vscode-ui
```

卸载后重启该 profile，并刷新浏览器，即可恢复 DSH 原生布局。

## 适配边界

- 插件通过 bundle patch 替换 `ui-layout` 和 `ui-sidebar`，其余功能继续由 DSH 提供。其他同样替换根布局或侧栏的插件可能与之冲突。
- 第三方页面的内部界面（包括 iframe）由对应插件负责；本插件提供侧栏容器和滚动区域。
- 看板仍依赖正常运行的 dshw daemon，安装界面插件不会代替它启动服务。
- 开发时热重载插件可能短暂移除根布局；遇到空白页面时，重新构建并刷新浏览器。
- 安装或更新后若出现 `renderSlot('root') before any 'root' registration`，先刷新页面；若仍出现，重启对应 profile，检查插件是否加载成功。

## 开发

```sh
npm ci
npm test
npm run build
```

`npm test` 会先构建，再运行测试。测试覆盖会话草稿与面板状态保留、会话树选择与焦点交接、活动栏切换、视图标签导航、主题 token、图标、侧栏宽度恢复和 DSH 导航取消协议。

本地有安装好依赖的 DSH 源码时，可额外运行真实 Cordis、slot renderer 和菜单组件的兼容性测试：

```sh
DSH_SOURCE=../deepseek-harness DSH_REF=origin/master npm test
```

`DSH_REF` 从 Git 读取指定版本的运行时代码，不切换 DSH checkout 或修改暂存区；省略时使用该 checkout 的文件。未设置 `DSH_SOURCE` 时跳过此项集成测试。

Git 发布会包含 `dist/`，修改源码后请运行构建，并把对应产物随源码一起提交。运行 `npm run pack` 可重新构建并生成安装包。不要添加 `prepare` 或 `prepack` 构建钩子，以免 Git 安装再次依赖用户授权构建。

`src/layout/` 基于 DSH 的 MIT 布局实现适配，保留主题同步、快捷键、异步导航取消、窗口测量和右侧栏交互。升级 DSH 时，应重新核对布局与 slot/service 协议。样式选择器同时适配开发版与发布版的 CSS Modules 类名。

## 参考来源

界面参考 [vscode-ui skill](https://github.com/kermanx/vscode-ui-skill) 的 Classic 实现，参考提交为 `4378eb0b965339a354d357fcb5ae33d2e10bf20e`，主要涉及 ActivityBar、CompositeBar、TreeView、SidebarTitle、WorkbenchLayout、Button、InputBox、Menu、SettingsEditor、EditorTabs 和 Theme。

颜色来自参考中的 Light 2026 / Dark 2026 主题及其继承 token，图标由构建期 Codicon 数据生成。参考代码、样式和资源已适配进本仓库，运行时不依赖 skill 路径或缓存；派生源文件保留了组件来源与改动说明。

## 许可

MIT，见 [LICENSE](LICENSE)。源文件与许可文件中保留了适用的 Microsoft 和 DeepSeek 版权声明。
