import { useRoute, useRouter } from 'vue-router'
type Destination = 'plants' | 'search' | 'scan' | 'blog' | 'menu' | 'editor' | 'detail' | 'edit' | 'diagnosis' | 'light' | 'water' | 'history' | 'article' | 'botanist'
export function useAppNavigation() {
  const router = useRouter()
  const route = useRoute()
  function go(name: Destination, value?: string) {
    if (name === 'detail' || name === 'edit' || name === 'article') return router.push({ name, params: { id: value || '' } })
    if (name === 'scan' && value) return router.push({ name, query: { mode: value } })
    return router.push({ name })
  }
  function back() {
    const name = String(route.name || '')
    if (name === 'edit') return go('detail', String(route.params.id))
    if (name === 'article') return go('blog')
    if (['diagnosis', 'light', 'water', 'botanist'].includes(name)) return go('menu')
    if (name === 'history') return go('scan')
    return go('plants')
  }
  return { go, back }
}
