/** CSS Modules emitted by DSH, Vite, and plugins with a filename prefix. */
export const nativeClass = name => `:is([class*="_${name}_"], [class$="_${name}"], [class*="_${name} "])`

export const expandClasses = text => text.replace(/:--class\(([a-zA-Z][\w-]*)\)/g,
  (_, name) => nativeClass(name))
