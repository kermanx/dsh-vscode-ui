window.__ModuleLoader__.load({ id: "dsh-vscode-ui", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.js
var client_exports = {};
__export(client_exports, {
  apply: () => apply2,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);

// src/layout/AppFrame.tsx
var import_react2 = __toESM(require("react"), 1);

// src/layout/columns.ts
var CENTER_MIN = 400;
var SIDEBAR_MIN = 264;
var SIDEBAR_MAX = 420;
var SIDEBAR_DEFAULT = 312;
var SIDEBAR_COLLAPSED = 48;
var SIDEBAR_AUTO_COLLAPSE = 1024;
var RIGHTBAR_MIN = 300;
var RIGHTBAR_MAX_RATIO = 0.7;
var RIGHTBAR_DEFAULT_RATIO = 0.45;
function clampWidth(px, min, max) {
  return Math.min(max, Math.max(min, Math.round(px)));
}
function computeColumns(viewport, sidebar, rightbar, collapsedWidth = SIDEBAR_COLLAPSED) {
  const s = sidebar === 0 ? collapsedWidth : clampWidth(sidebar, SIDEBAR_MIN, SIDEBAR_MAX);
  const available = viewport - s - CENTER_MIN;
  const r = rightbar === 0 || available < RIGHTBAR_MIN ? 0 : Math.min(available, clampWidth(rightbar, RIGHTBAR_MIN, viewport * RIGHTBAR_MAX_RATIO));
  return { sidebar: s, center: Math.max(0, viewport - s - r), rightbar: r };
}

// src/layout/DocumentTitle.tsx
var import_react = require("react");
function DocumentTitle({ useSessions, usePanelInfo, productTitle }) {
  const title = useSessions((state) => {
    const current = Object.values(state.byId).find((session) => (session.retainedBy.mainView ?? 0) > 0)?.id;
    return current === void 0 ? void 0 : state.byId[current]?.title;
  });
  (0, import_react.useEffect)(() => {
    document.title = title === void 0 ? productTitle : `${title} \u2014 ${productTitle}`;
    return () => {
      document.title = productTitle;
    };
  }, [productTitle, title]);
  return null;
}

// src/layout/AppFrame.tsx
var css = Object.fromEntries(["frame", "centerCol", "rightbarCol", "handle", "sidebarCol", "bottomRow", "overlayLayer", "leadingSeat"].map((key) => [key, `vsc-frame-${key}`]));
function CenterColumn(props) {
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: css.centerCol }, props.children);
}
function SidebarColumn({ usePanelInfo, renderSlot, collapsed, width }) {
  const active = usePanelInfo((info) => info.activePanelId);
  const [visited, setVisited] = (0, import_react2.useState)([]);
  (0, import_react2.useEffect)(() => {
    if (active && !visited.includes(active)) setVisited([...visited, active]);
  }, [active, visited]);
  const ids = active && !visited.includes(active) ? [...visited, active] : visited;
  const sidePanels = ids.map((id) => /* @__PURE__ */ import_react2.default.createElement("div", { key: id, className: "vsc-side-panel", "data-side-panel": id, hidden: collapsed || active !== id }, renderSlot("main", {}, { entryKey: id })));
  return renderSlot("sidebar", { collapsed, width, sidePanels });
}
function RightbarColumn(props) {
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: css.rightbarCol, "data-rightbar-col": true }, props.children);
}
function DragHandle(props) {
  const [dragging, setDragging] = (0, import_react2.useState)(false);
  const origin = (0, import_react2.useRef)(0);
  const latest = (0, import_react2.useRef)(0);
  const frame = (0, import_react2.useRef)(null);
  const capture = (0, import_react2.useRef)(null);
  const callbacks = (0, import_react2.useRef)({ onStart: props.onStart, onDrag: props.onDrag, onEnd: props.onEnd });
  callbacks.current = { onStart: props.onStart, onDrag: props.onDrag, onEnd: props.onEnd };
  const endDrag = (0, import_react2.useCallback)(() => {
    const active = capture.current;
    if (active === null) return;
    capture.current = null;
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    if (active.element.hasPointerCapture(active.id)) active.element.releasePointerCapture(active.id);
    setDragging(false);
    callbacks.current.onEnd();
  }, []);
  (0, import_react2.useEffect)(() => endDrag, [endDrag]);
  const onPointerDown = (0, import_react2.useCallback)((e) => {
    if (e.button !== 0 || capture.current !== null) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    capture.current = { element: e.currentTarget, id: e.pointerId };
    origin.current = e.clientX;
    latest.current = e.clientX;
    callbacks.current.onStart();
    setDragging(true);
  }, []);
  const onPointerMove = (0, import_react2.useCallback)((e) => {
    if (capture.current?.id !== e.pointerId) return;
    latest.current = e.clientX;
    frame.current ??= requestAnimationFrame(() => {
      frame.current = null;
      callbacks.current.onDrag(latest.current - origin.current);
    });
  }, []);
  const onPointerUp = (0, import_react2.useCallback)((e) => {
    if (capture.current?.id !== e.pointerId) return;
    callbacks.current.onDrag(e.clientX - origin.current);
    endDrag();
  }, [endDrag]);
  const onPointerCancel = (0, import_react2.useCallback)((e) => {
    if (capture.current?.id === e.pointerId) endDrag();
  }, [endDrag]);
  return /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      className: css.handle,
      style: { left: props.left },
      "data-side": props.side,
      "data-dragging": dragging || void 0,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel
    }
  );
}
function AppFrame({
  useStore,
  useSessions,
  usePanelInfo,
  actions,
  renderSlot,
  t
}) {
  const layoutInfo = useStore((state) => state.layoutInfo);
  const frameRef = (0, import_react2.useRef)(null);
  const viewport = layoutInfo.viewportWidth;
  (0, import_react2.useLayoutEffect)(() => {
    const el = frameRef.current;
    if (el === null) return;
    let raf = null;
    let disposed = false;
    const measure = () => {
      const width = el.getBoundingClientRect().width;
      if (width > 0) actions.setViewportWidth(width);
    };
    measure();
    const observer = new ResizeObserver(() => {
      if (disposed) return;
      raf ??= requestAnimationFrame(() => {
        raf = null;
        measure();
      });
    });
    observer.observe(el);
    return () => {
      disposed = true;
      observer.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [actions]);
  const narrow = viewport < SIDEBAR_AUTO_COLLAPSE;
  const sidebarCollapsed = narrow ? !layoutInfo.narrowExpanded : layoutInfo.sidebar === 0;
  const sidebarPreference = sidebarCollapsed ? 0 : layoutInfo.sidebar === 0 ? SIDEBAR_DEFAULT : layoutInfo.sidebar;
  const rightbarPreference = layoutInfo.rightbar ?? viewport * RIGHTBAR_DEFAULT_RATIO;
  const darwin = document.documentElement.dataset.platform === "darwin";
  const collapsedWidth = SIDEBAR_COLLAPSED;
  const normal = computeColumns(viewport, !layoutInfo.rightbarShown && narrow ? 0 : sidebarPreference, rightbarPreference, collapsedWidth);
  const cols = computeColumns(viewport, sidebarPreference, layoutInfo.rightbarTrack ? rightbarPreference : 0, collapsedWidth);
  const colsRef = (0, import_react2.useRef)(cols);
  colsRef.current = cols;
  const rightbarWidth = (0, import_react2.useRef)(normal.rightbar);
  rightbarWidth.current = normal.rightbar;
  const sidebarBase = (0, import_react2.useRef)(0);
  const rightbarBase = (0, import_react2.useRef)(0);
  const [dragging, setDragging] = (0, import_react2.useState)(false);
  const [animating, setAnimating] = (0, import_react2.useState)(0);
  const trackToggle = `${sidebarCollapsed}:${layoutInfo.rightbarTrack}`;
  const previousToggle = (0, import_react2.useRef)(trackToggle);
  const previousViewport = (0, import_react2.useRef)(viewport);
  (0, import_react2.useLayoutEffect)(() => {
    const viewportChanged = previousViewport.current !== viewport;
    previousViewport.current = viewport;
    if (previousToggle.current === trackToggle) return;
    previousToggle.current = trackToggle;
    if (viewportChanged) return;
    setAnimating((token) => token + 1);
  }, [trackToggle, viewport]);
  (0, import_react2.useEffect)(() => {
    if (animating === 0) return;
    const frame = frameRef.current;
    if (frame === null) return;
    const settle = () => {
      setAnimating(0);
    };
    const onTransitionEnd = (event) => {
      if (event.target === frame && event.propertyName === "grid-template-columns") settle();
    };
    frame.addEventListener("transitionend", onTransitionEnd);
    const timer = setTimeout(settle, 600);
    return () => {
      frame.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(timer);
    };
  }, [animating]);
  const onDragEnd = (0, import_react2.useCallback)(() => {
    setDragging(false);
  }, []);
  const onSidebarStart = (0, import_react2.useCallback)(() => {
    sidebarBase.current = colsRef.current.sidebar;
    setDragging(true);
  }, []);
  const onSidebarDrag = (0, import_react2.useCallback)((dx) => {
    actions.setSidebar(sidebarBase.current + dx);
  }, [actions]);
  const onRightbarStart = (0, import_react2.useCallback)(() => {
    rightbarBase.current = rightbarWidth.current;
    setDragging(true);
  }, []);
  const onRightbarDrag = (0, import_react2.useCallback)((dx) => {
    actions.setRightbar(rightbarBase.current - dx);
  }, [actions]);
  const productTitle = t("brand.localBuild");
  const rightbarMax = cols.rightbar === 0 ? 0 : clampWidth(rightbarPreference, RIGHTBAR_MIN, viewport * RIGHTBAR_MAX_RATIO);
  const sidebar = /* @__PURE__ */ import_react2.default.createElement(SidebarColumn, { usePanelInfo, renderSlot, collapsed: sidebarCollapsed, width: cols.sidebar });
  const main = (0, import_react2.useMemo)(() => renderSlot("main", {}, { entryKey: "conversation" }), [renderSlot]);
  const overlays = (0, import_react2.useMemo)(() => renderSlot("shell.overlay", {}), [renderSlot]);
  const leading = (0, import_react2.useMemo)(() => renderSlot("shell.leading", {}), [renderSlot]);
  const leadingMounted = false;
  return /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      ref: frameRef,
      className: css.frame,
      style: {
        ...document.documentElement.hasAttribute("data-windows-titlebar") ? { "--dsh-windows-sidebar-width": `${cols.sidebar}px` } : {},
        gridTemplateColumns: `${cols.sidebar}px minmax(${cols.rightbar === 0 ? 0 : CENTER_MIN}px, 1fr) minmax(0px, ${rightbarMax}px)`
      },
      "data-sidebar-collapsed": sidebarCollapsed || void 0,
      "data-rightbar-collapsed": cols.rightbar === 0 || void 0,
      "data-rightbar-fullscreen": layoutInfo.rightbarFullscreen || void 0,
      "data-rightbar-instant": layoutInfo.rightbarInstant || void 0,
      "data-dragging": dragging || void 0,
      "data-animating": animating > 0 || void 0
    },
    /* @__PURE__ */ import_react2.default.createElement(
      DocumentTitle,
      {
        productTitle,
        useSessions,
        usePanelInfo
      }
    ),
    /* @__PURE__ */ import_react2.default.createElement("div", { className: css.sidebarCol }, sidebar),
    /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(CenterColumn, null, main), /* @__PURE__ */ import_react2.default.createElement(RightbarColumn, null, renderSlot("rightbar", { width: normal.rightbar, viewportWidth: viewport, canShow: normal.rightbar > 0 }))),
    /* @__PURE__ */ import_react2.default.createElement("div", { className: css.bottomRow, "data-shell-bottom": true }, renderSlot("shell.bottom", {})),
    /* @__PURE__ */ import_react2.default.createElement("div", { className: css.overlayLayer, "data-shell-overlay": true }, overlays),
    leadingMounted && /* @__PURE__ */ import_react2.default.createElement("div", { className: css.leadingSeat, "data-shell-leading": true }, leading),
    !sidebarCollapsed && /* @__PURE__ */ import_react2.default.createElement(DragHandle, { side: "sidebar", left: cols.sidebar, onStart: onSidebarStart, onDrag: onSidebarDrag, onEnd: onDragEnd }),
    layoutInfo.rightbarShown && !layoutInfo.rightbarFullscreen && normal.rightbar > 0 && /* @__PURE__ */ import_react2.default.createElement(DragHandle, { side: "rightbar", left: viewport - normal.rightbar, onStart: onRightbarStart, onDrag: onRightbarDrag, onEnd: onDragEnd })
  );
}

// src/layout/stores.ts
var import_dsh_client_store = require("@deepseek-ai/dsh-client-store");
function createLayoutStore() {
  const handle = (0, import_dsh_client_store.defineStore)({
    init: () => ({
      panelInfo: { activePanelId: null },
      layoutInfo: {
        sidebar: SIDEBAR_DEFAULT,
        sidebarSaved: SIDEBAR_DEFAULT,
        viewportWidth: window.innerWidth,
        narrowExpanded: false,
        rightbar: null,
        rightbarShown: false,
        rightbarTrack: false,
        rightbarFullscreen: false,
        rightbarInstant: false
      }
    }),
    actions: {
      selectPanel: (d, panelId) => {
        d.panelInfo.activePanelId = panelId;
        if (panelId !== null) {
          if (d.layoutInfo.viewportWidth < SIDEBAR_AUTO_COLLAPSE) d.layoutInfo.narrowExpanded = true;
          else if (d.layoutInfo.sidebar === 0) d.layoutInfo.sidebar = d.layoutInfo.sidebarSaved;
        }
      },
      retainMainPanels: (d, panelIds) => {
        if (d.panelInfo.activePanelId !== null && !panelIds.includes(d.panelInfo.activePanelId)) {
          d.panelInfo.activePanelId = null;
        }
      },
      setSidebar: (d, px) => {
        d.layoutInfo.rightbarInstant = false;
        d.layoutInfo.sidebar = d.layoutInfo.sidebarSaved = clampWidth(px, SIDEBAR_MIN, SIDEBAR_MAX);
      },
      // Narrow toggles flip only the override: the width preference survives
      // untouched, so re-widening restores the pre-squeeze layout.
      toggleSidebar: (d) => {
        d.layoutInfo.rightbarInstant = false;
        if (d.layoutInfo.viewportWidth < SIDEBAR_AUTO_COLLAPSE) d.layoutInfo.narrowExpanded = !d.layoutInfo.narrowExpanded;
        else d.layoutInfo.sidebar = d.layoutInfo.sidebar === 0 ? d.layoutInfo.sidebarSaved : 0;
      },
      // Crossing the breakpoint in either direction drops the override: the
      // narrow default is auto-collapsed, the wide state is the preference.
      setViewportWidth: (d, width) => {
        if (d.layoutInfo.viewportWidth === width) return;
        d.layoutInfo.rightbarInstant = false;
        if (d.layoutInfo.viewportWidth < SIDEBAR_AUTO_COLLAPSE !== width < SIDEBAR_AUTO_COLLAPSE) {
          d.layoutInfo.narrowExpanded = false;
        }
        d.layoutInfo.viewportWidth = width;
      },
      setRightbar: (d, px) => {
        d.layoutInfo.rightbarInstant = false;
        d.layoutInfo.rightbar = clampWidth(px, RIGHTBAR_MIN, Math.max(RIGHTBAR_MIN, d.layoutInfo.viewportWidth * RIGHTBAR_MAX_RATIO));
      },
      openRightbar: (d, track, fullscreen) => {
        if (!d.layoutInfo.rightbarShown || d.layoutInfo.rightbarTrack !== track || d.layoutInfo.rightbarFullscreen !== fullscreen) {
          d.layoutInfo.rightbarInstant = d.layoutInfo.rightbarFullscreen && !fullscreen;
        }
        if (!d.layoutInfo.rightbarShown && d.layoutInfo.viewportWidth < SIDEBAR_AUTO_COLLAPSE) d.layoutInfo.narrowExpanded = false;
        d.layoutInfo.rightbar ??= Math.max(RIGHTBAR_MIN, Math.round(d.layoutInfo.viewportWidth * RIGHTBAR_DEFAULT_RATIO));
        d.layoutInfo.rightbarShown = true;
        d.layoutInfo.rightbarTrack = track;
        d.layoutInfo.rightbarFullscreen = fullscreen;
      },
      closeRightbar: (d) => {
        if (d.layoutInfo.rightbarShown) d.layoutInfo.rightbarInstant = d.layoutInfo.rightbarFullscreen;
        d.layoutInfo.rightbarShown = false;
        d.layoutInfo.rightbarTrack = false;
        d.layoutInfo.rightbarFullscreen = false;
      }
    }
  });
  return handle;
}

// src/layout/service.ts
var LayoutController = class {
  /**
   * @param panels - actions of the instance shared with the root entry.
   * @param hasMainPanel - checks the live main-slot registry for a panel id.
   * @param panelInfo - root store's shared central-panel selection source.
   */
  constructor(panels, hasMainPanel, panelInfo) {
    this.panels = panels;
    this.hasMainPanel = hasMainPanel;
    this.panelInfo = panelInfo;
  }
  navigation = new AbortController();
  /** Select a global panel or return to the Conversation. */
  selectPanel(panelId) {
    if (panelId !== null && !this.hasMainPanel(panelId)) {
      throw new Error(`layout.selectPanel: main panel "${panelId}" is not registered`);
    }
    this.navigation.abort();
    this.panels.selectPanel(panelId);
  }
  /** @returns the new pending navigation's cancellation signal. */
  beginNavigation() {
    this.navigation.abort();
    this.navigation = new AbortController();
    return this.navigation.signal;
  }
  /** Invalidate pending navigations when the layout owner is unloaded. */
  dispose() {
    this.navigation.abort();
  }
  /** Toggle the sidebar panel (closed ⟷ contract default width). */
  toggleSidebar() {
    this.panels.toggleSidebar();
  }
  /** Report the right panel's track and fullscreen presentation. */
  openRightbar(track, fullscreen) {
    this.panels.openRightbar(track, fullscreen);
  }
  /** Report the right panel as hidden: no track, no handle. */
  closeRightbar() {
    this.panels.closeRightbar();
  }
};

// src/layout/shortcut-locales.ts
var zh = { toggle: "\u5C55\u5F00\uFF0F\u6536\u8D77\u5DE6\u4FA7\u680F" };
var en = { toggle: "Toggle left sidebar" };

// src/layout/theme-presenter.ts
var DARK_ATTRIBUTE = "data-ds-dark-theme";
var THEME_SOURCE_ATTRIBUTE = "data-ds-theme-source";
var CONTENT_FONT_SIZE_VARIABLE = "--dsh-content-font-size";
var FONT_SIZE_VARIABLES = {
  text: CONTENT_FONT_SIZE_VARIABLE,
  code: "--dsh-code-font-size",
  terminal: "--dsh-terminal-font-size"
};
var FONT_FAMILY_VARIABLES = {
  text: "--dsh-font-family-text",
  code: "--dsh-font-family-code",
  terminal: "--dsh-font-family-terminal"
};
var ThemePresenter = class {
  /** Token names this presenter wrote in the last apply (its retraction set). */
  appliedTokens = [];
  /** The single metadata node this presenter inserts and removes. */
  themeColorMeta;
  /** Create the presenter-owned metadata node before the first snapshot arrives. */
  constructor() {
    this.themeColorMeta = document.createElement("meta");
    this.themeColorMeta.name = "theme-color";
  }
  /**
   * Project a snapshot onto the document: set root `color-scheme` and the body
   * palette attribute from `active.colorScheme` (never the id — `system` is
   * resolved upstream), publish the font sizes and font lists, then replace the
   * previously applied token variables with `active.tokens`. Browser
   * theme-color metadata follows the computed body background after those
   * writes, so the rendered palette remains the color authority.
   * @param snapshot - resolved theme snapshot from ctx.theme.
   */
  apply(snapshot) {
    const scheme = snapshot.active.colorScheme;
    document.documentElement.style.colorScheme = scheme;
    document.documentElement.setAttribute(
      THEME_SOURCE_ATTRIBUTE,
      snapshot.preference === "system" ? "system" : scheme
    );
    const body = document.body;
    if (scheme === "dark") body.setAttribute(DARK_ATTRIBUTE, "");
    else body.removeAttribute(DARK_ATTRIBUTE);
    for (const [role, name] of Object.entries(FONT_SIZE_VARIABLES)) {
      body.style.setProperty(name, `${snapshot.fontSizes[role]}px`);
    }
    for (const [kind, name] of Object.entries(FONT_FAMILY_VARIABLES)) {
      const list = snapshot.fontFamilies[kind];
      if (list === "") body.style.removeProperty(name);
      else body.style.setProperty(name, list);
    }
    for (const name of this.appliedTokens) body.style.removeProperty(name);
    this.appliedTokens = [];
    for (const [name, value] of Object.entries(snapshot.active.tokens)) {
      body.style.setProperty(name, value);
      this.appliedTokens.push(name);
    }
    this.themeColorMeta.content = getComputedStyle(body).backgroundColor;
    if (!this.themeColorMeta.isConnected) document.head.append(this.themeColorMeta);
  }
  /**
   * Retract root color-scheme, the theme-source attribute, the palette
   * attribute, token variables, the font sizes, font lists, and the owned metadata node.
   */
  dispose() {
    document.documentElement.style.removeProperty("color-scheme");
    document.documentElement.removeAttribute(THEME_SOURCE_ATTRIBUTE);
    const body = document.body;
    body.removeAttribute(DARK_ATTRIBUTE);
    for (const name of Object.values(FONT_SIZE_VARIABLES)) body.style.removeProperty(name);
    for (const name of Object.values(FONT_FAMILY_VARIABLES)) body.style.removeProperty(name);
    for (const name of this.appliedTokens) body.style.removeProperty(name);
    this.appliedTokens = [];
    this.themeColorMeta.remove();
  }
};

// src/layout/index.ts
function apply(ctx) {
  ctx.effect(() => ctx.locale.register("shortcuts.layout", { zh, en }), "layout: command labels");
  const t = ctx.locale.bind("shortcuts.layout");
  ctx.effect(() => {
    const handle = createLayoutStore();
    const instance = handle.create();
    const store = { ...handle, create: () => instance };
    const retainMainPanels = () => {
      instance.actions.retainMainPanels(ctx.slots.entries("main").flatMap((entry) => entry.options.key === void 0 ? [] : [entry.options.key]));
    };
    const panelInfo = {
      getSnapshot: () => instance.getSnapshot().panelInfo,
      subscribe: (listener) => instance.subscribe(listener)
    };
    const layout = new LayoutController(instance.actions, (id) => ctx.slots.entries("main").some((entry) => entry.options.key === id), panelInfo);
    const disposePanelInfo = ctx.slots.provideRoot({ hooks: { panelInfo: layout.panelInfo } });
    const disposeService = ctx.reflect.provide("layout", layout);
    const disposeRegistration = ctx.slots.register({
      name: "root",
      locale: "common",
      children: {
        "sidebar": { kind: "single", scope: "root" },
        "main": { kind: "keyed", scope: "root" },
        "rightbar": { kind: "single", scope: "root" },
        "shell.bottom": { kind: "single", scope: "root" },
        "shell.overlay": { kind: "list", scope: "root" },
        "shell.leading": { kind: "single", scope: "root" }
      },
      store
    }, AppFrame);
    const disposeShortcut = ctx.shortcuts.register({
      id: "sidebar.left.toggle",
      label: () => t("toggle"),
      aliases: ["sidebar", "toggle left sidebar"],
      defaults: {
        "desktop:macos": { code: "KeyB", modifiers: ["primary"] },
        "desktop:windows": { code: "KeyB", modifiers: ["primary"] },
        "desktop:linux": { code: "KeyB", modifiers: ["primary"] },
        "web:macos": { code: "KeyB", modifiers: ["primary", "alt"] },
        "web:windows": { code: "KeyB", modifiers: ["primary", "alt"] }
      },
      regions: ["page", "editable"],
      modals: [],
      resolve: () => ({ status: "handled", run: () => {
        layout.toggleSidebar();
      } })
    });
    const disposePanels = ctx.slots.subscribe("main", retainMainPanels);
    retainMainPanels();
    return () => {
      disposeShortcut();
      layout.dispose();
      disposePanels();
      disposeRegistration();
      disposePanelInfo();
      void disposeService();
    };
  }, "ui-layout: service + root registration");
  ctx.effect(() => {
    const presenter = new ThemePresenter();
    presenter.apply(ctx.theme.getTheme());
    const off = ctx.on("theme/change", (snapshot) => {
      presenter.apply(snapshot);
    });
    return () => {
      off();
      presenter.dispose();
    };
  }, "ui-layout: theme presenter");
}

// src/frame.css
var frame_default = "/*\n * UI reference skill: vscode-ui\n * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e\n * Reference components: WorkbenchLayout, SplitView, Sash\n * Adaptation: DSH three-column slot layout, 48px activity rail and persistent side views with delayed sash hover feedback.\n * Copyright (c) Microsoft Corporation. Copyright (c) 2026 DeepSeek. MIT License.\n */\n.vsc-frame-frame { position: relative; display: grid; grid-template-rows: minmax(0, 1fr) auto; height: 100%; overflow: hidden; background: var(--vscode-editor-background); }\n.vsc-frame-sidebarCol { min-width: 0; min-height: 0; overflow: hidden; background: var(--vscode-sideBar-background); border-right: 1px solid var(--vscode-sideBar-border); }\n/* When only the 48px Activity Bar remains, its own border owns the edge. */\n.vsc-frame-frame[data-sidebar-collapsed] .vsc-frame-sidebarCol { border-right: 0; }\n.vsc-frame-centerCol { min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }\n.vsc-frame-rightbarCol { position: relative; min-width: 0; min-height: 0; overflow: visible; }\n.vsc-frame-bottomRow { grid-column: 1 / -1; min-width: 0; min-height: 0; overflow: auto; background: var(--vscode-editor-background); }\n.vsc-frame-overlayLayer { position: absolute; inset: 0; z-index: 20; pointer-events: none; }\n.vsc-frame-overlayLayer > * { pointer-events: auto; }\n.vsc-frame-handle { position: absolute; grid-area: 1 / 1 / 2 / -1; top: 0; bottom: 0; width: 4px; margin-left: -2px; cursor: ew-resize; z-index: 11; touch-action: none; }\nhtml[data-platform='darwin'] .vsc-frame-handle { cursor: col-resize; }\n.vsc-frame-handle::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: transparent; transition: background-color .1s ease-out; }\n.vsc-frame-handle:hover::before { background: var(--vscode-sash-hoverBorder, var(--vscode-focusBorder)); transition-delay: .3s; }\n.vsc-frame-handle[data-dragging]::before { background: var(--vscode-sash-hoverBorder, var(--vscode-focusBorder)); transition-delay: 0s; }\n@media (prefers-reduced-motion: reduce) { .vsc-frame-handle::before { transition-duration: 0s; } }\nhtml[data-windows-titlebar] .vsc-frame-frame { box-sizing: border-box; padding-top: var(--dsh-windows-titlebar-height); }\nhtml[data-windows-titlebar] .vsc-frame-frame::before { content: ''; position: absolute; inset: 0 0 auto; height: var(--dsh-windows-titlebar-height); background: var(--vscode-sideBar-background); -webkit-app-region: drag; }\n";

