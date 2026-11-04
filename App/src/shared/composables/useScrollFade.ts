import { onMounted, onUnmounted } from 'vue'
import { BAR, mixColor, setStatusBar } from '../utils/statusBar'

/** Publishes scroll progress (0 at the top, 1 after `range` px) as the --p CSS variable on <html>. */
export function useScrollFade(range = 220) {
  let frame = 0
  // Pages with a banner scroll inside .page-scroll (it ends at the banner); otherwise the window scrolls.
  let box: HTMLElement | null = null
  function update() {
    frame = 0
    const max = box ? box.scrollHeight - box.clientHeight : document.documentElement.scrollHeight - window.innerHeight
    const reach = Math.max(60, Math.min(range, max))
    const progress = Math.min(1, Math.max(0, (box ? box.scrollTop : window.scrollY) / reach))
    document.documentElement.style.setProperty('--p', progress.toFixed(3))
    setStatusBar(mixColor(BAR.hero, BAR.white, progress))
  }
  function onScroll() { if (!frame) frame = requestAnimationFrame(update) }
  onMounted(() => {
    box = document.querySelector<HTMLElement>('.page-scroll')
    ;(box ?? window).addEventListener('scroll', onScroll, { passive: true })
    update()
  })
  onUnmounted(() => {
    ;(box ?? window).removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
    document.documentElement.style.removeProperty('--p')
  })
}
