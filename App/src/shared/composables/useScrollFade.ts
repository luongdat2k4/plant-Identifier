import { onMounted, onUnmounted } from 'vue'

/** Publishes scroll progress (0 at the top, 1 after `range` px) as the --p CSS variable on <html>. */
export function useScrollFade(range = 220) {
  let frame = 0
  function update() {
    frame = 0
    const reach = Math.max(60, Math.min(range, document.documentElement.scrollHeight - window.innerHeight))
    const progress = Math.min(1, Math.max(0, window.scrollY / reach))
    document.documentElement.style.setProperty('--p', progress.toFixed(3))
  }
  function onScroll() { if (!frame) frame = requestAnimationFrame(update) }
  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
    document.documentElement.style.removeProperty('--p')
  })
}