// src/palettes.js
var palettes_default = {
  "light": {
    "checkbox.border": "#868686",
    "editor.background": "#FFFFFF",
    "editor.foreground": "#202020",
    "editorGroupHeader.connectedTabsBackground": "#EAEAEA",
    "editorGroupHeader.tabsBorder": "#F0F1F2",
    "editor.inactiveSelectionBackground": "#0069CC1A",
    "editorIndentGuide.background1": "#F7F7F740",
    "editorIndentGuide.activeBackground1": "#EEEEEE",
    "editor.selectionHighlightBackground": "#0069CC15",
    "editorSuggestWidget.background": "#FAFAFD",
    "activityBarBadge.background": "#0069CC",
    "browser.border": "#00000000",
    "sideBarTitle.foreground": "#202020",
    "list.hoverBackground": "#00000014",
    "menu.border": "#E4E5E6",
    "input.placeholderForeground": "#999999",
    "searchEditor.textInputBorder": "#CECECE",
    "settings.textInputBorder": "#CECECE",
    "settings.numberInputBorder": "#CECECE",
    "statusBarItem.remoteForeground": "#FFFFFF",
    "statusBarItem.remoteBackground": "#005FB8",
    "statusBar.inactiveBackground": "#FAFAFD",
    "ports.iconRunningProcessForeground": "#369432",
    "sideBarSectionHeader.background": "#FAFAFD",
    "sideBarSectionHeader.border": "#F0F1F2",
    "tab.selectedForeground": "#333333",
    "tab.inactiveForeground": "#606060",
    "tab.selectedBackground": "#E4E6F1",
    "tab.lastPinnedBorder": "#F0F1F2",
    "notebook.cellBorderColor": "#E5E5E5",
    "notebook.selectedCellBackground": "#C8DDF150",
    "statusBarItem.errorBackground": "#C72E0F",
    "list.activeSelectionIconForeground": "#000000",
    "list.focusAndSelectionOutline": "#005FB8",
    "terminal.inactiveSelectionBackground": "#E5EBF1",
    "widget.border": "#E2E2E5",
    "actionBar.toggledBackground": "#dddddd",
    "diffEditor.unchangedRegionBackground": "#f8f8f8",
    "agentsNewSessionButton.border": "#D8D8D8",
    "agentsChatInput.border": "#D8D8D8",
    "agentsPanel.border": "#E4E5E6AA",
    "surface.border": "#E4E5E6",
    "modernActivityBarItem.activeBackground": "#e4e6f1",
    "modernActivityBarItem.hoverBackground": "#F2F2F2",
    "modernActivityBarItem.activeForeground": "#3B3B3B",
    "modernActivityBarItem.hoverForeground": "#3B3B3B",
    "modernActivityBar.border": "#E5E5E5",
    "titleBar.inactiveBackground": "#FAFAFD",
    "activityBar.activeBorder": "#000000",
    "activityBar.background": "#FAFAFD",
    "activityBar.border": "#F0F1F2",
    "activityBar.foreground": "#202020",
    "activityBar.inactiveForeground": "#606060",
    "activityBarBadge.foreground": "#FFFFFF",
    "badge.background": "#0069CC",
    "badge.foreground": "#FFFFFF",
    "button.background": "#0069CC",
    "button.border": "#0069CC",
    "button.foreground": "#FFFFFF",
    "button.hoverBackground": "#0063C1",
    "button.secondaryBackground": "#EAEAEA",
    "button.secondaryForeground": "#202020",
    "button.secondaryHoverBackground": "#F2F3F4",
    "chat.slashCommandBackground": "#ADCEFF7A",
    "chat.slashCommandForeground": "#26569E",
    "chat.editedFileForeground": "#895503",
    "checkbox.background": "#EAEAEA",
    "descriptionForeground": "#606060",
    "dropdown.background": "#FFFFFF",
    "dropdown.border": "#D8D8D8",
    "dropdown.foreground": "#202020",
    "dropdown.listBackground": "#FFFFFF",
    "editorGroup.border": "#E5E5E5",
    "editorGroupHeader.tabsBackground": "#FAFAFD",
    "editorGutter.addedBackground": "#587c0c",
    "editorGutter.deletedBackground": "#ad0707",
    "editorGutter.modifiedBackground": "#005FB8",
    "editorLineNumber.activeForeground": "#202020",
    "editorLineNumber.foreground": "#606060",
    "editorOverviewRuler.border": "#F0F1F2",
    "editorWidget.background": "#FAFAFD",
    "errorForeground": "#ad0707",
    "focusBorder": "#0069CC",
    "foreground": "#202020",
    "icon.foreground": "#606060",
    "input.background": "#FFFFFF",
    "input.border": "#D8D8D866",
    "input.foreground": "#202020",
    "inputOption.activeBackground": "#D6D6D6",
    "inputOption.activeBorder": "#F0F1F2",
    "inputOption.activeForeground": "#202020",
    "keybindingLabel.foreground": "#3B3B3B",
    "list.activeSelectionBackground": "#00000025",
    "list.activeSelectionForeground": "#202020",
    "menu.selectionBackground": "#0069CC1A",
    "menu.selectionForeground": "#202020",
    "notificationCenterHeader.background": "#FAFAFD",
    "notificationCenterHeader.foreground": "#202020",
    "notifications.background": "#FAFAFD",
    "notifications.border": "#F0F1F2",
    "notifications.foreground": "#202020",
    "panel.background": "#FAFAFD",
    "panel.border": "#F0F1F2",
    "panelInput.border": "#E5E5E5",
    "panelTitle.activeBorder": "#000000",
    "panelTitle.activeForeground": "#202020",
    "panelTitle.inactiveForeground": "#606060",
    "peekViewEditor.matchHighlightBackground": "#0069CC33",
    "peekViewResult.background": "#FAFAFD",
    "peekViewResult.matchHighlightBackground": "#0069CC33",
    "pickerGroup.border": "#EEEEF1",
    "pickerGroup.foreground": "#202020",
    "progressBar.background": "#0069CC",
    "quickInput.background": "#FAFAFD",
    "quickInput.foreground": "#202020",
    "settings.dropdownBackground": "#FFFFFF",
    "settings.dropdownBorder": "#CECECE",
    "settings.headerForeground": "#1F1F1F",
    "settings.modifiedItemIndicator": "#BB800966",
    "sideBar.background": "#FAFAFD",
    "sideBar.border": "#F0F1F2",
    "sideBar.foreground": "#202020",
    "sideBarSectionHeader.foreground": "#202020",
    "statusBar.background": "#FAFAFD",
    "statusBar.foreground": "#606060",
    "statusBar.border": "#F0F1F2",
    "statusBarItem.hoverBackground": "#E3E3E5",
    "statusBarItem.hoverForeground": "#000000",
    "statusBarItem.compactHoverBackground": "#CCCCCC",
    "statusBar.debuggingBackground": "#0069CC",
    "statusBar.debuggingForeground": "#FFFFFF",
    "statusBar.focusBorder": "#0069CC",
    "statusBar.noFolderBackground": "#F0F0F3",
    "statusBarItem.focusBorder": "#0069CC",
    "statusBarItem.prominentBackground": "#0069CCDD",
    "tab.activeBackground": "#FFFFFF",
    "tab.activeBorder": "#FFFFFF",
    "tab.activeBorderTop": "#000000",
    "tab.activeForeground": "#202020",
    "tab.selectedBorderTop": "#68a3da",
    "tab.border": "#F0F1F2",
    "tab.hoverBackground": "#FFFFFF",
    "tab.inactiveBackground": "#FAFAFD",
    "tab.unfocusedActiveBorder": "#F8F8F8",
    "tab.unfocusedActiveBorderTop": "#E5E5E5",
    "tab.unfocusedHoverBackground": "#F8F8F8",
    "terminalCursor.foreground": "#202020",
    "terminal.foreground": "#3B3B3B",
    "terminal.tab.activeBorder": "#005FB8",
    "textBlockQuote.background": "#EAEAEA",
    "textBlockQuote.border": "#F0F1F2",
    "textCodeBlock.background": "#EAEAEA",
    "textLink.activeForeground": "#0069CC",
    "textLink.foreground": "#0069CC",
    "textPreformat.foreground": "#606060",
    "textPreformat.background": "#ECECEC",
    "textSeparator.foreground": "#EEEEEE",
    "titleBar.activeBackground": "#FAFAFD",
    "titleBar.activeForeground": "#606060",
    "titleBar.border": "#F0F1F2",
    "titleBar.inactiveForeground": "#606060",
    "welcomePage.tileBackground": "#F3F3F3",
    "disabledForeground": "#BBBBBB",
    "button.secondaryBorder": "#EAEAEA",
    "checkbox.foreground": "#606060",
    "inputValidation.infoBackground": "#E6F2FA",
    "inputValidation.infoBorder": "#0069CC",
    "inputValidation.infoForeground": "#202020",
    "inputValidation.warningBackground": "#FDF6E3",
    "inputValidation.warningBorder": "#B69500",
    "inputValidation.warningForeground": "#202020",
    "inputValidation.errorBackground": "#FDEDED",
    "inputValidation.errorBorder": "#ad0707",
    "inputValidation.errorForeground": "#202020",
    "scrollbar.shadow": "#00000000",
    "widget.shadow": "#00000000",
    "editorStickyScroll.shadow": "#00000000",
    "editorStickyScrollHover.background": "#F0F0F3",
    "editorStickyScroll.border": "#F0F1F2",
    "sideBarStickyScroll.shadow": "#00000000",
    "panelStickyScroll.shadow": "#00000000",
    "listFilterWidget.shadow": "#00000000",
    "scrollbarSlider.background": "#646464C0",
    "scrollbarSlider.hoverBackground": "#646464D0",
    "scrollbarSlider.activeBackground": "#646464E0",
    "list.inactiveSelectionBackground": "#DADADA99",
    "list.inactiveSelectionForeground": "#202020",
    "list.hoverForeground": "#202020",
    "list.dropBackground": "#0069CC15",
    "list.focusBackground": "#00000025",
    "list.focusForeground": "#202020",
    "list.focusOutline": "#0069CC",
    "list.highlightForeground": "#0069CC",
    "list.invalidItemForeground": "#BBBBBB",
    "list.errorForeground": "#ad0707",
    "list.warningForeground": "#667309",
    "activityBar.activeBackground": "#D6D6D6",
    "activityBar.activeFocusBorder": "#0069CC",
    "activityBarTop.activeBorder": "#000000",
    "menubar.selectionBackground": "#EAEAEA",
    "menubar.selectionForeground": "#202020",
    "menu.background": "#FAFAFD",
    "menu.foreground": "#202020",
    "menu.selectionBorder": "#0069CC",
    "menu.separatorBackground": "#EEEEF1",
    "commandCenter.foreground": "#202020",
    "commandCenter.activeForeground": "#202020",
    "commandCenter.background": "#FFFFFF",
    "commandCenter.activeBackground": "#DADADA4f",
    "commandCenter.border": "#D8D8D8AA",
    "editorCursor.foreground": "#202020",
    "editor.selectionBackground": "#0069CC40",
    "editor.wordHighlightBackground": "#0069CC26",
    "editor.wordHighlightStrongBackground": "#0069CC26",
    "editor.findMatchBackground": "#0069CC40",
    "editor.findMatchHighlightBackground": "#0069CC1A",
    "editor.findRangeHighlightBackground": "#00000015",
    "editor.hoverHighlightBackground": "#00000015",
    "editor.lineHighlightBackground": "#EAEAEA40",
    "editor.rangeHighlightBackground": "#00000015",
    "editorLink.activeForeground": "#0069CC",
    "editorWhitespace.foreground": "#60606040",
    "editorRuler.foreground": "#F7F7F7",
    "editorCodeLens.foreground": "#606060",
    "editorBracketMatch.background": "#0069CC40",
    "editorBracketMatch.border": "#F0F1F2",
    "editorWidget.border": "#E4E5E6",
    "editorWidget.foreground": "#202020",
    "editorSuggestWidget.border": "#E4E5E6",
    "editorSuggestWidget.foreground": "#202020",
    "editorSuggestWidget.highlightForeground": "#0069CC",
    "editorSuggestWidget.selectedBackground": "#00000025",
    "editorSuggestWidget.selectedForeground": "#202020",
    "editorSuggestWidget.selectedIconForeground": "#202020",
    "editorSuggestWidget.focusOutline": "#0069CC",
    "editorHoverWidget.background": "#FAFAFD",
    "editorHoverWidget.border": "#E4E5E6",
    "peekView.border": "#0069CC",
    "peekViewEditor.background": "#FAFAFD",
    "peekViewResult.fileForeground": "#202020",
    "peekViewResult.lineForeground": "#606060",
    "peekViewResult.selectionBackground": "#0069CC26",
    "peekViewResult.selectionForeground": "#202020",
    "peekViewTitle.background": "#FAFAFD",
    "peekViewTitleDescription.foreground": "#606060",
    "peekViewTitleLabel.foreground": "#202020",
    "diffEditor.insertedTextBackground": "#587c0c26",
    "diffEditor.removedTextBackground": "#ad070726",
    "editorOverviewRuler.findMatchForeground": "#0069CC99",
    "editorOverviewRuler.modifiedForeground": "#0069CC",
    "editorOverviewRuler.addedForeground": "#587c0c",
    "editorOverviewRuler.deletedForeground": "#ad0707",
    "editorOverviewRuler.errorForeground": "#ad0707",
    "editorOverviewRuler.warningForeground": "#667309",
    "editorGutter.background": "#FFFFFF",
    "panelSection.border": "#E4E5E6",
    "panelSectionHeader.border": "#E4E5E6",
    "statusBar.noFolderForeground": "#606060",
    "statusBarItem.activeBackground": "#EEEEEE",
    "statusBarItem.prominentForeground": "#FFFFFF",
    "statusBarItem.prominentHoverBackground": "#0069CC",
    "toolbar.hoverBackground": "#0000001F",
    "toolbar.activeBackground": "#D6D6D8",
    "tab.hoverForeground": "#202020",
    "tab.unfocusedActiveBackground": "#FAFAFD",
    "tab.unfocusedActiveForeground": "#606060",
    "tab.unfocusedInactiveBackground": "#FAFAFD",
    "tab.unfocusedInactiveForeground": "#BBBBBB",
    "breadcrumb.foreground": "#606060",
    "breadcrumb.background": "#FFFFFF",
    "breadcrumb.focusForeground": "#202020",
    "breadcrumb.activeSelectionForeground": "#202020",
    "breadcrumbPicker.background": "#FAFAFD",
    "notificationCenter.border": "#F0F1F2",
    "notificationToast.border": "#F0F1F2",
    "notificationLink.foreground": "#0069CC",
    "notificationsWarningIcon.foreground": "#B69500",
    "notificationsErrorIcon.foreground": "#ad0707",
    "notificationsInfoIcon.foreground": "#0069CC",
    "problemsWarningIcon.foreground": "#895503",
    "activityWarningBadge.foreground": "#202020",
    "activityWarningBadge.background": "#F2C94C",
    "activityErrorBadge.foreground": "#FFFFFF",
    "activityErrorBadge.background": "#ad0707",
    "extensionButton.prominentBackground": "#0069CC",
    "extensionButton.prominentForeground": "#FFFFFF",
    "extensionButton.prominentHoverBackground": "#0064CC",
    "quickInputList.focusBackground": "#0069CC",
    "quickInputList.focusForeground": "#FFFFFF",
    "quickInputList.focusIconForeground": "#FFFFFF",
    "quickInputList.focusHighlightForeground": "#FFFFFF",
    "terminal.selectionBackground": "#0069CC26",
    "terminalCursor.background": "#FFFFFF",
    "gitDecoration.addedResourceForeground": "#587c0c",
    "gitDecoration.modifiedResourceForeground": "#667309",
    "gitDecoration.deletedResourceForeground": "#ad0707",
    "gitDecoration.untrackedResourceForeground": "#587c0c",
    "gitDecoration.ignoredResourceForeground": "#8E8E90",
    "gitDecoration.conflictingResourceForeground": "#ad0707",
    "gitDecoration.stageModifiedResourceForeground": "#667309",
    "gitDecoration.stageDeletedResourceForeground": "#ad0707",
    "commandCenter.activeBorder": "#D8D8D8",
    "statusBarItem.prominentHoverForeground": "#FFFFFF",
    "quickInputTitle.background": "#FAFAFD",
    "chat.requestBubbleBackground": "#0069CC12",
    "chat.requestBubbleHoverBackground": "#0069CC19",
    "chat.thinkingShimmer": "#999999",
    "chat.inputWorkingBorderColor1": "#0069CC",
    "editorCommentsWidget.rangeBackground": "#EEF4FB",
    "editorCommentsWidget.rangeActiveBackground": "#E6EDFA",
    "charts.foreground": "#202020",
    "charts.lines": "#20202066",
    "charts.blue": "#1A5CFF",
    "charts.red": "#ad0707",
    "charts.yellow": "#667309",
    "charts.orange": "#d18616",
    "charts.green": "#388A34",
    "charts.purple": "#652D90",
    "agentStatusIndicator.background": "#FFFFFF",
    "inlineChat.border": "#00000000",
    "minimapSlider.background": "#646464C0",
    "minimapSlider.hoverBackground": "#646464D0",
    "minimapSlider.activeBackground": "#646464E0",
    "agents.background": "#FAFAFD",
    "agentsPanel.background": "#FFFFFF",
    "agentsPanel.foreground": "#202020",
    "surface.background": "#FFFFFF",
    "surface.foreground": "#202020",
    "agentsGradient.tintColor": "#0069CC",
    "agentsChatInput.background": "#F7F7FA",
    "agentsChatInput.foreground": "#202020",
    "agentsChatInput.focusBorder": "#0069CC",
    "agentsChatInput.placeholderForeground": "#999999",
    "agentsNewSessionButton.background": "#00000000",
    "agentsNewSessionButton.foreground": "#202020",
    "agentsNewSessionButton.hoverBackground": "#00000010",
    "agentsBadge.background": "#0069CC",
    "agentsBadge.foreground": "#FFFFFF",
    "agentsUnreadBadge.background": "#0069CC",
    "agentsUnreadBadge.foreground": "#FFFFFF"
  },
  "dark": {
    "checkbox.border": "#707070",
    "editor.background": "#121314",
    "editor.foreground": "#BBBEBF",
    "editorGroupHeader.connectedTabsBackground": "#202122",
    "editorGroupHeader.tabsBorder": "#2A2B2C",
    "editor.inactiveSelectionBackground": "#27678260",
    "editorIndentGuide.background1": "#8384854D",
    "editorIndentGuide.activeBackground1": "#838485",
    "editor.selectionHighlightBackground": "#27678260",
    "list.dropBackground": "#3994BC1A",
    "activityBarBadge.background": "#307E9F",
    "browser.border": "#00000000",
    "sideBarTitle.foreground": "#bfbfbf",
    "input.placeholderForeground": "#555555",
    "menu.background": "#202122",
    "menu.foreground": "#bfbfbf",
    "menu.separatorBackground": "#2A2B2C",
    "menu.border": "#2A2B2C",
    "menu.selectionBackground": "#3994BC26",
    "statusBarItem.remoteForeground": "#FFFFFF",
    "statusBarItem.remoteBackground": "#0078D4",
    "statusBar.inactiveBackground": "#121314",
    "titleBar.inactiveBackground": "#121314",
    "ports.iconRunningProcessForeground": "#369432",
    "sideBarSectionHeader.background": "#191A1B",
    "sideBarSectionHeader.border": "#2A2B2C",
    "tab.selectedBackground": "#37373D",
    "tab.inactiveForeground": "#8C8C8C",
    "tab.selectedForeground": "#FFFFFF",
    "tab.lastPinnedBorder": "#2A2B2C",
    "list.activeSelectionIconForeground": "#FFF",
    "terminal.inactiveSelectionBackground": "#3A3D41",
    "widget.border": "#2A2B2C",
    "actionBar.toggledBackground": "#383a49",
    "agentsPanel.border": "#2A2B2C",
    "agentsChatInput.border": "#333536",
    "agentsChatInput.focusBorder": "#3994BCB3",
    "agentsNewSessionButton.border": "#333536",
    "surface.border": "#2A2B2C",
    "modernActivityBarItem.activeBackground": "#FFFFFF22",
    "modernActivityBarItem.hoverBackground": "#FFFFFF11",
    "modernActivityBar.border": "#252526",
    "activityBar.activeBorder": "#bfbfbf",
    "activityBar.background": "#191A1B",
    "activityBar.border": "#2A2B2C",
    "activityBar.foreground": "#bfbfbf",
    "activityBar.inactiveForeground": "#8C8C8C",
    "activityBarBadge.foreground": "#FFFFFF",
    "badge.background": "#307E9F",
    "badge.foreground": "#FFFFFF",
    "button.background": "#297AA0",
    "button.border": "#297AA0",
    "button.foreground": "#FFFFFF",
    "button.hoverBackground": "#2B7DA3",
    "button.secondaryBackground": "#00000000",
    "button.secondaryForeground": "#CCCCCC",
    "button.secondaryHoverBackground": "#FFFFFF10",
    "chat.slashCommandBackground": "#26477866",
    "chat.slashCommandForeground": "#85B6FF",
    "chat.editedFileForeground": "#E2C08D",
    "checkbox.background": "#242526",
    "debugToolBar.background": "#181818",
    "descriptionForeground": "#8C8C8C",
    "dropdown.background": "#191A1B",
    "dropdown.border": "#333536",
    "dropdown.foreground": "#bfbfbf",
    "dropdown.listBackground": "#191A1B",
    "editor.findMatchBackground": "#27678290",
    "editorGroup.border": "#FFFFFF17",
    "editorGroupHeader.tabsBackground": "#191A1B",
    "editorGutter.addedBackground": "#72C892",
    "editorGutter.deletedBackground": "#F28772",
    "editorGutter.modifiedBackground": "#0078D4",
    "editorLineNumber.activeForeground": "#BBBEBF",
    "editorLineNumber.foreground": "#858889",
    "editorOverviewRuler.border": "#2A2B2C",
    "editorWidget.background": "#202122",
    "errorForeground": "#f48771",
    "focusBorder": "#3994BCB3",
    "foreground": "#bfbfbf",
    "icon.foreground": "#8C8C8C",
    "input.background": "#191A1B",
    "input.border": "#333536",
    "input.foreground": "#bfbfbf",
    "inputOption.activeBackground": "#313233",
    "inputOption.activeBorder": "#2A2B2C",
    "keybindingLabel.foreground": "#CCCCCC",
    "notificationCenterHeader.background": "#242526",
    "notificationCenterHeader.foreground": "#bfbfbf",
    "notifications.background": "#202122",
    "notifications.border": "#2A2B2C",
    "notifications.foreground": "#bfbfbf",
    "panel.background": "#191A1B",
    "panel.border": "#2A2B2C",
    "panelInput.border": "#2B2B2B",
    "panelTitle.activeBorder": "#3994BC",
    "panelTitle.activeForeground": "#bfbfbf",
    "panelTitle.inactiveForeground": "#8C8C8C",
    "peekViewEditor.background": "#191A1B",
    "peekViewEditor.matchHighlightBackground": "#3994BC33",
    "peekViewResult.background": "#191A1B",
    "peekViewResult.matchHighlightBackground": "#3994BC33",
    "pickerGroup.border": "#2A2B2C",
    "progressBar.background": "#878889",
    "quickInput.background": "#202122",
    "quickInput.foreground": "#bfbfbf",
    "settings.dropdownBackground": "#313131",
    "settings.dropdownBorder": "#3C3C3C",
    "settings.headerForeground": "#FFFFFF",
    "settings.modifiedItemIndicator": "#BB800966",
    "sideBar.background": "#191A1B",
    "sideBar.border": "#2A2B2C",
    "sideBar.foreground": "#bfbfbf",
    "sideBarSectionHeader.foreground": "#bfbfbf",
    "statusBar.background": "#191A1B",
    "statusBar.border": "#2A2B2C",
    "statusBarItem.hoverBackground": "#323233",
    "statusBarItem.hoverForeground": "#FFFFFF",
    "statusBar.debuggingBackground": "#3994BC",
    "statusBar.debuggingForeground": "#FFFFFF",
    "statusBar.focusBorder": "#3994BCB3",
    "statusBar.foreground": "#8C8C8C",
    "statusBar.noFolderBackground": "#191A1B",
    "statusBarItem.focusBorder": "#3994BCB3",
    "statusBarItem.prominentBackground": "#3994BC",
    "tab.activeBackground": "#121314",
    "tab.activeBorder": "#121314",
    "tab.activeBorderTop": "#3994BC",
    "tab.activeForeground": "#bfbfbf",
    "tab.selectedBorderTop": "#6caddf",
    "tab.border": "#2A2B2C",
    "tab.hoverBackground": "#121314",
    "tab.inactiveBackground": "#191A1B",
    "tab.unfocusedActiveBorder": "#1F1F1F",
    "tab.unfocusedActiveBorderTop": "#2B2B2B",
    "tab.unfocusedHoverBackground": "#1F1F1F",
    "terminal.foreground": "#CCCCCC",
    "terminal.tab.activeBorder": "#3994BC00",
    "textBlockQuote.background": "#242526",
    "textBlockQuote.border": "#2A2B2C",
    "textCodeBlock.background": "#242526",
    "textLink.activeForeground": "#53A5CA",
    "textLink.foreground": "#48A0C7",
    "textPreformat.foreground": "#8C8C8C",
    "textPreformat.background": "#262626",
    "textSeparator.foreground": "#2a2a2a",
    "titleBar.activeBackground": "#191A1B",
    "titleBar.activeForeground": "#8C8C8C",
    "titleBar.border": "#2A2B2C",
    "titleBar.inactiveForeground": "#8C8C8C",
    "welcomePage.tileBackground": "#2B2B2B",
    "welcomePage.progress.foreground": "#0078D4",
    "disabledForeground": "#555555",
    "button.secondaryBorder": "#333536",
    "checkbox.foreground": "#8C8C8C",
    "inputOption.activeForeground": "#bfbfbf",
    "inputValidation.infoBackground": "#1E3A47",
    "inputValidation.infoBorder": "#3994BC",
    "inputValidation.infoForeground": "#bfbfbf",
    "inputValidation.warningBackground": "#352A05",
    "inputValidation.warningBorder": "#B89500",
    "inputValidation.warningForeground": "#bfbfbf",
    "inputValidation.errorBackground": "#3A1D1D",
    "inputValidation.errorBorder": "#BE1100",
    "inputValidation.errorForeground": "#bfbfbf",
    "scrollbar.shadow": "#191B1D4D",
    "scrollbarSlider.background": "#A8A9AA85",
    "scrollbarSlider.hoverBackground": "#A8A9AA90",
    "scrollbarSlider.activeBackground": "#A8A9AA9C",
    "list.activeSelectionBackground": "#FFFFFF22",
    "list.activeSelectionForeground": "#ededed",
    "list.inactiveSelectionBackground": "#2C2D2E",
    "list.inactiveSelectionForeground": "#ededed",
    "list.hoverBackground": "#FFFFFF14",
    "list.hoverForeground": "#bfbfbf",
    "toolbar.activeBackground": "#FFFFFF33",
    "list.focusBackground": "#FFFFFF22",
    "list.focusForeground": "#bfbfbf",
    "list.focusOutline": "#3994BCB3",
    "list.highlightForeground": "#48A0C7",
    "list.invalidItemForeground": "#444444",
    "list.errorForeground": "#f48771",
    "list.warningForeground": "#e5ba7d",
    "activityBar.activeBackground": "#313233",
    "activityBar.activeFocusBorder": "#3994BCB3",
    "activityBarTop.activeBorder": "#bfbfbf",
    "menubar.selectionBackground": "#242526",
    "menubar.selectionForeground": "#bfbfbf",
    "menu.selectionForeground": "#bfbfbf",
    "menu.selectionBorder": "#3994BC",
    "commandCenter.foreground": "#bfbfbf",
    "commandCenter.activeForeground": "#bfbfbf",
    "commandCenter.background": "#191A1B",
    "commandCenter.activeBackground": "#FFFFFF0F",
    "commandCenter.border": "#2E3031",
    "editorStickyScroll.background": "#121314",
    "editorStickyScrollHover.background": "#202122",
    "editorStickyScroll.border": "#2A2B2C",
    "editorCursor.foreground": "#BBBEBF",
    "editor.selectionBackground": "#276782dd",
    "editor.wordHighlightBackground": "#27678250",
    "editor.wordHighlightStrongBackground": "#27678280",
    "editor.findMatchHighlightBackground": "#27678280",
    "editor.findRangeHighlightBackground": "#FFFFFF13",
    "editor.hoverHighlightBackground": "#FFFFFF13",
    "editor.lineHighlightBackground": "#242526",
    "editor.rangeHighlightBackground": "#FFFFFF13",
    "editorLink.activeForeground": "#3a94bc",
    "editorWhitespace.foreground": "#8C8C8C4D",
    "editorRuler.foreground": "#848484",
    "editorCodeLens.foreground": "#8C8C8C",
    "editorBracketMatch.background": "#3994BC55",
    "editorBracketMatch.border": "#2A2B2C",
    "editorWidget.border": "#2A2B2C",
    "editorWidget.foreground": "#bfbfbf",
    "editorSuggestWidget.background": "#202122",
    "editorSuggestWidget.border": "#2A2B2C",
    "editorSuggestWidget.foreground": "#bfbfbf",
    "editorSuggestWidget.highlightForeground": "#bfbfbf",
    "editorSuggestWidget.selectedBackground": "#FFFFFF26",
    "editorSuggestWidget.focusOutline": "#3994BCB3",
    "editorHoverWidget.background": "#202122",
    "editorHoverWidget.border": "#2A2B2C",
    "peekView.border": "#2A2B2C",
    "peekViewResult.fileForeground": "#bfbfbf",
    "peekViewResult.lineForeground": "#8C8C8C",
    "peekViewResult.selectionBackground": "#3994BC26",
    "peekViewResult.selectionForeground": "#bfbfbf",
    "peekViewTitle.background": "#242526",
    "peekViewTitleDescription.foreground": "#8C8C8C",
    "peekViewTitleLabel.foreground": "#bfbfbf",
    "editorGutter.background": "#121314",
    "diffEditor.insertedLineBackground": "#347d3926",
    "diffEditor.insertedTextBackground": "#57ab5a4d",
    "diffEditor.removedLineBackground": "#c93c3726",
    "diffEditor.removedTextBackground": "#f470674d",
    "editorOverviewRuler.findMatchForeground": "#3a94bc99",
    "editorOverviewRuler.modifiedForeground": "#6ab890",
    "editorOverviewRuler.addedForeground": "#73c991",
    "editorOverviewRuler.deletedForeground": "#f48771",
    "editorOverviewRuler.errorForeground": "#f48771",
    "editorOverviewRuler.warningForeground": "#e5ba7d",
    "panelSection.border": "#2A2B2C",
    "panelSectionHeader.border": "#2A2B2C",
    "statusBar.noFolderForeground": "#8C8C8C",
    "statusBarItem.activeBackground": "#4B4C4D",
    "statusBarItem.prominentForeground": "#FFFFFF",
    "statusBarItem.prominentHoverBackground": "#3994BC",
    "tab.hoverForeground": "#bfbfbf",
    "tab.unfocusedActiveBackground": "#121314",
    "tab.unfocusedActiveForeground": "#8C8C8C",
    "tab.unfocusedInactiveBackground": "#191A1B",
    "tab.unfocusedInactiveForeground": "#444444",
    "breadcrumb.foreground": "#8C8C8C",
    "breadcrumb.background": "#121314",
    "breadcrumb.focusForeground": "#bfbfbf",
    "breadcrumb.activeSelectionForeground": "#bfbfbf",
    "breadcrumbPicker.background": "#202122",
    "notificationCenter.border": "#2A2B2C",
    "notificationToast.border": "#2A2B2C",
    "notificationLink.foreground": "#3a94bc",
    "notificationsWarningIcon.foreground": "#CCA700",
    "notificationsErrorIcon.foreground": "#f48771",
    "notificationsInfoIcon.foreground": "#3a94bc",
    "activityWarningBadge.foreground": "#202020",
    "activityWarningBadge.background": "#CCA700",
    "activityErrorBadge.foreground": "#FFFFFF",
    "activityErrorBadge.background": "#f48771",
    "extensionButton.prominentBackground": "#297AA0",
    "extensionButton.prominentForeground": "#FFFFFF",
    "extensionButton.prominentHoverBackground": "#2B7DA3",
    "pickerGroup.foreground": "#bfbfbf",
    "quickInputList.focusBackground": "#297AA0",
    "quickInputList.focusForeground": "#FFFFFF",
    "quickInputList.focusIconForeground": "#FFFFFF",
    "quickInputList.focusHighlightForeground": "#FFFFFF",
    "terminal.selectionBackground": "#3994BC33",
    "terminal.background": "#191A1B",
    "terminal.border": "#2A2B2C",
    "terminalCursor.foreground": "#bfbfbf",
    "terminalCursor.background": "#191A1B",
    "gitDecoration.addedResourceForeground": "#73c991",
    "gitDecoration.modifiedResourceForeground": "#e5ba7d",
    "gitDecoration.deletedResourceForeground": "#f48771",
    "gitDecoration.untrackedResourceForeground": "#73c991",
    "gitDecoration.ignoredResourceForeground": "#8C8C8C",
    "gitDecoration.conflictingResourceForeground": "#f48771",
    "gitDecoration.stageModifiedResourceForeground": "#e5ba7d",
    "gitDecoration.stageDeletedResourceForeground": "#f48771",
    "quickInputTitle.background": "#202122",
    "commandCenter.activeBorder": "#333536",
    "chat.requestBubbleBackground": "#ffffff13",
    "chat.requestBubbleHoverBackground": "#ffffff22",
    "chat.inputWorkingBorderColor1": "#297AA0",
    "editorCommentsWidget.rangeBackground": "#488FAE26",
    "editorCommentsWidget.rangeActiveBackground": "#488FAE46",
    "charts.foreground": "#CCCCCC",
    "charts.lines": "#C8CACC80",
    "charts.blue": "#57A3F8",
    "charts.red": "#EF8773",
    "charts.yellow": "#E0B97F",
    "charts.orange": "#CD861A",
    "charts.green": "#86CF86",
    "charts.purple": "#AD80D7",
    "inlineChat.border": "#00000000",
    "minimapSlider.background": "#A8A9AA85",
    "minimapSlider.hoverBackground": "#A8A9AA90",
    "minimapSlider.activeBackground": "#A8A9AA9C",
    "agents.background": "#121314",
    "agentsPanel.background": "#191A1B",
    "agentsPanel.foreground": "#bfbfbf",
    "surface.background": "#191A1B",
    "surface.foreground": "#bfbfbf",
    "agentsGradient.tintColor": "#297AA0",
    "agentsChatInput.background": "#202122",
    "agentsChatInput.foreground": "#bfbfbf",
    "agentsChatInput.placeholderForeground": "#555555",
    "agentsNewSessionButton.background": "#00000000",
    "agentsNewSessionButton.foreground": "#bfbfbf",
    "agentsNewSessionButton.hoverBackground": "#FFFFFF18",
    "agentsBadge.background": "#307E9F",
    "agentsBadge.foreground": "#FFFFFF",
    "agentsUnreadBadge.background": "#307E9F",
    "agentsUnreadBadge.foreground": "#FFFFFF"
  }
};

