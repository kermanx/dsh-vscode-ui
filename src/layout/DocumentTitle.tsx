/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: WorkbenchLayout, ActivityBar, SidebarTitle
 * Adaptation: DSH slot/service contracts with a persistent conversation and independent sidebar views.
 * DSH source: f0869aabe6b0d2d6a85d940d72ae521ed622176d, packages/client/ui-layout.
 * Copyright (c) 2026 DeepSeek. Copyright (c) Microsoft Corporation. MIT License.
 */
/** Browser title selection follows the active main panel without subscribing the frame. */
import { useEffect } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

/** Props for the browser title projection. */
export type DocumentTitleProps = Pick<PropsRuntime<'root'>, 'useSessions' | 'usePanelInfo'> & {
  /** Build-configured or localized product title. */
  productTitle: string
}

/**
 * Project the selected durable session title into the browser title and
 * restore the build-selected product title when unmounted.
 * @param props - Selected session title projection.
 * @returns No rendered content.
 */
export function DocumentTitle({ useSessions, usePanelInfo, productTitle }: DocumentTitleProps): null {
  const title = useSessions((state) => {
    const current = Object.values(state.byId)
      .find(session => (session.retainedBy.mainView ?? 0) > 0)?.id
    return current === undefined ? undefined : state.byId[current]?.title
  })
  useEffect(() => {
    document.title = title === undefined ? productTitle : `${title} — ${productTitle}`
    return () => { document.title = productTitle }
  }, [productTitle, title])
  return null
}
