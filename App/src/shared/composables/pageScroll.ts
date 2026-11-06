import { onBeforeUnmount } from 'vue'

const ON = 'doc-scroll'

/** True while the current screen scrolls on the document instead of inside its own box. */
export const docScrolls = () => document.documentElement.classList.contains(ON)

/**
 * A screen with a native ad inside its list scrolls on the document. Android's WebView only exposes the document's
 * scroll position, which is what lets the ad follow the page inside the frame being drawn (see
 * design-note/note/native-ad-scroll-fix.md). The header stays sticky and the bottom bar fixed, so it looks the same.
 */
export function useDocScroll() {
  document.documentElement.classList.add(ON)
  onBeforeUnmount(() => document.documentElement.classList.remove(ON))
}