// src/tokens.js
var roles = {
  "--dsw-alias-bg-base": "editor.background",
  "--dsw-alias-bg-document-preview": "editor.background",
  "--dsw-specific-sidebar-fill": "sideBar.background",
  "--dsw-alias-bg-layer-1": "input.background",
  "--dsw-alias-bg-layer-2": "sideBar.background",
  "--dsw-alias-bg-layer-3": "sideBar.background",
  "--dsw-alias-bg-overlay": "menu.background",
  "--dsw-specific-menu": "menu.background",
  "--dsw-menu-surface-fill": "menu.background",
  "--dsw-alias-menu-group-header-fill": "menu.background",
  "--dsw-specific-input-major": "input.background",
  "--dsw-alias-label-primary": "foreground",
  "--dsw-alias-label-primary-dimmed": "foreground",
  "--dsw-alias-label-primary-bluish": "foreground",
  "--dsw-alias-menu-icon": "icon.foreground",
  "--dsw-alias-label-secondary": "descriptionForeground",
  "--dsw-alias-label-tertiary": "descriptionForeground",
  "--dsw-alias-label-document-preview": "foreground",
  "--dsw-alias-label-dimmed": "disabledForeground",
  "--dsw-alias-label-caption": "descriptionForeground",
  "--dsw-alias-border-l1": "sideBar.border",
  "--dsw-alias-border-l2": "panel.border",
  "--dsw-alias-border-l3": "sideBar.border",
  "--dsw-alias-border-l4": "input.border",
  "--dsw-alias-button-primary-fill": "button.background",
  "--dsw-alias-state-business-primary": "button.background",
  "--dsw-focus-ring-color": "focusBorder",
  "--dsw-alias-button-primary-hover": "button.hoverBackground",
  "--dsw-alias-label-primary-foreground": "button.foreground",
  "--dsw-alias-link": "textLink.foreground",
  "--dsw-alias-interactive-bg-hover": "list.hoverBackground",
  "--dsw-alias-interactive-bg-hover-solid": "list.hoverBackground",
  "--dsw-specific-sidebar-nav-item-hover": "list.hoverBackground",
  "--dsw-alias-interactive-bg-active": "list.activeSelectionBackground",
  "--dsw-specific-sidebar-nav-item-active": "list.activeSelectionBackground",
  "--dsw-alias-button-elevated-fill": "button.secondaryBackground",
  "--dsw-alias-button-floating-fill": "button.secondaryBackground",
  "--dsw-alias-button-tool-bar-fill": "button.secondaryBackground",
  "--dsw-specific-selector": "dropdown.background",
  "--dsw-alias-button-floating-hover": "toolbar.hoverBackground",
  "--dsw-alias-button-tool-bar-hover": "toolbar.hoverBackground",
  "--dsw-alias-markdown-code-block": "textCodeBlock.background",
  "--dsw-alias-markdown-code-block-banner": "sideBar.background",
  "--dsw-specific-bubble": "textCodeBlock.background",
  "--dsw-alias-toast-bg": "notifications.background",
  "--dsw-alias-toast-label": "notifications.foreground",
  "--vsc-list-selection": "list.activeSelectionBackground",
  "--vsc-list-selection-foreground": "list.activeSelectionForeground",
  "--vsc-list-inactive-selection": "list.inactiveSelectionBackground",
  "--vsc-tree-guide": "tree.indentGuidesStroke",
  "--vsc-tree-inactive-guide": "tree.inactiveIndentGuidesStroke",
  "--vsc-tab-inactive-background": "tab.inactiveBackground",
  "--vsc-tab-inactive-foreground": "tab.inactiveForeground",
  "--vsc-terminal-background": "terminal.background",
  "--vsc-terminal-foreground": "terminal.foreground"
};
var defaults = {
  "tree.indentGuidesStroke": { light: "#a9a9a9", dark: "#585858" },
  "tree.inactiveIndentGuidesStroke": { light: "#a9a9a966", dark: "#58585866" },
  "toolbar.hoverBackground": { light: "#b8b8b850", dark: "#5a5d5e50" },
  "sash.hoverBorder": { light: "#0090f1", dark: "#007fd4" },
  "terminal.background": { light: palettes_default.light["editor.background"], dark: palettes_default.dark["editor.background"] },
  "radio.activeForeground": { light: "#000000", dark: "#ffffff" },
  "radio.activeBackground": { light: "rgba(0, 144, 241, 0.2)", dark: "rgba(0, 127, 212, 0.4)" },
  "radio.activeBorder": { light: "#007acc", dark: "#007acc" },
  "radio.inactiveBorder": { light: "rgba(0, 0, 0, 0.2)", dark: "rgba(255, 255, 255, 0.2)" },
  "radio.inactiveHoverBackground": { light: "rgba(184, 184, 184, 0.31)", dark: "rgba(90, 93, 94, 0.5)" },
  "editorHoverWidget.foreground": { light: "#616161", dark: "#cccccc" },
  "settings.textInputBackground": { light: "#ffffff", dark: "#3c3c3c" },
  "settings.textInputForeground": { light: "#616161", dark: "#cccccc" },
  "settings.numberInputBackground": { light: "#ffffff", dark: "#3c3c3c" },
  "settings.numberInputForeground": { light: "#616161", dark: "#cccccc" },
  "settings.dropdownForeground": { light: "#616161", dark: "#f0f0f0" },
  "settings.headerBorder": { light: "rgba(128, 128, 128, 0.35)", dark: "rgba(128, 128, 128, 0.35)" },
  "settings.settingsHeaderHoverForeground": { light: "rgba(68, 68, 68, 0.7)", dark: "rgba(231, 231, 231, 0.7)" }
};
var geometry = { "cornerRadius.medium": "6px" };
function pair(role, fallback = "transparent") {
  return Object.fromEntries(["light", "dark"].map((mode) => [mode, palettes_default[mode][role] ?? defaults[role]?.[mode] ?? fallback]));
}
var classicTokens = Object.fromEntries([
  ...Object.entries(roles).map(([token, role]) => [token, pair(role)]),
  ...[.../* @__PURE__ */ new Set([...Object.keys(palettes_default.light), ...Object.keys(palettes_default.dark), ...Object.keys(defaults)])].map((role) => [`--vscode-${role.replaceAll(".", "-")}`, pair(role, "initial")]),
  ...Object.entries(geometry).map(([role, value]) => [`--vscode-${role.replaceAll(".", "-")}`, { light: value, dark: value }]),
  ["--dsw-corner-shape", { light: "round", dark: "round" }],
  ["--dsw-focus-ring-width", { light: "1px", dark: "1px" }],
  ["--dsw-menu-backdrop-filter", { light: "none", dark: "none" }]
]);

// src/classic.css
var classic_default = `/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: Button, InputBox, Radio, Switch, Menu, Hover, Dialog, SettingsEditor, Toolbar, WorkbenchLayout, PanelTitle
 * Adaptation: DSH native controls retain their events and accessibility semantics while adopting Classic geometry, state colors and focus treatment.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
/* Slot and data attributes are the public DSH styling anchors. Primitive
   selectors below support _local_hash, hash_local, and prefix_module_local_hash names. */
body {
  font-size: 13px;
  line-height: 1.4;
}

/* The existing layout still owns width, collapse, and native caption clearance. */
body [data-slot='root'] > div {
  border-radius: 0;
}

body [data-slot='root'] div:has(> [data-slot='sidebar']),
html[data-platform] body [data-slot='root'] div:has(> [data-slot='sidebar']) {
  background: var(--dsw-specific-sidebar-fill);
  border-right: 1px solid var(--dsw-alias-border-l3);
}

body [data-slot='sidebar'] > div {
  background: var(--dsw-specific-sidebar-fill);
  font-size: 13px;
}

body [data-slot='root'] div:has(> [data-slot='main']),
html[data-platform] body [data-slot='root'] div:has(> [data-slot='main']) {
  background: var(--dsw-alias-bg-base);
  border-radius: 0;
  border-left: 0;
}

/* Only the shared text Button primitive has both button and size classes. */
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is(:is([class*="_md_"], [class$="_md"], [class*="_md "]), :is([class*="_sm_"], [class$="_sm"], [class*="_sm "])) {
  box-sizing: border-box;
  height: 26px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 16px;
}

body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is([class*="_sm_"], [class$="_sm"], [class*="_sm "]) {
  height: 22px;
  padding: 3px 6px;
  font-size: 11px;
  line-height: 14px;
}

body span:has(> input:is([class*="_input_"], [class$="_input"], [class*="_input "])) {
  box-sizing: border-box;
  height: 26px;
  padding: 4px 6px;
  border: 1px solid var(--vscode-input-border, transparent);
  border-radius: 4px;
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
}

body span > input:is([class*="_input_"], [class$="_input"], [class*="_input "]) {
  font-size: 13px;
  line-height: 16px;
  color: inherit;
}

body span > input:is([class*="_input_"], [class$="_input"], [class*="_input "])::placeholder { color: var(--vscode-input-placeholderForeground); opacity: 1; }

body span:has(> input:is([class*="_input_"], [class$="_input"], [class*="_input "])):focus-within {
  border-color: var(--vscode-input-border, transparent);
  outline: 1px solid var(--vscode-focusBorder);
  outline-offset: -1px;
}
body span:has(> input:is([class*="_input_"], [class$="_input"], [class*="_input "])[aria-invalid='true']) { border-color: var(--vscode-inputValidation-errorBorder); }
body span:has(> input:is([class*="_input_"], [class$="_input"], [class*="_input "])[aria-invalid='true']):focus-within { outline-color: var(--vscode-inputValidation-errorBorder); }

body input:not([type='checkbox'], [type='radio'], [type='range'], [type='color'], [type='file']),
body textarea {
  border-radius: 4px;
}

/* Menus and dialogs retain their own positioning, portals, and dismissal. */
body :is([data-menu-material], [data-menu-backing]) {
  border-radius: 8px;
}

body [data-menu-material] {
  border: 1px solid var(--vscode-menu-border, var(--vscode-editorWidget-border, transparent));
  color: var(--vscode-menu-foreground);
  box-shadow: 0 0 12px rgb(0 0 0 / 14%);
}

body [role='dialog'] {
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--dsw-alias-border-l3), 0 0 20px rgb(0 0 0 / 15%);
}

body [data-composer-card] {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--dsw-alias-border-l4);
}

body [data-composer-card]::after {
  border-radius: inherit;
}

@media (forced-colors: active) {
  body :is([data-composer-card], [data-menu-material], [role='dialog']) {
    outline: 1px solid CanvasText;
  }
}

/* Settings retains its modal navigation and becomes a flat TOC beside forms. */
body [data-shortcut-modal='settings'] { background: var(--dsw-alias-bg-base); }
body [data-shortcut-modal='settings'] :is([class*="_nav_"], [class$="_nav"], [class*="_nav "]) {
  width: 172px; padding: 12px 0; gap: 12px;
  background: var(--vscode-editor-background);
  border-right: 1px solid var(--dsw-alias-border-l3);
}
body [data-shortcut-modal='settings'] :is([class*="_navTitle_"], [class$="_navTitle"], [class*="_navTitle "]) { font-size: 13px; font-weight: 600; }
body [data-shortcut-modal='settings'] :is([class*="_navList_"], [class$="_navList"], [class*="_navList "]) { gap: 0; }
body [data-shortcut-modal='settings'] :is([class*="_navCell_"], [class$="_navCell"], [class*="_navCell "]) {
  height: 26px; flex-shrink: 0; padding: 0 12px;
  border-radius: 0; font-size: 13px; line-height: 26px;
  background: transparent; color: var(--vscode-foreground);
}
body [data-shortcut-modal='settings'] :is([class*="_navCell_"], [class$="_navCell"], [class*="_navCell "]):hover { color: var(--vscode-settings-settingsHeaderHoverForeground, var(--vscode-foreground)); background: transparent; }
body [data-shortcut-modal='settings'] :is([class*="_navCell_"], [class$="_navCell"], [class*="_navCell "])[aria-current] { color: var(--vscode-settings-headerForeground); background: transparent; font-weight: 600; }
body [data-shortcut-modal='settings'] :is([class*="_navCell_"], [class$="_navCell"], [class*="_navCell "]):focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
body [data-shortcut-modal='settings'] :is([class*="_navIcon_"], [class$="_navIcon"], [class*="_navIcon "]) { width: 16px; height: 16px; }
body [data-shortcut-modal='settings'] :is([class*="_header_"], [class$="_header"], [class*="_header "]) { height: 38px; padding: 8px; }
body [data-shortcut-modal='settings'] :is([class*="_close_"], [class$="_close"], [class*="_close "]) { width: 22px; height: 22px; border-radius: 6px; color: var(--vscode-icon-foreground); }
body [data-shortcut-modal='settings'] :is([class*="_close_"], [class$="_close"], [class*="_close "]):hover { background: var(--vscode-toolbar-hoverBackground); }
body [data-shortcut-modal='settings'] :is([class*="_close_"], [class$="_close"], [class*="_close "]):focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
body [data-shortcut-modal='settings'] :is([class*="_options_"], [class$="_options"], [class*="_options "]) { padding: 0 20px 20px; }
body [data-shortcut-modal='settings'] :is([class*="_title_"], [class$="_title"], [class*="_title "]) { font-size: 13px; font-weight: 400; color: var(--vscode-settings-headerForeground); }
body [data-shortcut-modal='settings'] :is([class*="_rowText_"], [class$="_rowText"], [class*="_rowText "]) { padding-right: 16px; gap: 2px; }
body [data-shortcut-modal='settings'] :is([class*="_cubeRow_"], [class$="_cubeRow"], [class*="_cubeRow "]) { gap: 0; flex-wrap: nowrap; }
body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]) {
  flex: 0 1 auto; flex-direction: row; gap: 6px;
  padding: 4px 10px; min-height: 26px;
  border: 1px solid var(--vscode-radio-inactiveBorder, transparent); border-radius: 0;
  font-size: 12px; line-height: 16px;
  color: var(--vscode-radio-inactiveForeground, var(--vscode-foreground));
  background: var(--vscode-radio-inactiveBackground, transparent);
}
body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]) + :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]) { margin-left: -1px; }
body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]):first-child { border-radius: 3px 0 0 3px; }
body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]):last-child { border-radius: 0 3px 3px 0; }
body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]) svg { width: 16px; height: 16px; }
body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]):hover:not([aria-pressed='true']) { background: var(--vscode-radio-inactiveHoverBackground); }
body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "])[aria-pressed='true'] {
  color: var(--vscode-radio-activeForeground); background: var(--vscode-radio-activeBackground);
  border-color: var(--vscode-radio-activeBorder, transparent); z-index: 1;
}
body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]):focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; z-index: 2; }
body [data-shortcut-modal='settings'] :is([class*="_stepper_"], [class$="_stepper"], [class*="_stepper "]) {
  box-sizing: border-box; height: 26px; border-radius: 4px;
  color: var(--vscode-settings-numberInputForeground, var(--vscode-input-foreground));
  background: var(--vscode-settings-numberInputBackground, var(--vscode-input-background));
  border: 1px solid var(--vscode-settings-numberInputBorder, var(--vscode-input-border, transparent));
}
body [data-shortcut-modal='settings'] :is([class*="_stepper_"], [class$="_stepper"], [class*="_stepper "]):focus-within { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
body [data-shortcut-modal='settings'] :is([class*="_stepper_"], [class$="_stepper"], [class*="_stepper "]) :is([class*="_value_"], [class$="_value"], [class*="_value "]) { color: inherit; }
body [data-shortcut-modal='settings'] :is([class*="_stepper_"], [class$="_stepper"], [class*="_stepper "]) :is([class*="_arrows_"], [class$="_arrows"], [class*="_arrows "]) { gap: 0; right: 4px; }
body [data-shortcut-modal='settings'] :is([class*="_stepper_"], [class$="_stepper"], [class*="_stepper "]) :is([class*="_arrow_"], [class$="_arrow"], [class*="_arrow "]) { height: 11px; border-radius: 0; }
body [data-shortcut-modal='settings'] :is(:is([class*="_value_"], [class$="_value"], [class*="_value "]), :is([class*="_unit_"], [class$="_unit"], [class*="_unit "])) { font-size: 13px; }
body [data-shortcut-modal='settings'] button[aria-haspopup='menu'] {
  min-height: 26px; height: auto; padding-block: 3px; border-radius: 4px; font-size: 13px;
}
body [data-shortcut-modal='settings'] :is([class*="_selector_"], [class$="_selector"], [class*="_selector "])[aria-haspopup='menu'] {
  border: 1px solid var(--vscode-settings-dropdownBorder, var(--vscode-dropdown-border, transparent));
  color: var(--vscode-settings-dropdownForeground, var(--vscode-dropdown-foreground));
  background: var(--vscode-settings-dropdownBackground, var(--vscode-dropdown-background));
}
body [data-shortcut-modal='settings'] :is([class*="_selector_"], [class$="_selector"], [class*="_selector "])[aria-haspopup='menu']:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
body [data-shortcut-modal='settings'] span:has(> input:is([class*="_input_"], [class$="_input"], [class*="_input "])) {
  --vscode-input-background: var(--vscode-settings-textInputBackground);
  --vscode-input-foreground: var(--vscode-settings-textInputForeground);
  border-color: var(--vscode-settings-textInputBorder, var(--vscode-input-border, transparent));
}
body [data-shortcut-modal='settings'] span:has(> input:is([class*="_input_"], [class$="_input"], [class*="_input "])[aria-invalid='true']) { border-color: var(--vscode-inputValidation-errorBorder); }

/* Menus, choices, hovers and buttons use their own Classic dimensions. */
body [data-menu-material] :is([role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox']) {
  box-sizing: border-box; min-height: 24px; padding: 2px 8px; border-radius: 6px;
  font-family: var(--dsw-font-family); font-size: 13px; line-height: 20px;
  color: var(--vscode-menu-foreground);
}
body [data-menu-material] :is([role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox']):is([class*="_danger_"], [class$="_danger"], [class*="_danger "]) { color: var(--vscode-errorForeground); }
body [data-menu-material] :is([role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox']):is(:hover, :focus-visible):not(:disabled):not([aria-disabled='true']) {
  color: var(--vscode-list-hoverForeground, var(--vscode-menu-foreground)); background: var(--vscode-list-hoverBackground);
}
body [data-menu-material] :is([role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox']):focus-visible:not(:disabled):not([aria-disabled='true']) {
  outline: 1px solid var(--vscode-menu-selectionBorder, transparent); outline-offset: -1px;
}
body [data-menu-material] :is([role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox']):is(:disabled, [aria-disabled='true']) {
  color: var(--vscode-disabledForeground); background: transparent; opacity: 1; cursor: default;
}
body [data-menu-material] :is([class*="_itemIcon_"], [class$="_itemIcon"], [class*="_itemIcon "]), body [data-menu-material] :is([class*="_itemIcon_"], [class$="_itemIcon"], [class*="_itemIcon "]) svg { width: 16px; height: 16px; color: inherit; }
body [data-menu-material] :is([class*="_check_"], [class$="_check"], [class*="_check "]) { color: inherit; }
body [data-menu-material] :is([class*="_shortcutKeys_"], [class$="_shortcutKeys"], [class*="_shortcutKeys "]) { color: inherit; opacity: .7; }
body [data-menu-material] :is([class*="_item_"], [class$="_item"], [class*="_item "]):is(:hover, :focus-visible) :is([class*="_shortcutKeys_"], [class$="_shortcutKeys"], [class*="_shortcutKeys "]) { opacity: 1; }
body [data-menu-material] [role='separator'] { height: 1px; margin: 5px 0; background: var(--vscode-menu-separatorBackground); }
body [data-menu-material] :is([class*="_footer_"], [class$="_footer"], [class*="_footer "]) { border-top: 1px solid var(--vscode-menu-separatorBackground); }
body [role='tooltip'] {
  box-sizing: border-box; padding: 4px 8px; border-radius: 5px; background: var(--vscode-editorHoverWidget-background);
  color: var(--vscode-editorHoverWidget-foreground, var(--vscode-foreground)); border: 1px solid var(--vscode-editorHoverWidget-border);
  font: 13px/19px var(--dsw-font-family);
  box-shadow: 0 0 12px rgb(0 0 0 / 14%);
}
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is(:is([class*="_md_"], [class$="_md"], [class*="_md "]), :is([class*="_sm_"], [class$="_sm"], [class*="_sm "])) { border: 1px solid var(--vscode-button-border, transparent); font-family: var(--dsw-font-family); }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is([class*="_primary_"], [class$="_primary"], [class*="_primary "]) { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is([class*="_primary_"], [class$="_primary"], [class*="_primary "]):is(:hover, :focus-visible):not(:disabled) { background: var(--vscode-button-hoverBackground); }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is([class*="_outline_"], [class$="_outline"], [class*="_outline "]) { border-color: var(--vscode-button-secondaryBorder, var(--vscode-button-border, transparent)); color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is([class*="_outline_"], [class$="_outline"], [class*="_outline "]):is(:hover, :focus-visible):not(:disabled) { background: var(--vscode-button-secondaryHoverBackground); }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is(:is([class*="_ghost_"], [class$="_ghost"], [class*="_ghost "]), :is([class*="_toolbar_"], [class$="_toolbar"], [class*="_toolbar "])) { color: var(--vscode-foreground); background: transparent; border-color: transparent; }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is(:is([class*="_ghost_"], [class$="_ghost"], [class*="_ghost "]), :is([class*="_toolbar_"], [class$="_toolbar"], [class*="_toolbar "])):is(:hover, :focus-visible):not(:disabled) { background: var(--vscode-toolbar-hoverBackground); }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):is(:is([class*="_ghost_"], [class$="_ghost"], [class*="_ghost "]), :is([class*="_toolbar_"], [class$="_toolbar"], [class*="_toolbar "])):active:not(:disabled) { background: var(--vscode-toolbar-activeBackground); }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):disabled { opacity: .4; cursor: default; }
body button:is([class*="_button_"], [class$="_button"], [class*="_button "]):focus-visible { outline: 1px solid var(--dsw-focus-ring-color); outline-offset: 2px; }

/* The composer is a multiline editing field with an attached command row. */
/* Session title and view navigation each occupy a 35px workbench row. */
body [data-slot='conversation.header'] > header:has([data-conversation-tabs]) {
  min-height: 71px;
  grid-template-rows: 35px 35px;
  padding-top: 0;
  border-bottom-width: 1px;
}
body [data-slot='conversation.header'] > header:has([data-conversation-tabs]) > :is([class*="_titleRow_"], [class$="_titleRow"], [class*="_titleRow "]) {
  min-height: 35px;
}
body [data-composer-card] {
  border: 1px solid var(--dsw-alias-border-l4); box-shadow: none;
  padding-top: 6px; gap: 6px;
}
body [data-composer-card]:focus-within { border-color: var(--dsw-focus-ring-color); }
body [data-composer-card]:is([class*="_cardWorkspaceTrigger_"], [class$="_cardWorkspaceTrigger"], [class*="_cardWorkspaceTrigger "]) { border-color: transparent; }
body [data-composer-card] :is([class*="_input_"], [class$="_input"], [class*="_input "]) { padding-left: 10px; min-height: 44px; }
body [data-composer-card] :is([class*="_placeholder_"], [class$="_placeholder"], [class*="_placeholder "]) { left: 10px; }
body [data-composer-card] :is([class*="_row_"], [class$="_row"], [class*="_row "]) { padding: 4px 6px; gap: 6px; }
body [data-composer-card] :is(:is([class*="_tools_"], [class$="_tools"], [class*="_tools "]), :is([class*="_modes_"], [class$="_modes"], [class*="_modes "]), :is([class*="_trailing_"], [class$="_trailing"], [class*="_trailing "]), :is([class*="_standardControls_"], [class$="_standardControls"], [class*="_standardControls "])) { gap: 6px; }
body [data-composer-card] :is([class*="_add_"], [class$="_add"], [class*="_add "]) {
  box-sizing: border-box; width: 22px; height: 22px; padding: 3px;
  border-radius: 6px; background: transparent;
}
body [data-composer-card] :is([class*="_primary_"], [class$="_primary"], [class*="_primary "]) {
  box-sizing: border-box; width: 26px; height: 26px; padding: 5px; border-radius: 4px; transform: none;
  background: var(--dsw-alias-button-primary-fill);
}
body [data-composer-card] :is([class*="_primary_"], [class$="_primary"], [class*="_primary "]):hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover); }
body [data-composer-card] :is([class*="_primary_"], [class$="_primary"], [class*="_primary "]) svg { width: 16px; height: 16px; }
body [data-composer-card] :is([class*="_row_"], [class$="_row"], [class*="_row "]) button:is([aria-haspopup], :is([class*="_trigger_"], [class$="_trigger"], [class*="_trigger "])) {
  box-sizing: border-box; height: 22px; min-height: 22px; padding: 0 6px;
  border-radius: 4px; font: 13px/18px var(--dsw-font-family);
}
body [data-composer-card] :is([class*="_row_"], [class$="_row"], [class*="_row "]) :is([class*="_add_"], [class$="_add"], [class*="_add "])[aria-haspopup] { padding: 3px; }
body [data-composer-card] [data-slot='conversation.input.activity'] button:is([class*="_trigger_"], [class$="_trigger"], [class*="_trigger "]) {
  width: 22px; padding: 3px; border: 0;
}
body [data-composer-card] :is([class*="_row_"], [class$="_row"], [class*="_row "]) button:is([aria-haspopup], :is([class*="_trigger_"], [class$="_trigger"], [class*="_trigger "])):not(:is([class*="_add_"], [class$="_add"], [class*="_add "])) svg { flex-shrink: 0; width: 12px; height: 12px; }
body [data-composer-card] :is([class*="_row_"], [class$="_row"], [class*="_row "]) button:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color); outline-offset: -1px;
}
body [data-phase='hero'] [data-slot='conversation.session.header.corner'] button {
  width: 22px; height: 22px; padding: 3px; border: 0; border-radius: 6px;
}
html:not([data-platform='darwin']):not([data-windows-titlebar]) body [data-phase='hero'] [data-slot='conversation.header'] > header {
  box-sizing: border-box; height: 35px; min-height: 35px; padding-block: 0;
}
body [data-phase='hero'] :is([class*="_headline_"], [class$="_headline"], [class*="_headline "]) {
  justify-content: flex-start; font-size: 20px; line-height: 28px; font-weight: 400;
}
body [data-phase='hero'] :is([class*="_titleGroup_"], [class$="_titleGroup"], [class*="_titleGroup "]) { justify-content: flex-start; }
body [data-phase='hero'] :is([class*="_fishHitbox_"], [class$="_fishHitbox"], [class*="_fishHitbox "]) svg { width: 24px; height: 24px; }
body [data-phase='hero'] :is([class*="_previewBadge_"], [class$="_previewBadge"], [class*="_previewBadge "]) {
  align-self: center; margin-top: 0; border: 0; border-radius: 2px;
  font: 11px/16px var(--dsw-font-family); padding: 0 4px;
  background: var(--vsc-list-inactive-selection); color: var(--dsw-alias-label-secondary);
}
body [data-phase='hero'] :is([class*="_composerHero_"], [class$="_composerHero"], [class*="_composerHero "]) { gap: 6px; }
body [data-phase='hero'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):has(> :is([class*="_stack_"], [class$="_stack"], [class*="_stack "]) > :is([class*="_headline_"], [class$="_headline"], [class*="_headline "])) {
  padding-inline: var(--dsh-composer-side-clearance);
}
body [data-phase='hero'] :is([class*="_stack_"], [class$="_stack"], [class*="_stack "]):has(> :is([class*="_headline_"], [class$="_headline"], [class*="_headline "])) > :is([class*="_body_"], [class$="_body"], [class*="_body "]):empty { display: none; }
body [data-phase='hero'] :is([class*="_heroWorkspaceRow_"], [class$="_heroWorkspaceRow"], [class*="_heroWorkspaceRow "]) { padding-inline: var(--dsh-composer-side-clearance); }
body [data-phase='hero'] :is([class*="_heroWorkspaceRow_"], [class$="_heroWorkspaceRow"], [class*="_heroWorkspaceRow "]) button {
  box-sizing: border-box; height: 22px; min-height: 22px; padding: 0 6px;
  border-radius: 4px; font: 13px/18px var(--dsw-font-family);
}

/* User messages retain DSH's bubble layout with square corners. */
body :is([data-chat-flow-kind='user'], [data-chat-flow-kind='steering']) :is([class*="_bubble_"], [class$="_bubble"], [class*="_bubble "]) {
  border-radius: 0;
}
body [data-chat-flow-kind] :is([class*="_fileCard_"], [class$="_fileCard"], [class*="_fileCard "]) { border-radius: 4px; min-height: 44px; padding: 6px 8px; }
body [data-chat-flow-kind] :is([class*="_callRow_"], [class$="_callRow"], [class*="_callRow "]) { border-radius: 0; }
body :is([class*="_toBottom_"], [class$="_toBottom"], [class*="_toBottom "]) { width: 26px; height: 26px; border-radius: 6px; box-shadow: none; border: 1px solid var(--dsw-alias-border-l4); }

/* Installed plugins read as extension rows, with artwork separate from chrome. */
body [data-plugin-panel] :is([class*="_pageTitle_"], [class$="_pageTitle"], [class*="_pageTitle "]) { font-size: 20px; font-weight: 400; }
body [data-plugin-panel] :is([class*="_pageHead_"], [class$="_pageHead"], [class*="_pageHead "]) { padding-bottom: 12px; }
body [data-plugin-panel] :is([class*="_cards_"], [class$="_cards"], [class*="_cards "]) { gap: 0; }
body [data-plugin-panel] :is([class*="_card_"], [class$="_card"], [class*="_card "]) { border-radius: 0; margin: 0; }
body [data-plugin-panel] :is([class*="_cardOpen_"], [class$="_cardOpen"], [class*="_cardOpen "])::after { border-radius: 0; }
body [data-plugin-panel] :is([class*="_cardHead_"], [class$="_cardHead"], [class*="_cardHead "]) { gap: 10px; padding: 8px; }
body [data-plugin-panel] :is([class*="_cardIcon_"], [class$="_cardIcon"], [class*="_cardIcon "]) { width: 42px; height: 42px; border: 0; border-radius: 0; }
body [data-plugin-panel] :is(:is([class*="_cardTitle_"], [class$="_cardTitle"], [class*="_cardTitle "]), :is([class*="_cardOpen_"], [class$="_cardOpen"], [class*="_cardOpen "])) { font-size: 13px; font-weight: 600; }
body [data-plugin-panel] :is(:is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]), :is([class*="_infoButton_"], [class$="_infoButton"], [class*="_infoButton "])) { width: 22px; height: 22px; border-radius: 6px; }
body [data-plugin-panel] :is(:is([class*="_addPrimary_"], [class$="_addPrimary"], [class*="_addPrimary "]), :is([class*="_addMore_"], [class$="_addMore"], [class*="_addMore "])) { height: 26px; font-size: 12px; }
body [data-plugin-panel] :is([class*="_addPrimary_"], [class$="_addPrimary"], [class*="_addPrimary "]) { border-radius: 4px 0 0 4px; }
body [data-plugin-panel] :is([class*="_addMore_"], [class$="_addMore"], [class*="_addMore "]) { border-radius: 0 4px 4px 0; }

@media (max-width: 640px) {
  body [data-shortcut-modal='settings'] { max-width: calc(100vw - 16px); }
  body [data-shortcut-modal='settings'] :is([class*="_nav_"], [class$="_nav"], [class*="_nav "]) { width: 130px; }
  body [data-shortcut-modal='settings'] :is([class*="_navCell_"], [class$="_navCell"], [class*="_navCell "]) { padding-inline: 8px; gap: 6px; }
  body [data-shortcut-modal='settings'] :is([class*="_options_"], [class$="_options"], [class*="_options "]) { padding-inline: 12px; }
  body [data-shortcut-modal='settings'] :is([class*="_themeCube_"], [class$="_themeCube"], [class*="_themeCube "]) { padding-inline: 6px; }
}

/* Preserve Switch semantics and its real thumb; the reference uses a 28 \xD7 16 track. */
body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch'] {
  position: relative; box-sizing: border-box; container-type: size; flex: none;
  width: 28px; height: 16px; border-radius: 999px; padding: 0;
  border: 1px solid transparent; background: color-mix(in srgb, var(--vscode-descriptionForeground) 36%, transparent);
  cursor: pointer; transition: background-color 120ms ease, border-color 120ms ease;
}
body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch'][aria-checked='true'] { background: var(--vscode-button-background); border-color: var(--vscode-button-background); }
body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch'] > :is([class*="_thumb_"], [class$="_thumb"], [class*="_thumb "]) {
  position: absolute; display: block; box-sizing: border-box; top: 0; bottom: 0; left: 0;
  width: 100cqh; height: auto; border: 1px solid transparent; border-radius: 999px;
  background-color: var(--vscode-button-foreground); background-clip: padding-box;
  transform: none; transition: left 120ms ease;
}
body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch'][aria-checked='true'] > :is([class*="_thumb_"], [class$="_thumb"], [class*="_thumb "]) { left: calc(100% - 100cqh); transform: none; }
body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch']:disabled { opacity: .5; cursor: default; }
body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch']:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch'], body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch'] > :is([class*="_thumb_"], [class$="_thumb"], [class*="_thumb "]) { transition: none; }
}
@media (forced-colors: active) {
  body button:is([class*="_switch_"], [class$="_switch"], [class*="_switch "])[role='switch'] { border-color: ButtonText; }
}
body [data-shortcut-modal='settings'] [data-slot='settings.general.item'] > :is(:is([class*="_row_"], [class$="_row"], [class*="_row "]), :is([class*="_group_"], [class$="_group"], [class*="_group "])) {
  padding-block: 12px;
}
body [data-shortcut-modal='settings'] :is([class*="_setting_"], [class$="_setting"], [class*="_setting "]) :is([class*="_button_"], [class$="_button"], [class*="_button "]) {
  height: 26px; padding: 4px 8px; border-radius: 4px;
  font: 12px/16px var(--dsw-font-family);
}
body [data-shortcut-modal='settings'] :is([class*="_settingTitle_"], [class$="_settingTitle"], [class*="_settingTitle "]) { font-size: 13px; }
body [data-shortcut-modal='settings'] :is([class*="_settingText_"], [class$="_settingText"], [class*="_settingText "]) { padding-right: 16px; gap: 2px; }
body [data-shortcut-modal='settings'] :is([class*="_setting_"], [class$="_setting"], [class*="_setting "]) { padding-block: 12px; }

body :is([class*="_tag_"], [class$="_tag"], [class*="_tag "])[data-tone] { border-radius: 2px; padding: 0 4px; font-weight: 400; }
body [data-plugin-panel] { align-items: stretch; gap: 16px; padding-inline: 24px; }
body [data-plugin-panel] > * { max-width: none; }
body [data-plugin-panel] :is([class*="_groupTitle_"], [class$="_groupTitle"], [class*="_groupTitle "]) { font-size: 13px; font-weight: 600; }
`;

