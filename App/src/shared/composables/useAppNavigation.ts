import { useRoute, useRouter } from 'vue-router'
type Destination = 'garden' | 'collection' | 'scan' | 'seeds' | 'menu' | 'language' | 'welcome' | 'pot' | 'species'
export function useAppNavigation() {
  const router = useRouter()
  const route = useRoute()
  function go(name: Destination, value?: string) {
    if (name === 'pot' || name === 'species') return router.push({ name, params: { id: value || '' } })
    return router.push({ name })
  }
  function back() {
    const name = String(route.name || '')
    if (name === 'species') return go('collection')
    return go('garden')
  }
  return { go, back }
}