// src/fonts.js
function platformFonts(document2) {
  const platform = document2.documentElement.dataset.platform || document2.defaultView?.navigator.platform || "";
  let text;
  let code;
  let localized;
  if (/darwin|mac/i.test(platform)) {
    text = "-apple-system, BlinkMacSystemFont, sans-serif";
    code = '"SF Mono", Monaco, Menlo, Courier, monospace';
    localized = {
      "zh-CN,zh-Hans": '"PingFang SC", "Hiragino Sans GB"',
      "zh-TW,zh-HK,zh-Hant": '"PingFang TC"',
      ja: '"Hiragino Kaku Gothic Pro"',
      ko: '"Apple SD Gothic Neo", "Nanum Gothic", "AppleGothic"'
    };
  } else if (/win/i.test(platform)) {
    text = '"Segoe WPC", "Segoe UI", sans-serif';
    code = 'Consolas, "Courier New", monospace';
    localized = {
      "zh-CN,zh-Hans": '"Microsoft YaHei"',
      "zh-TW,zh-HK,zh-Hant": '"Microsoft Jhenghei"',
      ja: '"Yu Gothic UI", "Meiryo UI"',
      ko: '"Malgun Gothic", "Dotom"'
    };
  } else if (/linux/i.test(platform)) {
    text = 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
    code = '"Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace';
    localized = {
      "zh-CN,zh-Hans": '"Source Han Sans SC", "Source Han Sans CN", "Source Han Sans"',
      "zh-TW,zh-HK,zh-Hant": '"Source Han Sans TC", "Source Han Sans TW", "Source Han Sans"',
      ja: '"Source Han Sans J", "Source Han Sans JP", "Source Han Sans"',
      ko: '"Source Han Sans K", "Source Han Sans KR", "Source Han Sans", "UnDotum", "FBaekmuk Gulim"'
    };
  } else {
    return "";
  }
  return `body {
    --dsh-font-family-text-default: ${text};
    --dsh-font-family-code-default: ${code};
    font-family: var(--dsw-font-family);
  }
  ${Object.entries(localized).map(([languages, family]) => `${languages.split(",").map((language) => `body:lang(${language})`).join(", ")} {
    --dsh-font-family-text-default: ${text.replace("sans-serif", `${family}, sans-serif`)};
    --dsh-font-family-code-default: ${code.replace("monospace", `${family}, monospace`)};
  }`).join("\n")}`;
}

// classic:icons
var icons_default = `.vsc-icon[data-icon="files"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M7.5%2022.5h10.095C17.07%2023.4%2016.11%2024%2015%2024H7.5c-3.315%200-6-2.685-6-6V6c0-1.11.6-2.07%201.5-2.595V18c0%202.475%202.025%204.5%204.5%204.5M21%208.121V18c0%201.654-1.346%203-3%203H7.5c-1.654%200-3-1.346-3-3V3c0-1.654%201.346-3%203-3h5.379c.593%200%201.172.24%201.592.659l5.87%205.87c.425.425.659.99.659%201.592M13.5%206.75c0%20.414.338.75.75.75h4.94L13.5%201.81zm6%2011.25V9h-5.25C13.01%209%2012%207.99%2012%206.75V1.5H7.5C6.672%201.5%206%202.174%206%203v15c0%20.826.672%201.5%201.5%201.5H18c.828%200%201.5-.674%201.5-1.5%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
.vsc-icon[data-icon="search"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M10.02%2010.727a5.5%205.5%200%201%201%20.707-.707l3.127%203.126a.5.5%200%200%201-.708.708zM11%206.5a4.5%204.5%200%201%200-9%200a4.5%204.5%200%200%200%209%200%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
.vsc-icon[data-icon="extensions"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M15%204.957c0-.37-.144-.716-.405-.977L12.01%201.392c-.522-.523-1.431-.523-1.953%200L8%203.452v-.129c0-.772-.628-1.401-1.4-1.401H2.4c-.772%200-1.4.629-1.4%201.401V13.6c0%20.77.628%201.4%201.4%201.4h10.267c.771%200%201.4-.629%201.4-1.401V9.395c0-.772-.629-1.401-1.4-1.401h-.13l2.058-2.059c.26-.26.405-.609.405-.978M2.4%202.855h4.2c.257%200%20.467.21.467.467v4.671H1.933v-4.67c0-.259.21-.468.467-.468m-.467%2010.743v-4.67h5.134v5.137H2.4a.47.47%200%200%201-.467-.467m11.2-4.204v4.204c0%20.257-.21.467-.466.467H8V8.927h4.667c.256%200%20.466.21.466.467M8%207.993v-1.53l1.529%201.53zm5.935-2.72l-2.586%202.59a.456.456%200%200%201-.633%200L8.13%205.272a.445.445%200%200%201%200-.632l2.586-2.588a.444.444%200%200%201%20.633%200l2.586%202.588a.445.445%200%200%201%200%20.632%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
.vsc-icon[data-icon="calendar"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%201H4a3%203%200%200%200-3%203v8a3%203%200%200%200%203%203h8a3%203%200%200%200%203-3V4a3%203%200%200%200-3-3m2%2011a2%202%200%200%201-2%202H4a2%202%200%200%201-2-2V5h12zM2%204a2%202%200%200%201%202-2h8a2%202%200%200%201%202%202zm2%207a1%201%200%201%201%202%200a1%201%200%200%201-2%200m3%200a1%201%200%201%201%202%200a1%201%200%200%201-2%200M4%208a1%201%200%201%201%202%200a1%201%200%200%201-2%200m3%200a1%201%200%201%201%202%200a1%201%200%200%201-2%200m3%200a1%201%200%201%201%202%200a1%201%200%200%201-2%200%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
.vsc-icon[data-icon="git-pull-request"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M13%2010.05V5.5A2.5%202.5%200%200%200%2010.5%203H8.71l1.14-1.15c.2-.19.2-.51%200-.7c-.19-.2-.51-.2-.7%200l-2%202c-.2.19-.2.51%200%20.7l2%202c.19.2.51.2.7%200c.2-.19.2-.51%200-.7L8.71%204h1.79c.83%200%201.5.67%201.5%201.5v4.55a2.5%202.5%200%201%200%201%200M12.5%2014c-.83%200-1.5-.67-1.5-1.5s.67-1.5%201.5-1.5s1.5.67%201.5%201.5s-.67%201.5-1.5%201.5M6%203.5a2.5%202.5%200%201%200-3%202.45v4.101c-1.14.232-2%201.242-2%202.449C1%2013.879%202.122%2015%203.5%2015S6%2013.879%206%2012.5c0-1.208-.86-2.217-2-2.449V5.95A2.5%202.5%200%200%200%206%203.5m-4%200C2%202.67%202.67%202%203.5%202S5%202.67%205%203.5S4.33%205%203.5%205S2%204.33%202%203.5m3%209c0%20.827-.673%201.5-1.5%201.5S2%2013.327%202%2012.5S2.673%2011%203.5%2011s1.5.673%201.5%201.5%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
.vsc-icon[data-icon="checklist"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M4.854%202.146a.5.5%200%200%201%200%20.707l-2%202a.5.5%200%200%201-.707%200l-1-1a.5.5%200%200%201%20.707-.707l.646.646l1.646-1.646a.5.5%200%200%201%20.708%200M14.5%204h-8a.5.5%200%200%201%200-1h8a.5.5%200%200%201%200%201m-9.646%207.146a.5.5%200%200%201%200%20.707l-2%202a.5.5%200%200%201-.707%200l-1-1a.5.5%200%200%201%20.707-.707l.646.646l1.646-1.646a.5.5%200%200%201%20.708%200M14.5%2013h-8a.5.5%200%200%201%200-1h8a.5.5%200%200%201%200%201M4.854%206.646a.5.5%200%200%201%200%20.707l-2%202a.5.5%200%200%201-.707%200l-1-1a.5.5%200%200%201%20.707-.707l.646.646l1.646-1.646a.5.5%200%200%201%20.708%200M14.5%208.5h-8a.5.5%200%200%201%200-1h8a.5.5%200%200%201%200%201%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
.vsc-icon[data-icon="new-file"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M5%2014a1%201%200%200%201-1-1V3a1%201%200%200%201%201-1h3v2.5A1.5%201.5%200%200%200%209.5%206H12v.025q.516.048%201%20.188v-.799c0-.398-.158-.779-.439-1.061L9.647%201.439A1.5%201.5%200%200%200%208.586%201H5a2%202%200%200%200-2%202v10a2%202%200%200%200%202%202h2.261a5.6%205.6%200%200%201-.654-1zM9%202.207L11.793%205H9.5a.5.5%200%200%201-.5-.5zM11.5%207a4.5%204.5%200%201%200%200%209a4.5%204.5%200%200%200%200-9m2.5%205h-2v2a.5.5%200%200%201-1%200v-2H9a.5.5%200%200%201%200-1h2V9a.5.5%200%200%201%201%200v2h2a.5.5%200%200%201%200%201%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
.vsc-icon[data-icon="layout-sidebar-left"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12.5%201A2.5%202.5%200%200%201%2015%203.5v9a2.5%202.5%200%200%201-2.5%202.5h-9A2.5%202.5%200%200%201%201%2012.5v-9A2.5%202.5%200%200%201%203.5%201zm0%2013a1.5%201.5%200%200%200%201.5-1.5v-9A1.5%201.5%200%200%200%2012.5%202H7v12z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
.vsc-icon[data-icon="ellipsis"] { mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M5%208a1%201%200%201%201-2%200a1%201%200%200%201%202%200m4%200a1%201%200%201%201-2%200a1%201%200%200%201%202%200m3%201a1%201%200%201%200%200-2a1%201%200%200%200%200%202%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-step-process] [data-process-activity][aria-expanded='false'] [data-step-process-chevron] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M6.146%203.146a.5.5%200%200%200%200%20.707l4.146%204.146l-4.146%204.146a.5.5%200%200%200%20.707.707l4.5-4.5a.5.5%200%200%200%200-.707l-4.5-4.5a.5.5%200%200%200-.707%200%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-step-process] [data-process-activity][aria-expanded='false'] [data-step-process-chevron] svg > * { visibility: hidden; }
body [data-step-process] [data-process-activity][aria-expanded='true'] [data-step-process-chevron] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22m3.146%205.854l4.5%204.5a.5.5%200%200%200%20.707%200l4.5-4.5a.5.5%200%200%200-.707-.707L8%209.293L3.854%205.147a.5.5%200%200%200-.708.707%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-step-process] [data-process-activity][aria-expanded='true'] [data-step-process-chevron] svg > * { visibility: hidden; }
body [data-step-process] [data-slot='tool.call.toolview'] [aria-expanded='true'] > :is([class*="_leading_"], [class$="_leading"], [class*="_leading "]) > svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22m3.146%205.854l4.5%204.5a.5.5%200%200%200%20.707%200l4.5-4.5a.5.5%200%200%200-.707-.707L8%209.293L3.854%205.147a.5.5%200%200%200-.708.707%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-step-process] [data-slot='tool.call.toolview'] [aria-expanded='true'] > :is([class*="_leading_"], [class$="_leading"], [class*="_leading "]) > svg > * { visibility: hidden; }
body [data-slot='sidebar'] :is([class*="_newSession_"], [class$="_newSession"], [class*="_newSession "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M14.452%201.548a1.865%201.865%200%200%200-2.644%200L6.979%206.377a2.2%202.2%200%200%200-.578%201.021l-.374%201.498a.89.89%200%200%200%201.079%201.079l1.498-.374a2.2%202.2%200%200%200%201.021-.578l4.829-4.829c.73-.73.73-1.914%200-2.645zm-.707%201.937L8.916%208.314a1.2%201.2%200%200%201-.556.315l-1.32.333l.331-1.322c.053-.21.161-.403.315-.556l4.83-4.829a.866.866%200%200%201%201.23%200a.87.87%200%200%201%200%201.231zM13%207.768l1-1V11.5c0%201.378-1.121%202.5-2.5%202.5h-7A2.503%202.503%200%200%201%202%2011.5v-7C2%203.122%203.121%202%204.5%202h4.736l-1%201H4.5C3.673%203%203%203.673%203%204.5v7c0%20.827.673%201.5%201.5%201.5h7c.827%200%201.5-.673%201.5-1.5z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-slot='sidebar'] :is([class*="_newSession_"], [class$="_newSession"], [class*="_newSession "]) svg > * { visibility: hidden; }
body [data-slot='sidebar'] :is([class*="_panelIcon_"], [class$="_panelIcon"], [class*="_panelIcon "]) {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12.5%201A2.5%202.5%200%200%201%2015%203.5v9a2.5%202.5%200%200%201-2.5%202.5h-9A2.5%202.5%200%200%201%201%2012.5v-9A2.5%202.5%200%200%201%203.5%201zm0%2013a1.5%201.5%200%200%200%201.5-1.5v-9A1.5%201.5%200%200%200%2012.5%202H7v12z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-slot='sidebar'] :is([class*="_panelIcon_"], [class$="_panelIcon"], [class*="_panelIcon "]) > * { visibility: hidden; }
body [data-slot='sidebar'] [data-slot='settings.trigger'] svg {  width: 24px; height: 24px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12%209a3%203%200%201%200%200%206a3%203%200%201%200%200-6m0%204.5a1.5%201.5%200%201%201%20.001-3.001A1.5%201.5%200%200%201%2012%2013.5m9.848%201.072l-1.93-1.63a1.232%201.232%200%200%201%200-1.884l1.93-1.63a.62.62%200%200%200%20.189-.662a10.5%2010.5%200%200%200-2.209-3.804a.62.62%200%200%200-.668-.168l-2.381.848a1.3%201.3%200%200%201-.419.073a1.24%201.24%200%200%201-1.219-1.014l-.454-2.478a.62.62%200%200%200-.482-.493a10.7%2010.7%200%200%200-4.408%200a.62.62%200%200%200-.482.493l-.453%202.478a1.24%201.24%200%200%201-1.638.942l-2.38-.848a.62.62%200%200%200-.669.168a10.5%2010.5%200%200%200-2.21%203.805a.615.615%200%200%200%20.189.661l1.929%201.63q.077.066.143.143c.444.52.379%201.299-.143%201.742l-1.929%201.63a.62.62%200%200%200-.189.662a10.5%2010.5%200%200%200%202.21%203.803a.62.62%200%200%200%20.669.168l2.38-.847a1.3%201.3%200%200%201%20.419-.072c.588%200%201.11.417%201.219%201.014l.453%202.478a.62.62%200%200%200%20.482.493a10.7%2010.7%200%200%200%204.408%200a.62.62%200%200%200%20.482-.493l.454-2.478q.018-.099.053-.194a1.24%201.24%200%200%201%201.585-.748l2.379.848q.105.036.208.036a.62.62%200%200%200%20.461-.204a10.5%2010.5%200%200%200%202.208-3.804a.615.615%200%200%200-.189-.662zm-2.756%203.017l-1.81-.645a2.747%202.747%200%200%200-3.615%202.085l-.345%201.877a9.2%209.2%200%200%201-2.642-.002l-.344-1.876a2.737%202.737%200%200%200-3.616-2.085l-1.81.644a8.9%208.9%200%200%201-1.319-2.266l1.461-1.235c.56-.472.9-1.135.96-1.864a2.7%202.7%200%200%200-.645-1.995a3%203%200%200%200-.315-.315L3.591%208.677A8.9%208.9%200%200%201%204.91%206.412l1.81.645q.447.158.921.159a2.75%202.75%200%200%200%202.695-2.244l.344-1.876a9.3%209.3%200%200%201%202.642-.002l.343%201.877a2.737%202.737%200%200%200%203.617%202.085l1.81-.645c.552.69.993%201.449%201.319%202.266l-1.46%201.235a2.7%202.7%200%200%200-.96%201.864a2.71%202.71%200%200%200%20.962%202.31l1.46%201.234a8.9%208.9%200%200%201-1.318%202.267z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-slot='sidebar'] [data-slot='settings.trigger'] svg > * { visibility: hidden; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_searchButton_"], [class$="_searchButton"], [class*="_searchButton "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M10.02%2010.727a5.5%205.5%200%201%201%20.707-.707l3.127%203.126a.5.5%200%200%201-.708.708zM11%206.5a4.5%204.5%200%201%200-9%200a4.5%204.5%200%200%200%209%200%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_searchButton_"], [class$="_searchButton"], [class*="_searchButton "]) svg > * { visibility: hidden; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_clearButton_"], [class$="_clearButton"], [class*="_clearButton "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M13.85%2013.15c.2.2.2.51%200%20.71a.485.485%200%200%201-.7%200L8%208.71l-5.15%205.15a.485.485%200%200%201-.7%200c-.2-.2-.2-.51%200-.71L7.3%208L2.15%202.85c-.2-.2-.2-.51%200-.71s.51-.2.71%200l5.15%205.15l5.15-5.15c.2-.2.51-.2.71%200s.2.51%200%20.71L8.72%208l5.15%205.15z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_clearButton_"], [class$="_clearButton"], [class*="_clearButton "]) svg > * { visibility: hidden; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_headerActions_"], [class$="_headerActions"], [class*="_headerActions "]) > span :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M6%209.5A2%202%200%200%201%207.937%2011H13.5a.5.5%200%200%201%20.09.992L13.5%2012l-5.563.001a2%202%200%200%201-3.874%200L2.5%2012a.5.5%200%200%201-.09-.992L2.5%2011h1.563A2%202%200%200%201%206%209.5m0%201a1%201%200%201%200%200%202a1%201%200%200%200%200-2m4-8A2%202%200%200%201%2011.937%204H13.5a.5.5%200%200%201%20.09.992L13.5%205l-1.563.001a2%202%200%200%201-3.874%200L2.5%205a.5.5%200%200%201-.09-.992L2.5%204h5.563A2%202%200%200%201%2010%202.5m0%201a1%201%200%201%200%200%202a1%201%200%200%200%200-2%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_headerActions_"], [class$="_headerActions"], [class*="_headerActions "]) > span :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]) svg > * { visibility: hidden; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_headerActions_"], [class$="_headerActions"], [class*="_headerActions "]) > :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]):last-child svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M2%204.5V6h3.586a.5.5%200%200%200%20.353-.146L7.293%204.5L5.939%203.146A.5.5%200%200%200%205.586%203H3.5A1.5%201.5%200%200%200%202%204.5m-1%200A2.5%202.5%200%200%201%203.5%202h2.086a1.5%201.5%200%200%201%201.06.44L8.207%204H12.5A2.5%202.5%200%200%201%2015%206.5v.757a5.5%205.5%200%200%200-1-.657v-.1A1.5%201.5%200%200%200%2012.5%205H8.207l-1.56%201.56A1.5%201.5%200%200%201%205.585%207H2v4.5A1.5%201.5%200%200%200%203.5%2013h2.707q.149.524.393%201H3.5A2.5%202.5%200%200%201%201%2011.5zm15%207a4.5%204.5%200%201%201-9%200a4.5%204.5%200%200%201%209%200M12%209a.5.5%200%200%200-1%200v2H9a.5.5%200%200%200%200%201h2v2a.5.5%200%200%200%201%200v-2h2a.5.5%200%200%200%200-1h-2z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_headerActions_"], [class$="_headerActions"], [class*="_headerActions "]) > :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]):last-child svg > * { visibility: hidden; }
body [data-composer-card] :is([class*="_add_"], [class$="_add"], [class*="_add "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M8%201.5a.5.5%200%200%200-1%200V7H1.5a.5.5%200%200%200%200%201H7v5.5a.5.5%200%200%200%201%200V8h5.5a.5.5%200%200%200%200-1H8z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-composer-card] :is([class*="_add_"], [class$="_add"], [class*="_add "]) svg > * { visibility: hidden; }
body [data-composer-card] :is([class*="_chevron_"], [class$="_chevron"], [class*="_chevron "]) {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22m3.146%205.854l4.5%204.5a.5.5%200%200%200%20.707%200l4.5-4.5a.5.5%200%200%200-.707-.707L8%209.293L3.854%205.147a.5.5%200%200%200-.708.707%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-composer-card] :is([class*="_chevron_"], [class$="_chevron"], [class*="_chevron "]) > * { visibility: hidden; }
body [data-phase='hero'] [data-slot='conversation.session.header.corner'] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12.5%201A2.5%202.5%200%200%201%2015%203.5v9a2.5%202.5%200%200%201-2.5%202.5h-9A2.5%202.5%200%200%201%201%2012.5v-9A2.5%202.5%200%200%201%203.5%201zM9%2014V2H3.5A1.5%201.5%200%200%200%202%203.5v9A1.5%201.5%200%200%200%203.5%2014z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-phase='hero'] [data-slot='conversation.session.header.corner'] svg > * { visibility: hidden; }
body [data-shortcut-modal='settings'] :is([class*="_close_"], [class$="_close"], [class*="_close "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M13.85%2013.15c.2.2.2.51%200%20.71a.485.485%200%200%201-.7%200L8%208.71l-5.15%205.15a.485.485%200%200%201-.7%200c-.2-.2-.2-.51%200-.71L7.3%208L2.15%202.85c-.2-.2-.2-.51%200-.71s.51-.2.71%200l5.15%205.15l5.15-5.15c.2-.2.51-.2.71%200s.2.51%200%20.71L8.72%208l5.15%205.15z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-shortcut-modal='settings'] :is([class*="_close_"], [class$="_close"], [class*="_close "]) svg > * { visibility: hidden; }
body [data-dockkit-tab-close] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M13.85%2013.15c.2.2.2.51%200%20.71a.485.485%200%200%201-.7%200L8%208.71l-5.15%205.15a.485.485%200%200%201-.7%200c-.2-.2-.2-.51%200-.71L7.3%208L2.15%202.85c-.2-.2-.2-.51%200-.71s.51-.2.71%200l5.15%205.15l5.15-5.15c.2-.2.51-.2.71%200s.2.51%200%20.71L8.72%208l5.15%205.15z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-dockkit-tab-close] svg > * { visibility: hidden; }
body [data-dockkit-add-tab] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M8%201.5a.5.5%200%200%200-1%200V7H1.5a.5.5%200%200%200%200%201H7v5.5a.5.5%200%200%200%201%200V8h5.5a.5.5%200%200%200%200-1H8z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-dockkit-add-tab] svg > * { visibility: hidden; }
body [data-dockkit-split-button] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12.5%201h-9A2.503%202.503%200%200%200%201%203.5v9C1%2013.878%202.122%2015%203.5%2015h9c1.378%200%202.5-1.122%202.5-2.5v-9C15%202.122%2013.878%201%2012.5%201M2%2012.5v-9C2%202.673%202.673%202%203.5%202h4v12h-4c-.827%200-1.5-.673-1.5-1.5m12%200c0%20.827-.673%201.5-1.5%201.5h-4V2h4c.827%200%201.5.673%201.5%201.5z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-dockkit-split-button] svg > * { visibility: hidden; }
body [data-dockkit-strip-chrome] [data-sidebar-right-mode='fullscreen'] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M3.75%203a.75.75%200%200%200-.75.75V5.5a.5.5%200%200%201-1%200V3.75C2%202.784%202.784%202%203.75%202H5.5a.5.5%200%200%201%200%201zM10%202.5a.5.5%200%200%201%20.5-.5h1.75c.966%200%201.75.784%201.75%201.75V5.5a.5.5%200%200%201-1%200V3.75a.75.75%200%200%200-.75-.75H10.5a.5.5%200%200%201-.5-.5M2.5%2010a.5.5%200%200%201%20.5.5v1.75c0%20.414.336.75.75.75H5.5a.5.5%200%200%201%200%201H3.75A1.75%201.75%200%200%201%202%2012.25V10.5a.5.5%200%200%201%20.5-.5m11%200a.5.5%200%200%201%20.5.5v1.75A1.75%201.75%200%200%201%2012.25%2014H10.5a.5.5%200%200%201%200-1h1.75a.75.75%200%200%200%20.75-.75V10.5a.5.5%200%200%201%20.5-.5%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-dockkit-strip-chrome] [data-sidebar-right-mode='fullscreen'] svg > * { visibility: hidden; }
body [data-dockkit-strip-chrome] [data-sidebar-right-mode='push'] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M11%204a1%201%200%200%200%201%201h1.5a.5.5%200%200%201%200%201H12a2%202%200%200%201-2-2V2.5a.5.5%200%200%201%201%200zm0%208a1%201%200%200%201%201-1h1.5a.5.5%200%200%200%200-1H12a2%202%200%200%200-2%202v1.5a.5.5%200%200%200%201%200zm-7-1a1%201%200%200%201%201%201v1.5a.5.5%200%200%200%201%200V12a2%202%200%200%200-2-2H2.5a.5.5%200%200%200%200%201zm1-7a1%201%200%200%201-1%201H2.5a.5.5%200%200%200%200%201H4a2%202%200%200%200%202-2V2.5a.5.5%200%200%200-1%200z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-dockkit-strip-chrome] [data-sidebar-right-mode='push'] svg > * { visibility: hidden; }
body [data-dockkit-strip-chrome] [data-sidebar-right-toggle] svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M12.5%201A2.5%202.5%200%200%201%2015%203.5v9a2.5%202.5%200%200%201-2.5%202.5h-9A2.5%202.5%200%200%201%201%2012.5v-9A2.5%202.5%200%200%201%203.5%201zM9%2014V2H3.5A1.5%201.5%200%200%200%202%203.5v9A1.5%201.5%200%200%200%203.5%2014z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-dockkit-strip-chrome] [data-sidebar-right-toggle] svg > * { visibility: hidden; }
body [data-dockkit-tab-title] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M2%204.5V6h3.586a.5.5%200%200%200%20.353-.146L7.293%204.5L5.939%203.146A.5.5%200%200%200%205.586%203H3.5A1.5%201.5%200%200%200%202%204.5m-1%200A2.5%202.5%200%200%201%203.5%202h2.086a1.5%201.5%200%200%201%201.06.44L8.207%204H12.5A2.5%202.5%200%200%201%2015%206.5v5a2.5%202.5%200%200%201-2.5%202.5h-9A2.5%202.5%200%200%201%201%2011.5zM2%207v4.5A1.5%201.5%200%200%200%203.5%2013h9a1.5%201.5%200%200%200%201.5-1.5v-5A1.5%201.5%200%200%200%2012.5%205H8.207l-1.56%201.56A1.5%201.5%200%200%201%205.585%207z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-dockkit-tab-title] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) > * { visibility: hidden; }
body [data-phase='hero'] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M2%204.5V6h3.586a.5.5%200%200%200%20.353-.146L7.293%204.5L5.939%203.146A.5.5%200%200%200%205.586%203H3.5A1.5%201.5%200%200%200%202%204.5m-1%200A2.5%202.5%200%200%201%203.5%202h2.086a1.5%201.5%200%200%201%201.06.44L8.207%204H12.5A2.5%202.5%200%200%201%2015%206.5v5a2.5%202.5%200%200%201-2.5%202.5h-9A2.5%202.5%200%200%201%201%2011.5zM2%207v4.5A1.5%201.5%200%200%200%203.5%2013h9a1.5%201.5%200%200%200%201.5-1.5v-5A1.5%201.5%200%200%200%2012.5%205H8.207l-1.56%201.56A1.5%201.5%200%200%201%205.585%207z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-phase='hero'] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) > * { visibility: hidden; }
body [data-phase='hero'] :is([class*="_chevron_"], [class$="_chevron"], [class*="_chevron "]) {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22m3.146%205.854l4.5%204.5a.5.5%200%200%200%20.707%200l4.5-4.5a.5.5%200%200%200-.707-.707L8%209.293L3.854%205.147a.5.5%200%200%200-.708.707%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-phase='hero'] :is([class*="_chevron_"], [class$="_chevron"], [class*="_chevron "]) > * { visibility: hidden; }
body :is([class*="_toBottom_"], [class$="_toBottom"], [class*="_toBottom "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M13.854%208.146a.5.5%200%200%200-.707%200l-4.146%204.146V2.5a.5.5%200%200%200-1%200v9.793L3.855%208.147a.5.5%200%200%200-.707.707l5%205a.5.5%200%200%200%20.708%200l5-5a.5.5%200%200%200%200-.707z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body :is([class*="_toBottom_"], [class$="_toBottom"], [class*="_toBottom "]) svg > * { visibility: hidden; }
body [data-vsc-tree] [data-row-key^='workspace:'] :is([class*="_chevron_"], [class$="_chevron"], [class*="_chevron "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M6.146%203.146a.5.5%200%200%200%200%20.707l4.146%204.146l-4.146%204.146a.5.5%200%200%200%20.707.707l4.5-4.5a.5.5%200%200%200%200-.707l-4.5-4.5a.5.5%200%200%200-.707%200%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] [data-row-key^='workspace:'] :is([class*="_chevron_"], [class$="_chevron"], [class*="_chevron "]) svg > * { visibility: hidden; }
body [data-vsc-tree] [data-row-key^='workspace:'][aria-expanded='true'] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M2%204.5v4.6l.924-1.6A3%203%200%200%201%205.522%206h6.393A1.5%201.5%200%200%200%2010.5%205H7a.5.5%200%200%201-.354-.146L4.94%203.146A.5.5%200%200%200%204.586%203H3.5A1.5%201.5%200%200%200%202%204.5m5.069%209.495L7%2014H3.5A2.5%202.5%200%200%201%201%2011.5v-7A2.5%202.5%200%200%201%203.5%202h1.086a1.5%201.5%200%200%201%201.06.44L7.207%204H10.5a2.5%202.5%200%200%201%202.458%202.041c1.647.3%202.586%202.18%201.704%203.709l-1.585%202.745a3%203%200%200%201-2.598%201.5zM5.522%207A2%202%200%200%200%203.79%208l-1.585%202.745a1.5%201.5%200%200%200%201.299%202.25h6.975a2%202%200%200%200%201.732-1l1.585-2.745a1.5%201.5%200%200%200-1.3-2.25z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] [data-row-key^='workspace:'][aria-expanded='true'] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) svg > * { visibility: hidden; }
body [data-vsc-tree] [data-row-key^='workspace:'][aria-expanded='false'] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M2%204.5V6h3.586a.5.5%200%200%200%20.353-.146L7.293%204.5L5.939%203.146A.5.5%200%200%200%205.586%203H3.5A1.5%201.5%200%200%200%202%204.5m-1%200A2.5%202.5%200%200%201%203.5%202h2.086a1.5%201.5%200%200%201%201.06.44L8.207%204H12.5A2.5%202.5%200%200%201%2015%206.5v5a2.5%202.5%200%200%201-2.5%202.5h-9A2.5%202.5%200%200%201%201%2011.5zM2%207v4.5A1.5%201.5%200%200%200%203.5%2013h9a1.5%201.5%200%200%200%201.5-1.5v-5A1.5%201.5%200%200%200%2012.5%205H8.207l-1.56%201.56A1.5%201.5%200%200%201%205.585%207z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] [data-row-key^='workspace:'][aria-expanded='false'] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) svg > * { visibility: hidden; }
body [data-vsc-tree] [data-row-key='workspace:'][aria-expanded] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M8.207%204H12.5A2.5%202.5%200%200%201%2015%206.5v5a2.5%202.5%200%200%201-2.5%202.5h-2.387l-.017-.058a1%201%200%200%200-.028-.09L9.715%2013H12.5a1.5%201.5%200%200%200%201.5-1.5v-5A1.5%201.5%200%200%200%2012.5%205H8.207L6.646%206.561A1.5%201.5%200%200%201%205.585%207H.999V4.5a2.5%202.5%200%200%201%202.5-2.5h2.086a1.5%201.5%200%200%201%201.061.439zM5.585%206a.5.5%200%200%200%20.354-.146L7.293%204.5L5.939%203.146A.5.5%200%200%200%205.585%203H3.499a1.5%201.5%200%200%200-1.5%201.5V6z%22%2F%3E%3Cpath%20d%3D%22M6.766%209.271c.245.101.441.294.545.538l1.833%204.425a1%201%200%200%201%20.08.383a1%201%200%200%201-.616.924l-.925.383a1.01%201.01%200%200%201-.94-.092a1%201%200%200%201-.37-.449L5%2012.07V15a1%201%200%200%201-1%201H3a1%201%200%200%201-.5-.135A1%201%200%200%201%202%2016H1a1%201%200%200%201-1-1V9a1.003%201.003%200%200%201%201-1h1c.176%200%20.348.046.5.135A1%201%200%200%201%203%208h1a1.003%201.003%200%200%201%201%201v.688l.078-.038L6%209.268c.246-.099.521-.098.766.003M1%2015h1V9H1zm2%200h1V9H3zm2.463-4.426L7.3%2015l.92-.383l-1.835-4.425z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] [data-row-key='workspace:'][aria-expanded] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) svg > * { visibility: hidden; }
body [data-vsc-tree] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) > span > button svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M5%208a1%201%200%201%201-2%200a1%201%200%200%201%202%200m4%200a1%201%200%201%201-2%200a1%201%200%200%201%202%200m3%201a1%201%200%201%200%200-2a1%201%200%200%200%200%202%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) > span > button svg > * { visibility: hidden; }
body [data-vsc-tree] [data-row-key^='workspace:'] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) > button svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M14.452%201.548a1.865%201.865%200%200%200-2.644%200L6.979%206.377a2.2%202.2%200%200%200-.578%201.021l-.374%201.498a.89.89%200%200%200%201.079%201.079l1.498-.374a2.2%202.2%200%200%200%201.021-.578l4.829-4.829c.73-.73.73-1.914%200-2.645zm-.707%201.937L8.916%208.314a1.2%201.2%200%200%201-.556.315l-1.32.333l.331-1.322c.053-.21.161-.403.315-.556l4.83-4.829a.866.866%200%200%201%201.23%200a.87.87%200%200%201%200%201.231zM13%207.768l1-1V11.5c0%201.378-1.121%202.5-2.5%202.5h-7A2.503%202.503%200%200%201%202%2011.5v-7C2%203.122%203.121%202%204.5%202h4.736l-1%201H4.5C3.673%203%203%203.673%203%204.5v7c0%20.827.673%201.5%201.5%201.5h7c.827%200%201.5-.673%201.5-1.5z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] [data-row-key^='workspace:'] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) > button svg > * { visibility: hidden; }
body [data-vsc-tree] [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(1) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M6.5%208a.5.5%200%200%200%200%201h3a.5.5%200%200%200%200-1zM1%203.5A1.5%201.5%200%200%201%202.5%202h11A1.5%201.5%200%200%201%2015%203.5v1a1.5%201.5%200%200%201-1%201.415V11.5a2.5%202.5%200%200%201-2.5%202.5h-7A2.5%202.5%200%200%201%202%2011.5V5.915A1.5%201.5%200%200%201%201%204.5zM2.5%203a.5.5%200%200%200-.5.5v1a.5.5%200%200%200%20.5.5h11a.5.5%200%200%200%20.5-.5v-1a.5.5%200%200%200-.5-.5zM3%206v5.5A1.5%201.5%200%200%200%204.5%2013h7a1.5%201.5%200%200%200%201.5-1.5V6z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(1) svg > * { visibility: hidden; }
body [data-vsc-tree] :is([class*="_archived_"], [class$="_archived"], [class*="_archived "]) [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(1) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M4.5%2013c-.827%200-1.5-.673-1.5-1.5V6h10v.213q.524.149%201%20.394V6l-.004-.085A1.5%201.5%200%200%200%2015%204.5v-1c0-.827-.673-1.5-1.5-1.5h-11C1.673%202%201%202.673%201%203.5v1c0%20.653.42%201.21%201.004%201.415L2%206v5.5C2%2012.878%203.122%2014%204.5%2014h2.107a5.4%205.4%200%200%201-.394-1zm-2-8a.5.5%200%200%201-.5-.5v-1a.5.5%200%200%201%20.5-.5h11a.5.5%200%200%201%20.5.5v1a.5.5%200%200%201-.5.5zm9%202a4.5%204.5%200%201%200%200%209a4.5%204.5%200%200%200%200-9m2.336%205.871l-1.982%201.982a.5.5%200%200%201-.708%200a.5.5%200%200%201%200-.707l1.982-1.982a1.27%201.27%200%200%200-1.793-1.793l-.629.629h.793a.5.5%200%200%201%200%201h-2a.5.5%200%200%201-.5-.5v-2a.5.5%200%200%201%201%200v.793l.629-.629a2.27%202.27%200%200%201%203.872%201.604c0%20.606-.236%201.174-.664%201.603%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] :is([class*="_archived_"], [class$="_archived"], [class*="_archived "]) [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(1) svg > * { visibility: hidden; }
body [data-vsc-tree] [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(2) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M13.5%203q-.297%200-.577.114L8.481%204.967l-2.822-.941a.5.5%200%200%200-.658.474V7H1.257L.5%207.5l.757.5H5v2.5a.5.5%200%200%200%20.658.474l2.822-.941l4.445%201.854q.277.113.574.113c.827%200%201.5-.673%201.5-1.5v-6c0-.827-.673-1.5-1.5-1.5zm.5%207.5c0%20.343-.385.59-.692.462L8.693%209.038a.5.5%200%200%200-.35-.013l-2.342.781V5.193l2.342.781a.5.5%200%200%200%20.351-.013l4.612-1.923a.51.51%200%200%201%20.695.461z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(2) svg > * { visibility: hidden; }
body [data-vsc-tree] [data-row-key]:has(:is([class*="_pinIndicator_"], [class$="_pinIndicator"], [class*="_pinIndicator "])) [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(2) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M10.059%202.445a1.5%201.5%200%200%200-2.386.353l-2.02%203.79l-2.811.938a.5.5%200%200%200-.196.828L4.793%2010.5l-2.647%202.646L2%2014l.854-.146L5.5%2011.207l2.146%202.147a.5.5%200%200%200%20.828-.196l.937-2.811l3.779-2.023a1.5%201.5%200%200%200%20.354-2.38zm-1.504.824a.5.5%200%200%201%20.796-.118l3.485%203.498a.5.5%200%200%201-.118.794L8.764%209.559a.5.5%200%200%200-.238.283l-.744%202.232L3.926%208.22l2.232-.745a.5.5%200%200%200%20.283-.239z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] [data-row-key]:has(:is([class*="_pinIndicator_"], [class$="_pinIndicator"], [class*="_pinIndicator "])) [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(2) svg > * { visibility: hidden; }
body [data-vsc-tree] :is([class*="_pinIndicator_"], [class$="_pinIndicator"], [class*="_pinIndicator "]) svg {  width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M10.059%202.445a1.5%201.5%200%200%200-2.386.353l-2.02%203.79l-2.811.938a.5.5%200%200%200-.196.828L4.793%2010.5l-2.647%202.646L2%2014l.854-.146L5.5%2011.207l2.146%202.147a.5.5%200%200%200%20.828-.196l.937-2.811l3.779-2.023a1.5%201.5%200%200%200%20.354-2.38zm-1.504.824a.5.5%200%200%201%20.796-.118l3.485%203.498a.5.5%200%200%201-.118.794L8.764%209.559a.5.5%200%200%200-.238.283l-.744%202.232L3.926%208.22l2.232-.745a.5.5%200%200%200%20.283-.239z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
body [data-vsc-tree] :is([class*="_pinIndicator_"], [class$="_pinIndicator"], [class*="_pinIndicator "]) svg > * { visibility: hidden; }
body [data-vsc-tree] [data-row-key^='session:'] > :is([class*="_slot_"], [class$="_slot"], [class*="_slot "]):empty::after { content: ''; display: block; width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M1%204.5A2.5%202.5%200%200%201%203.5%202h9A2.5%202.5%200%200%201%2015%204.5v5a2.5%202.5%200%200%201-2.5%202.5H8.688l-3.063%202.68A.98.98%200%200%201%204%2013.942V12h-.5A2.5%202.5%200%200%201%201%209.5zM3.5%203A1.5%201.5%200%200%200%202%204.5v5A1.5%201.5%200%200%200%203.5%2011H5v2.898L8.312%2011H12.5A1.5%201.5%200%200%200%2014%209.5v-5A1.5%201.5%200%200%200%2012.5%203z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }

body [data-vsc-tree] [data-row-key^='session:'] > :is([class*="_slot_"], [class$="_slot"], [class*="_slot "]):has(> [data-slot]:empty)::after { content: ''; display: block; width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M1%204.5A2.5%202.5%200%200%201%203.5%202h9A2.5%202.5%200%200%201%2015%204.5v5a2.5%202.5%200%200%201-2.5%202.5H8.688l-3.063%202.68A.98.98%200%200%201%204%2013.942V12h-.5A2.5%202.5%200%200%201%201%209.5zM3.5%203A1.5%201.5%200%200%200%202%204.5v5A1.5%201.5%200%200%200%203.5%2011H5v2.898L8.312%2011H12.5A1.5%201.5%200%200%200%2014%209.5v-5A1.5%201.5%200%200%200%2012.5%203z%22%2F%3E%3C%2Fsvg%3E") center / contain no-repeat; }
`;

// src/tree.css
var tree_default = `/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: TreeView, List, IconLabel, ActionBar, Pane, SidebarTitle
 * Adaptation: Native DSH hierarchy and two-line search results with Classic row geometry, persistent focus, and independent selection states.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
body [data-slot='sidebar'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):not(:is([class*="_rail_"], [class$="_rail"], [class*="_rail "])):has(> :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "])) {
  --dsh-session-list-edge-inset: 0px;
  padding-right: 0;
}
body [data-slot='sidebar'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):not(:is([class*="_rail_"], [class$="_rail"], [class*="_rail "])) > :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) {
  height: 22px; margin: 0; padding: 0 8px 0 12px; gap: 2px;
  border-radius: 0; border: 0; box-shadow: 0 -1px var(--dsw-alias-border-l3);
}
body [data-slot='sidebar'] :is([class*="_sectionLabel_"], [class$="_sectionLabel"], [class*="_sectionLabel "]) {
  font-size: 11px; line-height: 22px; font-weight: 700; text-transform: uppercase;
  color: var(--dsw-alias-label-primary); max-width: 60%;
}
body [data-slot='sidebar'] :is([class*="_sectionLabelHidden_"], [class$="_sectionLabelHidden"], [class*="_sectionLabelHidden "]) { max-width: 0; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_headerActions_"], [class$="_headerActions"], [class*="_headerActions "]) { gap: 4px; }
body [data-slot='sidebar'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):not(:is([class*="_rail_"], [class$="_rail"], [class*="_rail "])) > :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is(:is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]), :is([class*="_searchButton_"], [class$="_searchButton"], [class*="_searchButton "]), :is([class*="_clearButton_"], [class$="_clearButton"], [class*="_clearButton "])) {
  box-sizing: border-box; width: 20px; height: 20px; padding: 2px; border: 0; border-radius: 6px;
}
body [data-slot='sidebar'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):not(:is([class*="_rail_"], [class$="_rail"], [class*="_rail "])) > :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_search_"], [class$="_search"], [class*="_search "]) { height: 22px; border-radius: 4px; }
body [data-slot='sidebar'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):not(:is([class*="_rail_"], [class$="_rail"], [class*="_rail "])) > :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_searchExpanded_"], [class$="_searchExpanded"], [class*="_searchExpanded "]) {
  width: 100%; margin-inline: 0; border-width: 1px;
}
body [data-slot='sidebar'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):not(:is([class*="_rail_"], [class$="_rail"], [class*="_rail "])) > :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_searchExpanded_"], [class$="_searchExpanded"], [class*="_searchExpanded "]) :is(:is([class*="_searchButton_"], [class$="_searchButton"], [class*="_searchButton "]), :is([class*="_clearButton_"], [class$="_clearButton"], [class*="_clearButton "])) {
  height: 20px;
}
body [data-slot='sidebar'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):not(:is([class*="_rail_"], [class$="_rail"], [class*="_rail "])) > :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_searchSlot_"], [class$="_searchSlot"], [class*="_searchSlot "]) { max-width: 22px; }
body [data-slot='sidebar'] :is([class*="_root_"], [class$="_root"], [class*="_root "]):not(:is([class*="_rail_"], [class$="_rail"], [class*="_rail "])) > :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) :is([class*="_searchSlotExpanded_"], [class$="_searchSlotExpanded"], [class*="_searchSlotExpanded "]) { max-width: 100%; }
body [data-slot='sidebar'] :is([class*="_listArea_"], [class$="_listArea"], [class*="_listArea "]) { margin: 0; padding: 0; }
body [data-slot='sidebar'] :is([class*="_treeBody_"], [class$="_treeBody"], [class*="_treeBody "]) > [role='tree'] {
  margin: 0; padding: 0 0 8px; scrollbar-gutter: auto;
}
body [data-slot='sidebar'] :is([class*="_treeBody_"], [class$="_treeBody"], [class*="_treeBody "]) > :is([class*="_fade_"], [class$="_fade"], [class*="_fade "]) { display: none; }

/* Persistent disclosure and icon lanes. The native 12px depth step projects to 8px.
   Neutralize native .selected fills here: that class identifies the open session,
   while aria-selected below identifies the independent tree selection. */
body [data-slot='sidebar'] [data-vsc-tree] [role='treeitem'] {
  box-sizing: border-box; height: 22px; min-height: 22px; border-radius: 0;
  margin-block: 0; padding-right: 12px; font-size: 13px; line-height: 22px;
  background: transparent; color: var(--vscode-foreground); outline: none;
}
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key^='workspace:'] {
  gap: 0; padding-left: calc(8px + var(--dsh-workspace-indent, 0px) / 1.5);
}
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key^='workspace:'] > :is([class*="_chevron_"], [class$="_chevron"], [class*="_chevron "]) {
  display: inline-flex; box-sizing: content-box; order: 0; width: 16px; height: 22px; padding-right: 6px;
  color: var(--dsw-alias-label-primary); transform: translateX(3px);
}
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key^='workspace:'] > :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) {
  display: inline-flex; order: 1; width: 16px; height: 22px; margin-right: 6px;
  color: inherit;
}
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key^='workspace:'] > :is([class*="_projectText_"], [class$="_projectText"], [class*="_projectText "]) { order: 2; }
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key^='workspace:'] > :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) { order: 3; }
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key^='session:'] {
  padding-left: calc(8px + var(--dsh-workspace-indent, 0px) / 1.5);
}
body [data-slot='sidebar'] [data-vsc-tree-group] [data-row-key^='session:'] {
  padding-left: calc(16px + var(--dsh-workspace-indent, 0px) / 1.5);
}
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key^='session:'] > :is([class*="_slot_"], [class$="_slot"], [class*="_slot "]) {
  width: 16px; height: 22px; margin-left: 22px; margin-right: 6px;
}
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key] :is([class*="_title_"], [class$="_title"], [class*="_title "]) {
  margin: 0; font-size: 13px; line-height: 22px; font-weight: 400; color: inherit;
  overflow: clip; text-overflow: ellipsis; mask-image: none;
}
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key] :is([class*="_time_"], [class$="_time"], [class*="_time "]) {
  font-size: .9em; padding-left: 6px; opacity: .7; color: inherit; font-variant-numeric: tabular-nums;
}
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key^='overflow:'] {
  padding-left: calc(60px + var(--dsh-workspace-indent, 0px) / 1.5); text-align: left;
  color: var(--dsw-alias-label-caption);
}
body [data-slot='sidebar'] [data-vsc-tree-group],
body [data-slot='sidebar'] [data-vsc-tree-group] > * + * { margin-top: 0; }
body [data-slot='sidebar'] [data-vsc-tree]:is([class*="_flatList_"], [class$="_flatList"], [class*="_flatList "]) > * + * { margin-top: 0; }
/* Search retains its workspace/snippet line; each line uses the tree's 22px rhythm. */
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_searchResultRow_"], [class$="_searchResultRow"], [class*="_searchResultRow "]) {
  height: 44px; padding: 0 12px 0 8px;
}
body [data-slot='sidebar'] [data-vsc-tree]:is([class*="_searchTree_"], [class$="_searchTree"], [class*="_searchTree "]) > [role='treeitem'] + [role='treeitem'] { margin-top: 0; }
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_searchResultHeading_"], [class$="_searchResultHeading"], [class*="_searchResultHeading "]) { height: 22px; }
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_searchResultTitle_"], [class$="_searchResultTitle"], [class*="_searchResultTitle "]) { font-size: 13px; line-height: 22px; margin-left: 6px; }
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_searchResultMeta_"], [class$="_searchResultMeta"], [class*="_searchResultMeta "]) { margin-left: 22px; height: 22px; }
body [data-slot='sidebar'] [data-vsc-tree] :is(:is([class*="_searchResultWorkspace_"], [class$="_searchResultWorkspace"], [class*="_searchResultWorkspace "]), :is([class*="_searchResultSnippet_"], [class$="_searchResultSnippet"], [class*="_searchResultSnippet "])) {
  font-size: .9em; line-height: 22px; color: inherit; opacity: .7;
}

/* One continuous guide belongs to each parent, including every visible descendant. */
body [data-slot='sidebar'] [data-vsc-tree-group]:not(:is([class*="_workspaceDropBefore_"], [class$="_workspaceDropBefore"], [class*="_workspaceDropBefore "]))::before {
  content: ''; position: absolute; z-index: 1; pointer-events: none;
  left: calc(16px + var(--dsh-workspace-indent, 0px) / 1.5); top: 22px; bottom: 0;
  width: 1px; background: var(--vsc-tree-inactive-guide); opacity: 1;
}
body [data-slot='sidebar'] [data-vsc-tree-group='active']:not(:is([class*="_workspaceDropBefore_"], [class$="_workspaceDropBefore"], [class*="_workspaceDropBefore "]))::before { background: var(--vsc-tree-guide); opacity: 1; }

/* A remembered focus row is distinct from selection and from DOM focus.
   Row actions/rename fields deliberately leave the list's active state. */
body [data-slot='sidebar'] [data-vsc-tree] [role='treeitem']:hover:not([aria-selected='true']):not([data-vsc-tree-focused='true']) {
  background: var(--vscode-list-hoverBackground); color: var(--vscode-list-hoverForeground);
}
body [data-slot='sidebar'] [data-vsc-tree] [role='treeitem']:is([class*="_menuOpen_"], [class$="_menuOpen"], [class*="_menuOpen "]):not([aria-selected='true']):not([data-vsc-tree-focused='true']) {
  background: var(--vscode-list-hoverBackground); color: var(--vscode-list-hoverForeground);
}
body [data-slot='sidebar'] [data-vsc-tree] [role='treeitem'][aria-selected='true'] {
  background: var(--vscode-list-inactiveSelectionBackground); color: var(--vscode-list-inactiveSelectionForeground, var(--vscode-foreground));
  outline: 1px dotted var(--vscode-contrastActiveBorder, transparent); outline-offset: -1px;
}
body [data-slot='sidebar'] [data-vsc-tree] [role='treeitem']:hover {
  outline: 1px dashed var(--vscode-contrastActiveBorder, transparent); outline-offset: -1px;
}
body [data-slot='sidebar'] [data-vsc-tree][data-vsc-tree-active='true'] [data-vsc-tree-focused='true'] {
  background: var(--vscode-list-focusBackground); color: var(--vscode-list-focusForeground, var(--vscode-foreground));
  outline: 1px solid var(--vscode-list-focusOutline); outline-offset: -1px;
}
body [data-slot='sidebar'] [data-vsc-tree][data-vsc-tree-active='true'] [role='treeitem'][aria-selected='true'] {
  background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground);
}
body [data-slot='sidebar'] [data-vsc-tree][data-vsc-tree-active='true'] [data-vsc-tree-focused='true'][aria-selected='true'] {
  outline-color: var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline)));
}
body [data-slot='sidebar'] [data-vsc-tree] [role='treeitem']:is([aria-selected='true'], [data-vsc-tree-focused='true']) :is(:is([class*="_slot_"], [class$="_slot"], [class*="_slot "]), :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "])) { color: inherit; }
body [data-slot='sidebar'] [data-vsc-tree][data-vsc-tree-active='true'] [aria-selected='true'] :is(:is([class*="_slot_"], [class$="_slot"], [class*="_slot "]), :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "])) {
  color: var(--vscode-list-activeSelectionIconForeground, inherit);
}
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) { display: none; gap: 0; height: 22px; margin-left: 4px; }
body [data-slot='sidebar'] [data-vsc-tree] [role='treeitem']:is(:hover, :focus-within, [data-vsc-tree-focused='true'], [aria-selected='true'], :is([class*="_menuOpen_"], [class$="_menuOpen"], [class*="_menuOpen "])) :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) { display: inline-flex; }
body [data-slot='sidebar'] [data-vsc-tree] [role='treeitem']:is(:hover, :focus-within, [data-vsc-tree-focused='true'], [aria-selected='true'], :is([class*="_menuOpen_"], [class$="_menuOpen"], [class*="_menuOpen "])) > :is(:is([class*="_time_"], [class$="_time"], [class*="_time "]), :is([class*="_pinIndicator_"], [class$="_pinIndicator"], [class*="_pinIndicator "]), :is([class*="_rowResting_"], [class$="_rowResting"], [class*="_rowResting "])) { display: none; }
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]) {
  box-sizing: border-box; width: 20px; height: 20px; padding: 2px;
  border-radius: var(--vscode-cornerRadius-medium, 6px);
}
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]) svg { width: 16px; height: 16px; }
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]):hover { background: var(--vscode-toolbar-hoverBackground); }
body [data-slot='sidebar'] [data-vsc-tree] :is([class*="_rowActions_"], [class$="_rowActions"], [class*="_rowActions "]) :is([class*="_iconButton_"], [class$="_iconButton"], [class*="_iconButton "]):focus-visible {
  outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px;
}

/* Keep native insertion markers separate from the ancestor's guide. */
body [data-slot='sidebar'] [data-vsc-tree] :is(:is([class*="_dropBefore_"], [class$="_dropBefore"], [class*="_dropBefore "]), :is([class*="_workspaceDropBefore_"], [class$="_workspaceDropBefore"], [class*="_workspaceDropBefore "]))::before,
body [data-slot='sidebar'] [data-vsc-tree] :is(:is([class*="_dropAfter_"], [class$="_dropAfter"], [class*="_dropAfter "]), :is([class*="_workspaceDropAfter_"], [class$="_workspaceDropAfter"], [class*="_workspaceDropAfter "]))::after {
  height: 1px; width: auto; left: 0; right: 0; opacity: 1;
  background: var(--dsw-focus-ring-color);
}
body [data-slot='sidebar'] [data-vsc-tree] :is(:is([class*="_dropBefore_"], [class$="_dropBefore"], [class*="_dropBefore "]), :is([class*="_workspaceDropBefore_"], [class$="_workspaceDropBefore"], [class*="_workspaceDropBefore "]))::before { top: 0; bottom: auto; }
body [data-slot='sidebar'] [data-vsc-tree] :is(:is([class*="_dropAfter_"], [class$="_dropAfter"], [class*="_dropAfter "]), :is([class*="_workspaceDropAfter_"], [class$="_workspaceDropAfter"], [class*="_workspaceDropAfter "]))::after { bottom: 0; top: auto; }
`;

// src/activity.css
var activity_default = `/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: ActivityBar/activityaction.css, SidebarTitle, CompositeBar, WorkbenchLayout
 * Adaptation: 48px activity rail, 35px view title and compact action toolbar around DSH's persistent session views.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
body .vsc-sidebar {
  --dsh-sidebar-inline-padding: 0px;
  /* The grid column owns width; its divider is outside this content box.
     Reusing the outer pixel width here clips the tree's right focus edge. */
  box-sizing: border-box; width: 100%; height: 100%; min-height: 0; display: flex;
  overflow: hidden; padding: 0; color: var(--vscode-sideBar-foreground);
  font: 13px/1.4 var(--dsw-font-family);
}
.vsc-activitybar {
  position: relative; box-sizing: border-box; flex: 0 0 48px; width: 48px; min-height: 0;
  display: flex; flex-direction: column;
  background: var(--vscode-activityBar-background);
}
.vsc-activitybar::after { content: ''; position: absolute; inset: 0 0 0 auto; border-right: 1px solid var(--vscode-activityBar-border, var(--vscode-contrastBorder, transparent)); pointer-events: none; }
body .vsc-activities { display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto; scrollbar-width: none; flex: 1; min-height: 48px; }
.vsc-activities::-webkit-scrollbar { display: none; }
.vsc-global-actions { flex: none; display: flex; flex-direction: column; }
.vsc-more-anchor { display: block; flex: none; }
body .vsc-activity {
  position: relative; box-sizing: border-box; display: flex; flex: none;
  align-items: center; justify-content: center; width: 48px; height: 48px;
  min-height: 48px; padding: 0; margin: 0; border: 0; border-radius: 0;
  background: transparent; color: var(--vscode-activityBar-inactiveForeground);
  cursor: pointer; outline: none;
}
body .vsc-activity:hover, body .vsc-activity[aria-current], body .vsc-activity:focus-visible { color: var(--vscode-activityBar-foreground); }
body .vsc-activity[aria-current] { background: var(--vscode-activityBar-activeBackground, transparent); }
body .vsc-activity[aria-current]::before, body .vsc-activity:focus-visible::before {
  content: ''; position: absolute; top: 0; bottom: 0; left: 0;
  border-left: 2px solid var(--vscode-activityBar-activeBorder);
}
body .vsc-activity:focus-visible::before { border-color: var(--vscode-contrastActiveBorder, var(--vscode-focusBorder)); }
body .vsc-activity[aria-current]:focus-visible::before { border-color: var(--vscode-activityBar-activeFocusBorder, var(--vscode-contrastActiveBorder, var(--vscode-focusBorder))); }
.vsc-icon { display: inline-block; flex-shrink: 0; background: currentColor; }
.vsc-explorer { flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--vscode-sideBar-background); }
.vsc-explorer[hidden] { display: none; }
.vsc-workspace-view, .vsc-workspace-view > [data-slot='sidebar.workspaces'] { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.vsc-sidebar-title { box-sizing: border-box; flex: none; height: 35px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px 0 20px; gap: 8px; overflow: hidden; background: var(--vscode-sideBarTitle-background, var(--vscode-sideBar-background)); border-bottom: 1px solid var(--vscode-sideBarTitle-border, transparent); }
.vsc-sidebar-title > h2 { min-width: 0; margin: 0; font-size: 11px; font-weight: 400; line-height: 35px; color: var(--vscode-sideBarTitle-foreground); text-transform: uppercase; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; cursor: default; }
.vsc-title-actions { flex: none; display: flex; align-items: center; gap: 4px; padding-right: 4px; }
body .vsc-action { box-sizing: border-box; flex: none; display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; padding: 3px; border: 0; border-radius: var(--vscode-cornerRadius-medium, 6px); background: transparent; color: var(--vscode-icon-foreground); cursor: pointer; }
body .vsc-action:hover { background: var(--vscode-toolbar-hoverBackground); outline: 1px dashed var(--vscode-toolbar-hoverOutline, transparent); outline-offset: -1px; }
body .vsc-action:active { background: var(--vscode-toolbar-activeBackground); }
body .vsc-action:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
/* Existing settings/footer controls retain their dialogs, events and focus return. */
body .vsc-global-actions [data-slot='settings.trigger'] > button,
body .vsc-global-actions :is([class*="_triggerRow_"], [class$="_triggerRow"], [class*="_triggerRow "]),
body .vsc-global-actions :is([class*="_trigger_"], [class$="_trigger"], [class*="_trigger "]):not([data-shortcut-modal] *) {
  box-sizing: border-box; width: 48px; height: 48px; margin: 0; padding: 0;
  display: flex; align-items: center; justify-content: center; border-radius: 0;
}
body .vsc-global-actions [data-slot='settings.trigger'] svg { width: 24px; height: 24px; }
body .vsc-global-actions [data-slot='settings.trigger'] :is([class*="_label_"], [class$="_label"], [class*="_label "]) { display: none; }
body .vsc-global-actions :is([class*="_rail_"], [class$="_rail"], [class*="_rail "]) { margin-left: 0; transform: none; }
body .vsc-global-actions :is([class*="_trigger_"], [class$="_trigger"], [class*="_trigger "]):not([data-shortcut-modal] *) { position: relative; background: transparent; color: var(--vscode-activityBar-inactiveForeground); }
body .vsc-global-actions :is([class*="_trigger_"], [class$="_trigger"], [class*="_trigger "]):not([data-shortcut-modal] *):is(:hover, :focus-visible, [aria-expanded='true']) { background: transparent; color: var(--vscode-activityBar-foreground); }
body .vsc-global-actions :is([class*="_trigger_"], [class$="_trigger"], [class*="_trigger "]):not([data-shortcut-modal] *):focus-visible { outline: none; }
body .vsc-global-actions :is([class*="_trigger_"], [class$="_trigger"], [class*="_trigger "]):not([data-shortcut-modal] *):focus-visible::before { content: ''; position: absolute; inset: 0 auto 0 0; border-left: 2px solid var(--vscode-contrastActiveBorder, var(--vscode-focusBorder)); }
.vsc-leading { display: flex; height: 35px; align-items: center; gap: 4px; }
body [data-slot='sidebar'] :is([class*="_sectionHeader_"], [class$="_sectionHeader"], [class*="_sectionHeader "]) { background: var(--vscode-sideBarSectionHeader-background); }
body [data-slot='sidebar'] :is([class*="_sectionLabel_"], [class$="_sectionLabel"], [class*="_sectionLabel "]) { padding-left: 8px; }
body [data-slot='sidebar'] [data-vsc-tree] { scrollbar-width: thin; scrollbar-color: var(--vscode-scrollbarSlider-background) transparent; }
body [data-slot='sidebar'] [data-vsc-tree] [data-row-key] :is([class*="_title_"], [class$="_title"], [class*="_title "]) { white-space: nowrap; text-overflow: ellipsis; }
/* Desktop titlebar traffic lights keep their native drag clearance. */
html[data-platform='darwin'] .vsc-sidebar { padding-top: 36px; }
@media (prefers-reduced-motion: reduce) { .vsc-sidebar * { scroll-behavior: auto; } }
@media (forced-colors: active) {
  body .vsc-activity[aria-current]::before { border-color: Highlight; }
  body [data-vsc-tree] [aria-selected='true'] { outline: 1px solid Highlight; }
}

.vsc-workspace-view[hidden], .vsc-side-panel[hidden] { display: none; }
.vsc-side-panel { flex: 1; min-height: 0; min-width: 0; overflow: auto; }
.vsc-side-panel > [data-slot='main'] { height: 100%; min-height: 0; min-width: 0; }
.vsc-side-panel { --dsh-frame-top-clearance: 0px; }
body .vsc-side-panel [data-plugin-panel] { padding: 0 8px 12px; gap: 12px; background: var(--vscode-sideBar-background); }
body .vsc-side-panel :is(:is([class*="_pageHead_"], [class$="_pageHead"], [class*="_pageHead "]), :is([class*="_pageHeading_"], [class$="_pageHeading"], [class*="_pageHeading "])) { flex-direction: column; align-items: stretch; gap: 8px; margin: 0 0 12px; padding: 0; }
body .vsc-side-panel :is(:is([class*="_pageTitle_"], [class$="_pageTitle"], [class*="_pageTitle "]), :is([class*="_pageHeading_"], [class$="_pageHeading"], [class*="_pageHeading "]) h1) { display: none; }
body .vsc-side-panel :is([class*="_pageIntro_"], [class$="_pageIntro"], [class*="_pageIntro "]) { font-size: 12px; }
body .vsc-side-panel :is([class*="_toolbar_"], [class$="_toolbar"], [class*="_toolbar "]) { justify-content: flex-start; gap: 8px; }
body .vsc-side-panel :is([class*="_cardHead_"], [class$="_cardHead"], [class*="_cardHead "]) { flex-wrap: wrap; gap: 8px; padding: 8px 0; }
body .vsc-side-panel :is([class*="_cardIcon_"], [class$="_cardIcon"], [class*="_cardIcon "]) { width: 32px; height: 32px; }
body .vsc-side-panel :is(:is([class*="_cardDescription_"], [class$="_cardDescription"], [class*="_cardDescription "]), :is([class*="_cardMeta_"], [class$="_cardMeta"], [class*="_cardMeta "]), :is([class*="_cardPackage_"], [class$="_cardPackage"], [class*="_cardPackage "])) { overflow-wrap: anywhere; }
body .vsc-side-panel :is([class*="_pageContent_"], [class$="_pageContent"], [class*="_pageContent "]) { padding: 0 8px 12px; }
body .vsc-side-panel :is([class*="_page_"], [class$="_page"], [class*="_page "]) { font-size: 13px; background: var(--vscode-sideBar-background); }
body .vsc-side-panel :is([class*="_creationActions_"], [class$="_creationActions"], [class*="_creationActions "]) { gap: 8px; }
body .vsc-side-panel :is([class*="_filterTabs_"], [class$="_filterTabs"], [class*="_filterTabs "]) { gap: 2px; }
body .vsc-side-panel :is([class*="_filterTab_"], [class$="_filterTab"], [class*="_filterTab "]) { height: 22px; padding: 0 6px; border-radius: 0; font-size: 12px; }
body .vsc-side-panel :is([class*="_searchField_"], [class$="_searchField"], [class*="_searchField "]) { height: 26px; margin-bottom: 8px; padding: 0 6px; border-radius: 4px; }
body .vsc-side-panel :is([class*="_newButton_"], [class$="_newButton"], [class*="_newButton "]) { height: 26px; border-radius: 4px; font-size: 12px; }
body .vsc-side-panel :is([class*="_detailPane_"], [class$="_detailPane"], [class*="_detailPane "]) { max-width: 100%; min-width: 0; }
`;

// src/assistant.css
var assistant_default = `/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: Pane, ActionBar, Theme
 * Adaptation: Flat output surfaces and compact actions for DSH replies, code, and progress reports. Keep native prose and behavior; Chat composition is project-specific.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
/* Reply prose keeps DSH's reading sizes; inline code remains part of the line. */
body [data-chat-flow-kind='assistant-step'] :is([class*="_markdown_"], [class$="_markdown"], [class*="_markdown "]) :not(pre) > code {
  display: inline;
  border: 0;
  border-radius: 0;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  overflow-wrap: anywhere;
}

body [data-chat-flow-kind='assistant-step'] :is([class*="_markdown_"], [class$="_markdown"], [class*="_markdown "]) :is(a, :is([class*="_fileMention_"], [class$="_fileMention"], [class*="_fileMention "])):focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color);
  outline-offset: 2px;
  box-shadow: none;
}

/* The same primitive renders chat fences and Markdown document previews. The
   renderer still owns highlighting, sticky banners, wrapping, and copying. */
body .md-code-block {
  --dsl-code-block-border-radius: 0px;
  --dsl-code-block-background: var(--dsw-alias-markdown-code-block);
  --dsl-code-block-banner-background-color: var(--dsw-alias-markdown-code-block-banner);
}

/* One quiet frame per output, with the same inset as expanded tool results. */
body [data-chat-flow-kind='assistant-step'] .md-code-block {
  box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l3);
  box-shadow: none;
}

/* CodeToolbar is also used by the read and diff tool cards. Keep its UI type
   independent of the document/code font and leave the sticky wrapper intact. */
body :is(.md-code-block, [data-read], [data-diff]) [data-code-block-banner] {
  box-sizing: border-box;
  min-height: 28px;
  padding: 3px 8px 3px 12px;
  gap: 8px;
  border-radius: 0;
  border-bottom: 1px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-markdown-code-block-banner);
  color: var(--vscode-descriptionForeground);
  font: 11px/18px var(--dsw-font-family);
}

body :is(.md-code-block, [data-read], [data-diff]) [data-code-block-banner] :is([class*="_actions_"], [class$="_actions"], [class*="_actions "]) {
  gap: 4px;
}

body :is(.md-code-block, [data-read], [data-diff]) [data-code-block-banner] button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  height: 22px;
  padding: 3px;
  border: 0;
  border-radius: var(--vscode-cornerRadius-medium, 6px);
  color: var(--vscode-icon-foreground);
  background: transparent;
  font: 11px/16px var(--dsw-font-family);
}

body :is(.md-code-block, [data-read], [data-diff]) [data-code-block-banner] button:is([class*="_action_"], [class$="_action"], [class*="_action "]) {
  width: 22px;
}

body :is(.md-code-block, [data-read], [data-diff]) [data-code-block-banner] button svg {
  width: 16px;
  height: 16px;
}

body :is(.md-code-block, [data-read], [data-diff]) [data-code-block-banner] button:hover:not(:disabled) {
  background: var(--vscode-toolbar-hoverBackground);
  outline: 1px dashed var(--vscode-toolbar-hoverOutline, transparent);
  outline-offset: -1px;
}

body :is(.md-code-block, [data-read], [data-diff]) [data-code-block-banner] button:active:not(:disabled) {
  background: var(--vscode-toolbar-activeBackground, var(--vscode-toolbar-hoverBackground));
}

body :is(.md-code-block, [data-read], [data-diff]) [data-code-block-banner] button:focus-visible {
  outline: 1px solid var(--vscode-focusBorder);
  outline-offset: -1px;
  box-shadow: none;
}

body .md-code-block [data-code-block-content] pre {
  padding: 12px;
}

body [data-document-frontmatter] {
  border-width: 1px;
  border-radius: 0;
}

/* Progress is a normal transcript block, not an elevated floating card. */
body [data-chat-flow-kind='progress-check'] .dsh-progress-check {
  grid-template-columns: minmax(0, 1fr) 22px;
  padding: 8px 12px;
  border: 1px solid var(--dsw-alias-border-l3);
  border-radius: 0;
  box-shadow: none;
  background: var(--dsw-alias-bg-base);
}

body .dsh-progress-check dl { gap: 4px 12px; }
body .dsh-progress-check dt { font-size: 12px; color: var(--vscode-descriptionForeground); }
body .dsh-progress-check .dsh-progress-check-toggle {
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  min-height: 22px;
  padding: 3px;
  border: 0;
  border-radius: var(--vscode-cornerRadius-medium, 6px);
  background: transparent;
}
body .dsh-progress-check .dsh-progress-check-toggle:hover { background: var(--vscode-toolbar-hoverBackground); }
body .dsh-progress-check .dsh-progress-check-toggle:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }

/* Completed-turn actions are compact chrome, independent of the prose font size. */
body [data-turn-tail] [data-clock='end'] {
  height: 22px;
  gap: 4px;
  margin-left: -3px;
}

body [data-turn-tail] [data-clock='end'] button:is([class*="_action_"], [class$="_action"], [class*="_action "]) {
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  padding: 3px;
  border-radius: var(--vscode-cornerRadius-medium, 6px);
  color: var(--vscode-icon-foreground);
}

body [data-turn-tail] [data-clock='end'] button:is([class*="_action_"], [class$="_action"], [class*="_action "]) svg {
  width: 16px;
  height: 16px;
}

body [data-turn-tail] [data-clock='end'] button:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color);
  outline-offset: -1px;
}

body [data-turn-tail] [data-clock='end'] button:is([class*="_action_"], [class$="_action"], [class*="_action "]):hover:not([data-unavailable]) {
  background: var(--vscode-toolbar-hoverBackground);
}

body [data-turn-tail] [data-clock='end'] button:is([class*="_action_"], [class$="_action"], [class*="_action "]):active:not([data-unavailable]) {
  background: var(--vscode-toolbar-activeBackground, var(--vscode-toolbar-hoverBackground));
}

body [data-turn-tail] :is([class*="_endInfo_"], [class$="_endInfo"], [class*="_endInfo "]) {
  gap: 4px;
  margin-left: 8px;
  color: var(--dsw-alias-label-caption);
}

body [data-turn-tail] :is([class*="_timeEnd_"], [class$="_timeEnd"], [class*="_timeEnd "]) {
  font: 11px/22px var(--dsw-font-family);
  font-variant-numeric: tabular-nums;
}
`;

// src/process.css
var process_default = `/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: Pane, ActionBar, Theme
 * Adaptation: Apply Classic action feedback and frame treatment to DSH tool disclosures. Keep DSH expansion, result rendering and terminal output; complete Chat and terminal implementations are outside the reference.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
/* DSH owns disclosure density, font preferences, and expansion policy. */
body :is([data-step-process], [data-tool], [data-slot='tool.call.toolview']) :is(button, [role='button'], summary):focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color);
  outline-offset: -1px;
}

/* Avoid a second vertical viewport around an opened tool's own viewport. */
body [data-step-process-body]:has(:is([data-terminal], [data-slot="tool.call.toolview"] [aria-expanded="true"])) {
  max-height: none;
  overflow: visible;
  scrollbar-gutter: auto;
  mask-image: none;
}

body :is([data-tool], [data-slot='tool.call.toolview']) :is([data-terminal], [data-read], [data-diff], [data-search], [data-web], :is([class*="_ioCard_"], [class$="_ioCard"], [class*="_ioCard "])),
body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_detailsBodyWrap_"], [class$="_detailsBodyWrap"], [class*="_detailsBodyWrap "]) > :is([class*="_root_"], [class$="_root"], [class*="_root "]) {
  --dsl-search-radius: 0px;
  --dsl-web-radius: 0px;
  box-sizing: border-box;
  min-width: 0;
  margin: 4px 0 4px 22px;
  border: 1px solid var(--dsw-alias-border-l3);
  border-radius: 0;
  box-shadow: none;
}

/* Every expanded tool body starts under its title; terminal and IO cards
   should not be the only variants with this inset. */
body :is([data-tool], [data-slot='tool.call.toolview']) :is(:is([class*="_codeBody_"], [class$="_codeBody"], [class*="_codeBody "]), :is([class*="_imageBody_"], [class$="_imageBody"], [class*="_imageBody "]), :is([class*="_searchRecovery_"], [class$="_searchRecovery"], [class*="_searchRecovery "])) {
  margin-left: 22px;
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-read] > :is([class*="_body_"], [class$="_body"], [class*="_body "]) {
  padding: 10px 12px 12px;
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-diff] > :is([class*="_body_"], [class$="_body"], [class*="_body "]) {
  padding-block: 10px 12px;
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-diff] :is(:is([class*="_line_"], [class$="_line"], [class*="_line "]), :is([class*="_expand_"], [class$="_expand"], [class*="_expand "])) {
  padding-inline: 12px;
}

body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_ioCard_"], [class$="_ioCard"], [class*="_ioCard "]) {
  background: var(--dsw-alias-bg-base);
}

body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_ioSection_"], [class$="_ioSection"], [class*="_ioSection "]) {
  padding: 8px 12px;
  column-gap: 12px;
}

/* Detail cards already own the frame; nested code should not add another. */
body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_detailsBodyWrap_"], [class$="_detailsBodyWrap"], [class*="_detailsBodyWrap "]) .md-code-block {
  border: 0;
  box-shadow: none;
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-search] > :is([class*="_header_"], [class$="_header"], [class*="_header "]) {
  min-height: 28px;
  padding: 3px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l3);
  border-radius: 0;
}

body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_ioDivider_"], [class$="_ioDivider"], [class*="_ioDivider "]) {
  height: 1px;
}

body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_inspectButton_"], [class$="_inspectButton"], [class*="_inspectButton "]) {
  box-sizing: border-box;
  height: 22px;
  margin-left: 22px;
  padding: 0 4px;
  border: 0;
  border-radius: var(--vscode-cornerRadius-medium, 6px);
  font: 11px/22px var(--dsw-font-family);
}

/* Detail cards place Inspect at the top-right, outside the disclosure target. */
body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_detailsBodyWrap_"], [class$="_detailsBodyWrap"], [class*="_detailsBodyWrap "]) > :is([class*="_inspectButton_"], [class$="_inspectButton"], [class*="_inspectButton "]) {
  top: 6px;
  right: 6px;
  margin: 0;
}

body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_inspectButton_"], [class$="_inspectButton"], [class*="_inspectButton "]) svg {
  width: 16px;
  height: 16px;
}

body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_inspectButton_"], [class$="_inspectButton"], [class*="_inspectButton "]):hover {
  background: var(--vscode-toolbar-hoverBackground);
  color: var(--vscode-foreground);
}

body :is([data-tool], [data-slot='tool.call.toolview']) :is([class*="_inspectButton_"], [class$="_inspectButton"], [class*="_inspectButton "]):active {
  background: var(--vscode-toolbar-activeBackground, var(--vscode-toolbar-hoverBackground));
}

body :is([data-tool], [data-slot='tool.call.toolview']):focus-within :is([class*="_inspectButton_"], [class$="_inspectButton"], [class*="_inspectButton "]) {
  opacity: 1;
}

/* Static terminal: 20px decoration gutter, square frame, preserved output columns. */
body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] {
  --dsl-terminal-radius: 0px;
  --dsl-terminal-gutter: 20px;
  --dsl-terminal-command-whitespace: pre-wrap;
  background: var(--vsc-terminal-background);
  color: var(--vsc-terminal-foreground);
  letter-spacing: 0;
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] > :is([class*="_header_"], [class$="_header"], [class*="_header "]) {
  padding-block: 6px;
  padding-right: 8px;
  gap: 8px;
  border-radius: 0;
  background: var(--dsw-specific-sidebar-fill);
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal][data-body] > :is([class*="_header_"], [class$="_header"], [class*="_header "]) {
  border-bottom: 1px solid var(--dsw-alias-border-l3);
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_command_"], [class$="_command"], [class*="_command "]) {
  flex: 1;
  overflow-x: hidden;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_cwd_"], [class$="_cwd"], [class*="_cwd "]) {
  max-width: 30%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-caption);
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_runState_"], [class$="_runState"], [class*="_runState "]) {
  top: calc(var(--dsl-terminal-line-height) / 2);
  left: calc(-1 * var(--dsl-terminal-gutter) + 2px);
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_copyButton_"], [class$="_copyButton"], [class*="_copyButton "]) {
  padding-inline: 4px;
  border-radius: var(--vscode-cornerRadius-medium, 6px);
  background: var(--dsw-specific-sidebar-fill);
  font: 11px/var(--dsl-terminal-line-height) var(--dsw-font-family);
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_copyButton_"], [class$="_copyButton"], [class*="_copyButton "]):hover {
  background: var(--vscode-toolbar-hoverBackground);
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_copyButton_"], [class$="_copyButton"], [class*="_copyButton "]):active {
  background: var(--vscode-toolbar-activeBackground, var(--vscode-toolbar-hoverBackground));
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_status_"], [class$="_status"], [class*="_status "]) {
  border-radius: 2px;
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_output_"], [class$="_output"], [class*="_output "]) {
  box-sizing: border-box;
  line-height: var(--dsl-terminal-line-height);
}

body :is([data-tool], [data-slot='tool.call.toolview']) [data-terminal] :is([class*="_line_"], [class$="_line"], [class*="_line "]) {
  white-space: pre;
  overflow-wrap: normal;
}
`;

// src/dock.css
var dock_default = `/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: EditorTabs, PanelTitle, CompositeBar, ActionBar, Radio, SettingsEditor
 * Adaptation: DSH open items use EditorTabs, content views use PanelTitle, settings scopes use SettingsEditor, and compact choices use segmented Radio.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
/* The dock owns open items. Its active-pane state distinguishes the focused
   editor group from other groups without confusing selection with DOM focus. */
body [data-dockkit-strip] {
  --vsc-dock-tab-background: var(--vscode-tab-inactiveBackground);
  --vsc-dock-tab-foreground: var(--vscode-tab-inactiveForeground);
  --vsc-dock-tab-active-background: var(--vscode-tab-activeBackground);
  --vsc-dock-tab-active-foreground: var(--vscode-tab-activeForeground);
  --vsc-dock-tab-active-border: var(--vscode-tab-activeBorder);
  --vsc-dock-tab-active-border-top: var(--vscode-tab-activeBorderTop);
  --vsc-dock-tab-hover-background: var(--vscode-tab-hoverBackground);
  --vsc-dock-tab-hover-foreground: var(--vscode-tab-hoverForeground);
  --vsc-dock-action-opacity: 1;
  box-sizing: border-box; height: 35px; min-height: 35px;
  padding: 0 8px 0 max(0px, calc(var(--dsh-dockkit-strip-inline-start, 10px) - 10px));
  gap: 0; border-radius: 0;
  background: var(--vscode-editorGroupHeader-tabsBackground);
  box-shadow: inset 0 -1px var(--vscode-editorGroupHeader-tabsBorder);
}
body [data-dockkit-pane]:not([data-dockkit-pane-active='true']) [data-dockkit-strip] {
  --vsc-dock-tab-background: var(--vscode-tab-unfocusedInactiveBackground);
  --vsc-dock-tab-foreground: var(--vscode-tab-unfocusedInactiveForeground);
  --vsc-dock-tab-active-background: var(--vscode-tab-unfocusedActiveBackground);
  --vsc-dock-tab-active-foreground: var(--vscode-tab-unfocusedActiveForeground);
  --vsc-dock-tab-active-border: var(--vscode-tab-unfocusedActiveBorder);
  --vsc-dock-tab-active-border-top: var(--vscode-tab-unfocusedActiveBorderTop);
  --vsc-dock-tab-hover-background: var(--vscode-tab-unfocusedHoverBackground);
  --vsc-dock-tab-hover-foreground: var(--vscode-tab-unfocusedActiveForeground);
  --vsc-dock-action-opacity: .5;
}
body [data-dockkit-strip-tabs] { height: 35px; align-items: stretch; }
body [data-dockkit-strip-tabs][data-dockkit-strip-scroll] { mask-image: none; }
body [data-dockkit-tab] {
  box-sizing: border-box; flex: 0 0 auto; width: max-content; min-width: 120px; max-width: 170px;
  height: 35px; padding: 0 10px; border-radius: 0;
  border-right: 1px solid var(--vscode-tab-border);
  font: 13px/18px var(--dsw-font-family);
  color: var(--vsc-dock-tab-foreground); background: var(--vsc-dock-tab-background);
  box-shadow: none;
}
body [data-dockkit-tab]:has([data-dockkit-tab-close]) { padding-right: 28px; }
body [data-dockkit-tab][aria-selected='true'] {
  color: var(--vsc-dock-tab-active-foreground); background: var(--vsc-dock-tab-active-background);
  box-shadow: inset 0 1px var(--vsc-dock-tab-active-border-top), inset 0 -1px var(--vsc-dock-tab-active-border);
}
body [data-dockkit-tab]:hover {
  color: var(--vsc-dock-tab-hover-foreground); background: var(--vsc-dock-tab-hover-background);
}
body [data-dockkit-tab]:focus-visible {
  outline: 1px solid var(--vscode-focusBorder); outline-offset: -2px;
  box-shadow: none;
}
/* DockKit deliberately makes a lone, unclosable item a quiet pane label. */
body [data-dockkit-tab][data-dockkit-tab-quiet],
body [data-dockkit-tab][data-dockkit-tab-quiet]:hover {
  min-width: 0; color: var(--vscode-foreground); background: transparent;
  border-right: 0; box-shadow: none;
}
body [data-dockkit-strip] [data-dockkit-tab][role='tab'] [data-dockkit-tab-title] {
  min-width: 0; gap: 6px; line-height: 18px; mask-image: none;
}
body [data-dockkit-strip] [data-dockkit-tab][role='tab'] [data-dockkit-tab-title][data-dockkit-tab-clipped] {
  mask-image: linear-gradient(to right, black calc(100% - 5px), transparent);
}
body [data-dockkit-tab-title] svg { flex: none; width: 16px; height: 16px; }
body [data-dockkit-tab-close] {
  box-sizing: border-box; width: 20px; height: 20px; padding: 2px;
  top: 50%; right: 4px; transform: translateY(-50%); border: 0; border-radius: 6px;
  color: inherit; background: transparent;
}
body [data-dockkit-tab]:is([aria-selected='true'], :hover, :focus-within) [data-dockkit-tab-close] { opacity: var(--vsc-dock-action-opacity); }
body [data-dockkit-tab-close]:hover { background: var(--vscode-toolbar-hoverBackground); }
body [data-dockkit-tab-close] svg { width: 16px; height: 16px; }

/* The existing insertion marker keeps its location without creating tab gaps. */
body [data-dockkit-strip-tabs] > :is([class*="_slot_"], [class$="_slot"], [class*="_slot "]) {
  position: relative; width: 0; height: 35px;
}
body [data-dockkit-strip-tabs] > :is([class*="_slot_"], [class$="_slot"], [class*="_slot "])::before { display: none; }
body [data-dockkit-strip-tabs] > [data-dockkit-caret]::before {
  display: block; position: absolute; left: -1px; width: 2px; height: 20px;
}

/* Fixed-size actions stay outside the tab scroller. */
body [data-dockkit-strip-chrome] { height: 35px; margin-left: 0; gap: 4px; }
body [data-dockkit-strip] :is([data-dockkit-add-tab], [data-dockkit-split-button]),
body [data-dockkit-strip-chrome] > button {
  box-sizing: border-box; width: 22px; height: 22px; padding: 3px;
  border: 0; border-radius: 6px; color: var(--vscode-icon-foreground);
  background: transparent;
}
body [data-dockkit-strip] :is([data-dockkit-add-tab], [data-dockkit-split-button]):hover:not(:disabled),
body [data-dockkit-strip-chrome] > button:hover:not(:disabled) {
  background: var(--vscode-toolbar-hoverBackground);
}
body [data-dockkit-add-tab] { margin-left: 4px; }
body [data-dockkit-strip] > span:has([data-dockkit-split-button]) {
  display: flex; flex: none; align-items: center; margin-left: 4px; margin-right: 4px;
}
body [data-dockkit-strip] :is([data-dockkit-add-tab], [data-dockkit-split-button]) svg,
body [data-dockkit-strip-chrome] > button svg { width: 16px; height: 16px; }
body [data-dockkit-strip] button:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color); outline-offset: -1px;
}
body [data-dockkit-host='dock'] { border-radius: 0; box-shadow: none; }

body [data-dockkit-strip-chrome] [data-sidebar-right-toggle] svg { transform: none; }
body [data-dockkit-tab-title] :is([class*="_folder_"], [class$="_folder"], [class*="_folder "]) { color: inherit; }

/* Session views and inspector detail pages use PanelTitle's compact text
   tabs. Stable item attributes keep this separate from segmented choices. */
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab]))) {
  display: flex; align-items: stretch; box-sizing: border-box; height: 35px;
  min-width: 0; gap: 0; margin: 0; padding: 0 8px; border: 0;
  overflow-x: auto; overflow-y: hidden; scrollbar-width: none;
  background: transparent;
}
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab])))::-webkit-scrollbar { display: none; }
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab]))) [role='tab'] {
  position: relative; box-sizing: border-box; flex: 0 0 auto; min-width: 0; height: 35px;
  padding: 0 10px; border: 0; border-radius: 0;
  font: 11px/27px var(--dsw-font-family); text-transform: uppercase;
  white-space: nowrap; color: var(--vscode-panelTitle-inactiveForeground);
  background: transparent; box-shadow: none;
}
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab]))) [role='tab']::after {
  content: ''; display: block; position: absolute;
  left: 10px; right: 10px; bottom: 5px; height: 1px; border-radius: 0;
  background: transparent; pointer-events: none;
}
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab]))) [role='tab'][aria-selected='true'] {
  color: var(--vscode-panelTitle-activeForeground); background: transparent; box-shadow: none;
}
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab]))) [role='tab'][aria-selected='true']::after { background: var(--vscode-panelTitle-activeBorder); }
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab]))) [role='tab']:is(:hover, :focus-visible) { color: var(--vscode-panelTitle-activeForeground); }
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab]))) [role='tab']:focus-visible { outline: none; }
body :is([data-conversation-tabs], [role='tablist']:has(> :is([id^='trajectory-detail-'], [data-detail-tab]))) [role='tab']:focus-visible::after { height: 2px; background: var(--vscode-focusBorder); }

/* The 8px strip inset + 10px item inset aligns with the session heading. */
body [data-conversation-tabs] { margin: 0 -28px 0 -20px; }
body [role='tablist']:has(> [id^='trajectory-detail-']) { border-bottom: 1px solid var(--vscode-panel-border); }
body :is([class*="_detailTabsBar_"], [class$="_detailTabsBar"], [class*="_detailTabsBar "]):has(> [role='tablist'] > [data-detail-tab]) {
  box-sizing: border-box; height: 35px; min-height: 35px; padding: 0 8px; gap: 8px;
  border-bottom: 1px solid var(--vscode-panel-border);
}
body [role='tablist']:has(> [data-detail-tab]) { align-self: stretch; padding: 0; }
body :is([class*="_detailTabsBar_"], [class$="_detailTabsBar"], [class*="_detailTabsBar "]):has(> [role='tablist'] > [data-detail-tab]) :is([class*="_detailActions_"], [class$="_detailActions"], [class*="_detailActions "]) { margin-right: 0; }
body :is([class*="_detailTabsBar_"], [class$="_detailTabsBar"], [class*="_detailTabsBar "]):has(> [role='tablist'] > [data-detail-tab]) :is([class*="_detailIconButton_"], [class$="_detailIconButton"], [class*="_detailIconButton "]) {
  box-sizing: border-box; width: 22px; height: 22px; padding: 3px; border-radius: 6px;
}
body :is([class*="_detailTabsBar_"], [class$="_detailTabsBar"], [class*="_detailTabsBar "]):has(> [role='tablist'] > [data-detail-tab]) :is([class*="_detailIconButton_"], [class$="_detailIconButton"], [class*="_detailIconButton "]) svg { width: 16px; height: 16px; }

/* Plugin settings changes configuration scope, using SettingsEditor's
   sentence-case 13px tabs with the bottom rule across the whole label box. */
body [data-shortcut-modal='settings'] :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "])[role='tablist']:has(> [role='tab'][data-active]) {
  display: flex; align-items: stretch; min-width: 0; height: 35px;
  gap: 0; margin-top: 0; padding: 0; border-bottom: 1px solid var(--vscode-settings-headerBorder);
}
body [data-shortcut-modal='settings'] :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "])[role='tablist']:has(> [role='tab'][data-active]) > [role='tab'] {
  box-sizing: border-box; position: relative; height: 35px; padding: 7px 8px 6px;
  border: 0; border-radius: 0; font: 13px/20px var(--dsw-font-family); text-transform: none;
  color: var(--vscode-foreground); background: transparent; opacity: .9; box-shadow: none;
}
body [data-shortcut-modal='settings'] :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "])[role='tablist']:has(> [role='tab'][data-active]) > [role='tab']::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0;
  height: 1px; border-radius: 0; background: transparent;
}
body [data-shortcut-modal='settings'] :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "])[role='tablist']:has(> [role='tab'][data-active]) > [role='tab']:is(:hover, [aria-selected='true']) {
  opacity: 1; color: var(--vscode-settings-headerForeground, var(--vscode-foreground));
}
body [data-shortcut-modal='settings'] :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "])[role='tablist']:has(> [role='tab'][data-active]) > [role='tab'][aria-selected='true']::after {
  background: var(--vscode-settings-headerForeground, var(--vscode-foreground));
}
body [data-shortcut-modal='settings'] :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "])[role='tablist']:has(> [role='tab'][data-active]) > [role='tab']:focus-visible { outline: none; opacity: 1; }
body [data-shortcut-modal='settings'] :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "])[role='tablist']:has(> [role='tab'][data-active]) > [role='tab']:focus-visible::after { background: var(--vscode-focusBorder); }

/* Both native segmented primitives retain their equal-width layout and
   keyboard selection. Paint the active segment in place so an old sliding
   indicator cannot retain the host's 4px inset or elevated pill geometry. */
body :is(:is([class*="_control_"], [class$="_control"], [class*="_control "]), :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "]):has(> :is([class*="_indicator_"], [class$="_indicator"], [class*="_indicator "])))[role='tablist'] {
  box-sizing: border-box; align-items: center; gap: 2px; padding: 2px;
  border: 1px solid var(--vscode-contrastBorder, var(--vscode-radio-inactiveBorder, transparent));
  border-radius: 6px; background: transparent;
}
body :is(:is([class*="_control_"], [class$="_control"], [class*="_control "]), :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "]):has(> :is([class*="_indicator_"], [class$="_indicator"], [class*="_indicator "])))[role='tablist'] > :is([class*="_indicator_"], [class$="_indicator"], [class*="_indicator "]) { display: none; }
body :is(:is([class*="_control_"], [class$="_control"], [class*="_control "]), :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "]):has(> :is([class*="_indicator_"], [class$="_indicator"], [class*="_indicator "])))[role='tablist'] > [role='tab'] {
  box-sizing: border-box; display: inline-flex; justify-content: center; align-items: center;
  min-width: 0; height: 24px; padding: 0 6px; margin: 0;
  border: 1px solid transparent; border-radius: 4px;
  font: 11px/16px var(--dsw-font-family); color: var(--vscode-foreground);
  background: transparent; box-shadow: none; text-decoration: none; transition: none;
}
body :is(:is([class*="_control_"], [class$="_control"], [class*="_control "]), :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "]):has(> :is([class*="_indicator_"], [class$="_indicator"], [class*="_indicator "])))[role='tablist'] > [role='tab']:not([aria-selected='true']):hover:not(:disabled) { background: var(--vscode-toolbar-hoverBackground); }
body :is(:is([class*="_control_"], [class$="_control"], [class*="_control "]), :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "]):has(> :is([class*="_indicator_"], [class$="_indicator"], [class*="_indicator "])))[role='tablist'] > [role='tab'][aria-selected='true'] {
  background: color-mix(in srgb, var(--vscode-foreground) 10%, transparent);
  color: var(--vscode-foreground); border-color: var(--vscode-contrastActiveBorder, transparent); font-weight: 600;
}
body :is(:is([class*="_control_"], [class$="_control"], [class*="_control "]), :is([class*="_tabs_"], [class$="_tabs"], [class*="_tabs "]):has(> :is([class*="_indicator_"], [class$="_indicator"], [class*="_indicator "])))[role='tablist'] > [role='tab']:focus-visible {
  outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; text-decoration: none;
}
`;

// src/selectors.js
var nativeClass = (name) => `:is([class*="_${name}_"], [class$="_${name}"], [class*="_${name} "])`;

// src/tree.js
var rowSelector = '[role="treeitem"], [data-row-key^="overflow:"]';
var groupSelector = '[style*="--dsh-workspace-indent"]';
var titleSelector = `${nativeClass("title")}, ${nativeClass("searchResultTitle")}`;
var menuTriggerSelector = `button[aria-haspopup="menu"], button[aria-haspopup="true"], ${nativeClass("rowActions")} > ${nativeClass("root")} > button`;
function enhanceSidebarTree(document2) {
  const view = document2.defaultView;
  if (!view) return () => {
  };
  const owned = /* @__PURE__ */ new Map();
  let trees = /* @__PURE__ */ new Map();
  const remembered = /* @__PURE__ */ new WeakMap();
  const nativeRows = /* @__PURE__ */ new WeakMap();
  const ownSelectionWrites = /* @__PURE__ */ new WeakMap();
  const nativeChanges = /* @__PURE__ */ new Set();
  let toggling;
  let observer;
  let scheduled = false;
  let disposed = false;
  let typed = "";
  let typedAt = 0;
  let openFocus;
  let restoringFocus = false;
  function nativeRow(row) {
    let native = nativeRows.get(row);
    if (!native) {
      const aria = row.getAttribute("aria-selected");
      const selectedClass = row.matches(nativeClass("selected"));
      nativeRows.set(row, native = { aria, selectedClass, selected: selectedClass || aria === "true" });
    }
    return native;
  }
  function write(element, name, value) {
    const before = element.getAttribute(name);
    if (before === value) return;
    if (name === "aria-selected" && observer && document2.body.contains(element)) {
      let writes = ownSelectionWrites.get(element);
      if (!writes) ownSelectionWrites.set(element, writes = []);
      writes.push({ before, value });
    }
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }
  function attr(element, name, value) {
    let entry = owned.get(element);
    if (!entry) owned.set(element, entry = /* @__PURE__ */ new Map());
    let record = entry.get(name);
    if (!record) entry.set(name, record = { before: element.getAttribute(name), value });
    record.value = value;
    write(element, name, value);
  }
  function restore(element, records) {
    for (const [name, { before, value }] of records) {
      if (element.getAttribute(name) !== value) continue;
      write(element, name, before);
    }
  }
  const identity = (row) => row?.dataset.rowKey || row;
  function select(tree, row) {
    const state = trees.get(tree);
    if (!state) return;
    state.selected = identity(row);
    state.localSelection = true;
    for (const item of state.rows) attr(item, "aria-selected", String(identity(item) === state.selected));
  }
  function toggle(row) {
    toggling = row;
    try {
      row.click();
    } finally {
      toggling = void 0;
    }
  }
  function focus(tree, row, reveal = false) {
    if (!row) return;
    const state = trees.get(tree);
    if (!state) return;
    if (openFocus?.tree === tree) openFocus.awaitingReveal = false;
    state.focused = row;
    state.current = row;
    for (const item of state.rows) {
      attr(item, "tabindex", item === row ? "0" : "-1");
      attr(item, "data-vsc-tree-focused", String(item === row));
    }
    row.focus({ preventScroll: true });
    if (reveal) row.scrollIntoView?.({ block: "nearest" });
  }
  function refresh() {
    scheduled = false;
    if (disposed) return;
    readMutations(observer?.takeRecords() ?? []);
    const next = /* @__PURE__ */ new Map();
    const alive = /* @__PURE__ */ new Set();
    for (const tree of document2.querySelectorAll('[data-slot="sidebar"] [role="tree"]')) {
      const rows = [...tree.querySelectorAll(rowSelector)].filter((row) => !row.closest('[hidden], [inert], [aria-hidden="true"]'));
      if (!rows.length || tree.closest('[hidden], [inert], [aria-hidden="true"]')) continue;
      alive.add(tree);
      attr(tree, "data-vsc-tree", "");
      attr(tree, "aria-multiselectable", "false");
      attr(tree, "tabindex", "-1");
      const groups = new Map(rows.filter((row) => row.dataset.rowKey?.startsWith("workspace:")).map((row) => [row.closest(groupSelector), row]).filter(([group]) => group));
      const parents = /* @__PURE__ */ new Map();
      const levels = /* @__PURE__ */ new Map();
      for (const row of rows) {
        alive.add(row);
        nativeRow(row);
        if (row.dataset.rowKey?.startsWith("overflow:")) attr(row, "role", "treeitem");
        const group = row.closest(groupSelector);
        const parentGroup = groups.get(group) === row ? group?.parentElement.closest(groupSelector) : group;
        parents.set(row, groups.get(parentGroup));
        let level = 1;
        for (let ancestor = parentGroup; groups.has(ancestor); ancestor = ancestor.parentElement.closest(groupSelector)) level++;
        levels.set(row, level);
        attr(row, "aria-level", String(level));
      }
      const previous = remembered.get(tree);
      const nativeSelected = rows.find((row) => nativeRow(row).selected);
      const nativeIdentity = identity(nativeSelected);
      const state = previous ?? { selected: nativeIdentity, nativeSelected: nativeIdentity, nativeRow: nativeSelected, localSelection: false };
      if (nativeSelected && nativeIdentity !== state.nativeSelected) {
        if (state.nativeSelected !== void 0 || !state.localSelection || nativeChanges.has(nativeSelected)) state.selected = nativeIdentity;
        state.nativeSelected = nativeIdentity;
      } else if (!nativeSelected && state.nativeRow && !nativeRow(state.nativeRow).selected) {
        state.nativeSelected = void 0;
        state.selected = void 0;
        state.nativeRow = void 0;
      }
      if (nativeSelected) state.nativeRow = nativeSelected;
      const retain = (row) => rows.includes(row) ? row : row?.dataset.rowKey ? rows.find((item) => item.dataset.rowKey === row.dataset.rowKey) : void 0;
      const active = rows.find((row) => row.contains(document2.activeElement));
      const focused = active ?? retain(previous?.focused);
      const current = focused ?? retain(previous?.current) ?? rows.find((row) => row.tabIndex === 0) ?? rows.find((row) => identity(row) === state.selected) ?? rows[0];
      attr(tree, "data-vsc-tree-active", String(active === document2.activeElement || tree === document2.activeElement));
      const siblingGroups = /* @__PURE__ */ new Map();
      for (const row of rows) {
        const parent = parents.get(row);
        if (!siblingGroups.has(parent)) siblingGroups.set(parent, []);
        siblingGroups.get(parent).push(row);
      }
      for (const row of rows) {
        attr(row, "aria-selected", String(identity(row) === state.selected));
        attr(row, "tabindex", row === current ? "0" : "-1");
        attr(row, "data-vsc-tree-focused", String(row === focused));
        const siblings = siblingGroups.get(parents.get(row));
        attr(row, "aria-posinset", String(siblings.indexOf(row) + 1));
        attr(row, "aria-setsize", String(siblings.length));
      }
      const guideOwners = new Set(rows.filter((row) => row === focused || row.getAttribute("aria-selected") === "true").map((row) => row.getAttribute("aria-expanded") === "true" ? row : parents.get(row)));
      for (const [group, row] of groups) {
        alive.add(group);
        attr(group, "data-vsc-tree-group", guideOwners.has(row) ? "active" : "inactive");
      }
      Object.assign(state, { rows, parents, levels, focused, current });
      next.set(tree, state);
      remembered.set(tree, state);
    }
    for (const button of document2.querySelectorAll(`[data-slot="sidebar"] button${nativeClass("newSession")}`)) {
      alive.add(button);
      if (button.hasAttribute("aria-label")) attr(button, "title", button.getAttribute("aria-label"));
    }
    for (const [element, records] of owned) {
      if (!alive.has(element)) {
        restore(element, records);
        owned.delete(element);
      }
    }
    trees = next;
    nativeChanges.clear();
    if (openFocus) {
      const state = trees.get(openFocus.tree);
      if (openFocus.key && state?.nativeSelected === openFocus.key) openFocus.previous = void 0;
      if (openFocus.awaitingReveal && state?.nativeRow && document2.activeElement === openFocus.tree) {
        openFocus.key = identity(state.nativeRow);
        openFocus.previous = void 0;
        focus(openFocus.tree, state.nativeRow);
      }
    }
  }
  function schedule() {
    if (scheduled || disposed) return;
    scheduled = true;
    view.queueMicrotask(refresh);
  }
  function focusin(event) {
    if (restoringFocus) return;
    if (openFocus && event.target.matches?.("[data-composer-input]")) {
      refresh();
      const tree = trees.has(openFocus.tree) ? openFocus.tree : [...trees.keys()][0];
      const state = trees.get(tree);
      const nativeKey = identity(state?.nativeRow);
      if (state && (!openFocus.key || !nativeKey || nativeKey === openFocus.key || nativeKey === openFocus.previous)) {
        const sameTree = tree === openFocus.tree;
        const row = sameTree ? state.current : state.nativeRow ?? state.current;
        openFocus.tree = tree;
        if (!sameTree && nativeKey) openFocus.key = nativeKey;
        restoringFocus = true;
        try {
          if ((!sameTree || openFocus.awaitingReveal) && !state.nativeRow) {
            openFocus.awaitingReveal = true;
            tree.focus({ preventScroll: true });
          } else focus(tree, row);
        } finally {
          restoringFocus = false;
        }
        schedule();
        return;
      }
      openFocus = void 0;
    } else if (openFocus && !event.target.matches?.('[data-vsc-tree], [data-vsc-tree] [role="treeitem"]')) {
      openFocus = void 0;
    }
    schedule();
  }
  function releaseOpenFocus(event) {
    if (event.type === "pointerdown" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !event.target.matches?.('[data-vsc-tree], [data-vsc-tree] [role="treeitem"]') || !(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", "Enter", "Escape", " "].includes(event.key) || event.key.length === 1)) {
      openFocus = void 0;
    }
  }
  function keydown(event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    const tree = event.target.closest?.("[data-vsc-tree]");
    const state = trees.get(tree);
    if (!state) return;
    const row = event.target === tree ? state.focused : event.target.closest?.(rowSelector);
    if (event.target !== tree && (!row || event.target !== row)) return;
    const { rows, parents, levels } = state;
    const index = rows.indexOf(row);
    let destination;
    switch (event.key) {
      case "ArrowDown":
        destination = rows[Math.min(index + 1, rows.length - 1)];
        break;
      case "ArrowUp":
        destination = rows[index < 0 ? 0 : Math.max(index - 1, 0)];
        break;
      case "Home":
        destination = rows[0];
        break;
      case "End":
        destination = rows.at(-1);
        break;
      case "ArrowRight":
        if (row?.getAttribute("aria-expanded") === "false") toggle(row);
        else if (row && levels.get(rows[index + 1]) > levels.get(row)) destination = rows[index + 1];
        break;
      case "ArrowLeft":
        if (row?.getAttribute("aria-expanded") === "true") toggle(row);
        else destination = parents.get(row);
        break;
      case "Enter":
        select(tree, row);
        if (row && !row.hasAttribute("aria-expanded") && !event.shiftKey) row.click();
        break;
      case " ":
        if (row?.hasAttribute("aria-expanded")) toggle(row);
        break;
      case "Escape":
        if (state.selected === void 0) return;
        select(tree);
        break;
      case "PageDown":
      case "PageUp": {
        const viewport = tree.clientHeight || tree.parentElement?.clientHeight || 220;
        const rowHeight = row?.getBoundingClientRect().height || 22;
        const delta = Math.max(1, Math.floor(viewport / rowHeight) - 1) * (event.key === "PageDown" ? 1 : -1);
        destination = rows[Math.max(0, Math.min(rows.length - 1, index + delta))];
        break;
      }
      case "ContextMenu":
      case "F10":
        if (event.key === "F10" && !event.shiftKey) return;
        const trigger = row?.querySelector(menuTriggerSelector);
        if (!trigger) return;
        trigger.focus({ preventScroll: true });
        trigger.click();
        break;
      default: {
        if (event.key.length !== 1) return;
        const now = Date.now();
        typed = now - typedAt > 800 ? event.key : typed + event.key;
        typedAt = now;
        const candidates = [...rows.slice(index + 1), ...rows.slice(0, index + 1)];
        destination = candidates.find((item) => (item.querySelector(titleSelector)?.textContent ?? item.textContent).trim().toLocaleLowerCase().startsWith(typed.toLocaleLowerCase()));
      }
    }
    event.preventDefault();
    event.stopPropagation();
    if (destination) focus(tree, destination, true);
    schedule();
  }
  function pointerdown(event) {
    const row = event.target.closest?.(rowSelector);
    const control = event.target.closest?.('button, input, a, textarea, select, [contenteditable="true"]');
    if (!row || control && control !== row || event.target.closest?.(nativeClass("rowActions"))) return;
    const tree = row.closest("[data-vsc-tree]");
    if (trees.has(tree)) focus(tree, row);
  }
  function click(event) {
    if (event.button !== 0) return;
    const row = event.target.closest?.(rowSelector);
    const control = event.target.closest?.('button, input, a, textarea, select, [contenteditable="true"]');
    if (control && control !== row || event.target.closest?.(nativeClass("rowActions"))) return;
    const tree = event.target.closest?.("[data-vsc-tree]") ?? event.target.closest?.(nativeClass("treeBody"))?.querySelector("[data-vsc-tree]");
    const state = trees.get(tree);
    if (!state || toggling === row) return;
    if (!row) {
      select(tree);
      state.focused = void 0;
      for (const item of state.rows) attr(item, "data-vsc-tree-focused", "false");
      tree.focus({ preventScroll: true });
    } else {
      focus(tree, row);
      if (!event.target.closest(nativeClass("chevron"))) select(tree, row);
      if (!row.hasAttribute("aria-expanded") && (event.shiftKey || event.ctrlKey || event.metaKey)) event.stopPropagation();
      else if (!row.hasAttribute("aria-expanded") && !row.dataset.rowKey?.startsWith("overflow:") && !row.matches(nativeClass("archived"))) {
        openFocus = { tree, key: row.dataset.rowKey, previous: state.nativeSelected };
      }
    }
    schedule();
  }
  function readMutations(records) {
    let changed = false;
    const later = /* @__PURE__ */ new Map();
    const values = /* @__PURE__ */ new Map();
    for (const record of [...records].reverse()) {
      if (record.type !== "attributes") continue;
      let attributes = later.get(record.target);
      if (!attributes) later.set(record.target, attributes = /* @__PURE__ */ new Map());
      values.set(record, attributes.has(record.attributeName) ? attributes.get(record.attributeName) : record.target.getAttribute(record.attributeName));
      attributes.set(record.attributeName, record.oldValue);
    }
    for (const record of records) {
      const row = record.target;
      if (record.type === "attributes" && record.attributeName === "aria-selected") {
        const value = values.get(record);
        const writes = ownSelectionWrites.get(row);
        if (writes?.[0]?.before === record.oldValue && writes[0].value === value) {
          writes.shift();
          continue;
        }
        if (!row.matches?.(rowSelector) || !nativeRows.has(row) && !row.closest('[data-slot="sidebar"]')) continue;
        const native = nativeRow(row);
        native.aria = value;
        native.selected = value === "true";
        const ownedAria = owned.get(row)?.get("aria-selected");
        if (ownedAria) ownedAria.before = value;
        nativeChanges.add(row);
      } else if (record.type === "attributes" && record.attributeName === "class") {
        if (!row.matches?.(rowSelector) || !nativeRows.has(row) && !row.closest('[data-slot="sidebar"]')) continue;
        const native = nativeRow(row);
        const selectedClass = (values.get(record) ?? "").split(/\s+/).some((value) => /(?:^|_)selected(?:_|$)/.test(value));
        if (selectedClass === native.selectedClass) continue;
        native.selectedClass = selectedClass;
        native.selected = selectedClass;
        nativeChanges.add(row);
      }
      if (row.closest?.('[data-slot="sidebar"]') || [...record.addedNodes].some((node) => node.nodeType === 1 && (node.matches('[data-slot="sidebar"]') || node.querySelector('[data-slot="sidebar"]')))) changed = true;
    }
    return changed;
  }
  observer = new view.MutationObserver((records) => {
    if (readMutations(records)) schedule();
  });
  observer.observe(document2.body, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["aria-selected", "aria-expanded", "class", "hidden"] });
  document2.addEventListener("keydown", keydown);
  document2.addEventListener("keydown", releaseOpenFocus, true);
  document2.addEventListener("pointerdown", releaseOpenFocus, true);
  document2.addEventListener("pointerdown", pointerdown);
  document2.addEventListener("click", click, true);
  document2.addEventListener("focusin", focusin, true);
  document2.addEventListener("focusout", schedule);
  refresh();
  return () => {
    disposed = true;
    readMutations(observer.takeRecords());
    observer.disconnect();
    document2.removeEventListener("keydown", keydown);
    document2.removeEventListener("keydown", releaseOpenFocus, true);
    document2.removeEventListener("pointerdown", releaseOpenFocus, true);
    document2.removeEventListener("pointerdown", pointerdown);
    document2.removeEventListener("click", click, true);
    document2.removeEventListener("focusin", focusin, true);
    document2.removeEventListener("focusout", schedule);
    for (const [element, records] of owned) restore(element, records);
    owned.clear();
    trees.clear();
    openFocus = void 0;
  };
}

// src/tabs.js
var listSelector = '[data-conversation-tabs][role="tablist"], [role="tablist"]:has(> [role="tab"][id^="trajectory-detail-"])';
var tabSelector = '[role="tab"]';
function enhanceViewTabs(document2) {
  const view = document2.defaultView;
  if (!view) return () => {
  };
  const owned = /* @__PURE__ */ new Map();
  let lists = /* @__PURE__ */ new Map();
  let queued = false;
  let disposed = false;
  function setAttribute(element, name, value) {
    let attributes = owned.get(element);
    if (!attributes) owned.set(element, attributes = /* @__PURE__ */ new Map());
    let record = attributes.get(name);
    if (!record) attributes.set(name, record = { before: element.getAttribute(name), value });
    record.value = value;
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
  }
  function restore(element, attributes) {
    for (const [name, { before, value }] of attributes) {
      if (element.getAttribute(name) !== value) continue;
      if (before === null) element.removeAttribute(name);
      else element.setAttribute(name, before);
    }
  }
  function refresh() {
    queued = false;
    if (disposed) return;
    const next = /* @__PURE__ */ new Map();
    const retained = /* @__PURE__ */ new Set();
    for (const list of document2.querySelectorAll(listSelector)) {
      if (list.closest('[hidden], [inert], [aria-hidden="true"]')) continue;
      const allTabs = [...list.querySelectorAll(tabSelector)].filter((tab) => tab.closest(listSelector) === list && !tab.closest('[hidden], [inert], [aria-hidden="true"]'));
      if (!allTabs.length) continue;
      const tabs = allTabs.filter((tab) => !tab.matches(':disabled, [aria-disabled="true"]'));
      retained.add(list);
      setAttribute(list, "aria-orientation", "horizontal");
      const current = tabs.find((tab) => tab === document2.activeElement) ?? tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ?? tabs[0];
      for (const tab of allTabs) {
        retained.add(tab);
        setAttribute(tab, "tabindex", tab === current ? "0" : "-1");
      }
      next.set(list, tabs);
    }
    for (const [element, attributes] of owned) {
      if (retained.has(element)) continue;
      restore(element, attributes);
      owned.delete(element);
    }
    lists = next;
  }
  function schedule() {
    if (queued || disposed) return;
    queued = true;
    view.queueMicrotask(refresh);
  }
  function keydown(event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
    const tab = event.target.closest?.(tabSelector);
    if (tab !== event.target) return;
    const list = tab?.closest(listSelector);
    const tabs = lists.get(list);
    if (!tabs?.includes(tab)) return;
    const index = tabs.indexOf(tab);
    let destination;
    if (event.key === "ArrowRight") destination = tabs[(index + 1) % tabs.length];
    else if (event.key === "ArrowLeft") destination = tabs[(index - 1 + tabs.length) % tabs.length];
    else if (event.key === "Home") destination = tabs[0];
    else if (event.key === "End") destination = tabs.at(-1);
    else return;
    event.preventDefault();
    event.stopPropagation();
    for (const item of tabs) setAttribute(item, "tabindex", item === destination ? "0" : "-1");
    destination.focus({ preventScroll: true });
    destination.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }
  const affectsLists = (element) => element?.nodeType === 1 && (lists.has(element) || element.matches(listSelector) || element.closest(listSelector) || element.querySelector(listSelector));
  const observer = new view.MutationObserver((records) => {
    if (records.some((record) => affectsLists(record.target) || [...record.addedNodes, ...record.removedNodes].some(affectsLists))) schedule();
  });
  observer.observe(document2.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-selected", "disabled", "aria-disabled", "hidden", "inert", "aria-hidden"]
  });
  document2.addEventListener("keydown", keydown);
  document2.addEventListener("focusin", schedule);
  document2.addEventListener("focusout", schedule);
  refresh();
  return () => {
    disposed = true;
    observer.disconnect();
    document2.removeEventListener("keydown", keydown);
    document2.removeEventListener("focusin", schedule);
    document2.removeEventListener("focusout", schedule);
    for (const [element, attributes] of owned) restore(element, attributes);
    owned.clear();
    lists.clear();
  };
}

// src/Sidebar.jsx
var import_react3 = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
function Icon({ name, size = 16 }) {
  return /* @__PURE__ */ import_react3.default.createElement("span", { "aria-hidden": "true", className: "vsc-icon", "data-icon": name, style: { width: size, height: size } });
}
var panelIcons = { plugins: "extensions", schedules: "calendar", review: "git-pull-request", tasks: "checklist" };
function Sidebar({ collapsed, sidePanels, usePanels, usePanelInfo, useEntryPins, useEntryActions, useRemoteAccess, setPinned, toggleSidebar, selectPanel, startSession, renderSlot, t }) {
  const panels = usePanels((value) => value);
  const panel = usePanelInfo((value) => value.activePanelId);
  const unpinned = useEntryPins((value) => value);
  const hasEntryActions = useEntryActions((value) => value);
  const canStartSession = useRemoteAccess("session/create");
  const [moreOpen, setMoreOpen] = (0, import_react3.useState)(false);
  const root = (0, import_react3.useRef)(null);
  const activityButtons = (0, import_react3.useRef)(/* @__PURE__ */ new Map());
  const pendingViewFocus = (0, import_react3.useRef)(null);
  const [focused, setFocused] = (0, import_react3.useState)("explorer");
  const [titleFocus, setTitleFocus] = (0, import_react3.useState)("newSession");
  const entries = [
    { id: "explorer", label: t("explorer"), icon: "files" },
    ...panels.filter((p) => !unpinned.includes(p.id) || p.id === panel).map((p) => ({ ...p, icon: panelIcons[p.id] })),
    ...hasEntryActions ? [{ id: "more", label: t("more"), icon: "ellipsis" }] : []
  ];
  const active = panel ?? "explorer";
  const activeLabel = entries.find((entry) => entry.id === active)?.label ?? t("explorer");
  const focusActivity = (id) => {
    setFocused(id);
    activityButtons.current.get(id)?.focus();
  };
  (0, import_react3.useLayoutEffect)(() => {
    const container = root.current;
    if (!container) return;
    const activeElement = container.ownerDocument.activeElement;
    if (container.contains(activeElement) && activeElement.closest("[hidden]")) focusActivity(active);
    if (!collapsed && pendingViewFocus.current === active) {
      pendingViewFocus.current = null;
      const view = panel === null ? container.querySelector(".vsc-workspace-view") : [...container.querySelectorAll("[data-side-panel]")].find((view2) => view2.dataset.sidePanel === panel);
      const target = [...view?.querySelectorAll('[tabindex="0"], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])') ?? []].find((element) => !element.closest("[hidden], [inert]") && element.getAttribute("aria-hidden") !== "true");
      target?.focus();
    }
  }, [collapsed, panel]);
  const collapseExplorer = () => {
    focusActivity(active);
    toggleSidebar();
  };
  const openPanel = (id) => {
    setMoreOpen(false);
    pendingViewFocus.current = id;
    selectPanel(id);
  };
  const activate = (id) => {
    focusActivity(id);
    if (id === "more") {
      setMoreOpen((value) => !value);
      return;
    }
    setMoreOpen(false);
    if (id === active && !collapsed) {
      toggleSidebar();
      return;
    }
    pendingViewFocus.current = id;
    if (id === "explorer") {
      selectPanel(null);
      if (collapsed) toggleSidebar();
    } else {
      openPanel(id);
    }
  };
  (0, import_react3.useEffect)(() => {
    if (!entries.some((entry) => entry.id === focused)) setFocused("explorer");
  }, [panels, unpinned, panel, hasEntryActions, focused]);
  (0, import_react3.useEffect)(() => {
    if (!hasEntryActions) setMoreOpen(false);
  }, [hasEntryActions]);
  const keyboard = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const current = entries.findIndex((e) => e.id === focused);
    let index;
    if (event.key === "ArrowDown") index = current + 1;
    else if (event.key === "ArrowUp") index = current - 1;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = entries.length - 1;
    else return;
    if (index < 0 || index >= entries.length) return;
    event.preventDefault();
    event.stopPropagation();
    focusActivity(entries[index].id);
  };
  const titleKeyboard = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const buttons = [...event.currentTarget.querySelectorAll("button")];
    const current = buttons.indexOf(event.target);
    if (current < 0) return;
    let index;
    if (event.key === "ArrowRight") index = (current + 1) % buttons.length;
    else if (event.key === "ArrowLeft") index = (current + buttons.length - 1) % buttons.length;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = buttons.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    buttons[index].focus();
  };
  return /* @__PURE__ */ import_react3.default.createElement("div", { ref: root, className: "vsc-sidebar", "data-collapsed": collapsed || void 0 }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "vsc-activitybar" }, /* @__PURE__ */ import_react3.default.createElement("nav", { className: "vsc-activities", "aria-label": t("activityBar"), onKeyDown: keyboard }, entries.map((entry) => {
    const button = /* @__PURE__ */ import_react3.default.createElement(import_dsh_client_ui_primitives.Tooltip, { label: entry.label, side: "right", delayMs: 500 }, /* @__PURE__ */ import_react3.default.createElement(
      "button",
      {
        type: "button",
        className: "vsc-activity",
        "data-activity-id": entry.id,
        ref: (element) => {
          if (element) activityButtons.current.set(entry.id, element);
          else activityButtons.current.delete(entry.id);
        },
        "aria-label": entry.label,
        "aria-current": active === entry.id && !collapsed ? "page" : void 0,
        "aria-haspopup": entry.id === "more" ? "menu" : void 0,
        "aria-expanded": entry.id === "more" ? moreOpen : void 0,
        tabIndex: focused === entry.id ? 0 : -1,
        onFocus: () => setFocused(entry.id),
        onClick: () => activate(entry.id)
      },
      entry.icon ? /* @__PURE__ */ import_react3.default.createElement(Icon, { name: entry.icon, size: 24 }) : renderSlot("sidebar.panellist", { size: 24, active: active === entry.id && !collapsed }, { only: entry.id }),
      entry.id === "explorer" && renderSlot("sidebar.toggle.badge", {})
    ));
    return entry.id === "more" ? /* @__PURE__ */ import_react3.default.createElement(
      import_dsh_client_ui_primitives.Menu,
      {
        key: entry.id,
        open: moreOpen,
        onClose: () => setMoreOpen(false),
        portal: true,
        autoFocus: true,
        side: "right",
        className: "vsc-more-anchor",
        anchor: button
      },
      moreOpen && renderSlot("sidebar.panellist.actions", {
        entries: panels.filter((p) => p.id !== "plugins").map((p) => ({ ...p, pinned: !unpinned.includes(p.id), active: p.id === panel })),
        onOpen: openPanel,
        onPinnedChange: setPinned,
        onDismiss: () => setMoreOpen(false)
      })
    ) : /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, { key: entry.id }, button);
  })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "vsc-global-actions" }, renderSlot("sidebar.footer.action", { wide: false }), renderSlot("sidebar.settings", { wide: false }))), /* @__PURE__ */ import_react3.default.createElement("section", { className: "vsc-explorer", "aria-label": activeLabel, hidden: collapsed }, /* @__PURE__ */ import_react3.default.createElement("header", { className: "vsc-sidebar-title" }, /* @__PURE__ */ import_react3.default.createElement("h2", { title: activeLabel }, activeLabel), /* @__PURE__ */ import_react3.default.createElement("div", { className: "vsc-title-actions", role: "toolbar", "aria-label": activeLabel, onKeyDown: titleKeyboard }, panel === null && canStartSession && /* @__PURE__ */ import_react3.default.createElement(import_dsh_client_ui_primitives.Tooltip, { label: t("newSession"), delayMs: 500 }, /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      type: "button",
      className: "vsc-action",
      "aria-label": t("newSession"),
      tabIndex: titleFocus === "newSession" ? 0 : -1,
      onFocus: () => setTitleFocus("newSession"),
      onClick: () => startSession()
    },
    /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "new-file" })
  )), /* @__PURE__ */ import_react3.default.createElement(import_dsh_client_ui_primitives.Tooltip, { label: t("collapse"), delayMs: 500 }, /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      type: "button",
      className: "vsc-action",
      "aria-label": t("collapse"),
      tabIndex: panel !== null || !canStartSession || titleFocus === "collapse" ? 0 : -1,
      onFocus: () => setTitleFocus("collapse"),
      onClick: collapseExplorer
    },
    /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "layout-sidebar-left" })
  )))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "vsc-workspace-view", "data-view": "explorer", hidden: panel !== null }, renderSlot("sidebar.workspaces", { wide: true, expandSidebar: () => {
    if (collapsed) toggleSidebar();
  } })), sidePanels));
}
function LeadingControls({ toggleSidebar, startSession, useRemoteAccess, t }) {
  const canStartSession = useRemoteAccess("session/create");
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "vsc-leading" }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "vsc-action", "aria-label": t("explorer"), onClick: toggleSidebar }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "layout-sidebar-left" })), canStartSession && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "vsc-action", "aria-label": t("newSession"), onClick: () => startSession() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "new-file" })));
}

// src/panel-pins.js
var import_dsh_client_store2 = require("@deepseek-ai/dsh-client-store");
function createPanelPins() {
  const unpinned = (0, import_dsh_client_store2.createSnapshotStore)([]);
  return {
    unpinned,
    setPinned(id, pinned) {
      const current = unpinned.getSnapshot();
      if (id === "plugins" || pinned !== current.includes(id)) return;
      unpinned.set(pinned ? current.filter((entry) => entry !== id) : [...current, id]);
    }
  };
}

// src/client.js
var inject = ["theme", "slots", "locale", "shortcuts"];
var messages = {
  en: { explorer: "Sessions", search: "Search Sessions", activityBar: "Activity Bar", newSession: "New Session", collapse: "Hide Side Bar", more: "More" },
  zh: { explorer: "\u4F1A\u8BDD", search: "\u641C\u7D22\u4F1A\u8BDD", activityBar: "\u6D3B\u52A8\u680F", newSession: "\u65B0\u5EFA\u4F1A\u8BDD", collapse: "\u9690\u85CF\u4FA7\u680F", more: "\u66F4\u591A" }
};
function panelStore(ctx) {
  let snapshot = [];
  const listeners = /* @__PURE__ */ new Set();
  const sync = () => {
    snapshot = ctx.slots.entriesOfSlot("sidebar.panellist").map(({ options }) => ({
      id: options.id,
      label: typeof options.label === "function" ? options.label() : options.label ?? options.id,
      order: options.order ?? 0
    })).sort((a, b) => a.order - b.order);
    listeners.forEach((listener) => listener());
  };
  return { sync, getSnapshot: () => snapshot, subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  } };
}
function apply2(ctx) {
  ctx.effect(() => ctx.theme.overrideTokens("dsh-vscode-ui", classicTokens));
  ctx.effect(() => {
    const tag = document.createElement("style");
    tag.dataset.plugin = "dsh-vscode-ui";
    tag.textContent = [frame_default, classic_default, tree_default, assistant_default, process_default, dock_default, activity_default, icons_default, platformFonts(document)].join("\n");
    document.head.append(tag);
    return () => tag.remove();
  });
  ctx.effect(() => ctx.locale.register("vscode-ui", messages));
  apply(ctx);
  ctx.inject(["layout", "uiWorkspace"], (ctx2) => {
    const panels = panelStore(ctx2);
    const pins = createPanelPins();
    const entryActions = {
      getSnapshot: () => ctx2.slots.entriesOfSlot("sidebar.panellist.actions").length > 0,
      subscribe: (listener) => ctx2.slots.subscribe("sidebar.panellist.actions", listener)
    };
    const injectProps = () => ({
      startSession: (workspaceId) => ctx2.get("uiWorkspace").startSession(workspaceId),
      toggleSidebar: () => ctx2.layout.toggleSidebar(),
      selectPanel: (id) => ctx2.layout.selectPanel(id),
      setPinned: pins.setPinned,
      hooks: { panels, entryPins: pins.unpinned, entryActions }
    });
    ctx2.slots.inject("sidebar", () => ctx2.slots.register({
      name: "sidebar",
      locale: "vscode-ui",
      inject: injectProps,
      children: {
        "sidebar.toggle.badge": { kind: "single", scope: "root" },
        "sidebar.panellist": { kind: "list", scope: "root" },
        "sidebar.panellist.actions": { kind: "list", scope: "root" },
        "sidebar.workspaces": { kind: "single", scope: "root" },
        "sidebar.settings": { kind: "single", scope: "root" },
        "sidebar.footer.action": { kind: "list", scope: "root" }
      }
    }, Sidebar));
    ctx2.slots.inject("shell.leading", () => ctx2.slots.register({ name: "shell.leading", locale: "vscode-ui", inject: injectProps }, LeadingControls));
    ctx2.effect(() => ctx2.slots.subscribe("sidebar.panellist", panels.sync));
    ctx2.effect(() => ctx2.locale.subscribe(panels.sync));
    panels.sync();
    ctx2.effect(() => enhanceSidebarTree(document));
    ctx2.effect(() => enhanceViewTabs(document));
  });
}
return module.exports; } });
//# sourceMappingURL=client.js.map
