import { createRouter, createWebHistory } from 'vue-router'
import { BAR } from '../shared/utils/statusBar'
import { hasOnboarded } from '../shared/utils/onboarding'
import { hasChosenLanguage } from '../shared/i18n'
import { hasRuntimeData } from '../shared/store'
// /begin is the launch screen of a returning user only (someone who already has runtime data). A first-time user never
// sees it: the guard sends them straight into the language and welcome screens.
let begun = false
export function markBegun() { begun = true }

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/begin', name: 'begin', meta: { bar: BAR.intro }, component: () => import('../features/onboarding/pages/BeginPage.vue') },
    { path: '/', name: 'garden', meta: { bar: BAR.page }, component: () => import('../features/garden/pages/GardenPage.vue') },
    { path: '/collection', name: 'collection', meta: { bar: BAR.page }, component: () => import('../features/collection/pages/CollectionPage.vue') },
    { path: '/scan', name: 'scan', meta: { bar: BAR.camera }, component: () => import('../features/scan/pages/ScanPage.vue') },
    { path: '/seeds', name: 'seeds', meta: { bar: BAR.page }, component: () => import('../features/scan/pages/SeedsPage.vue') },
    { path: '/menu', name: 'menu', meta: { bar: BAR.page }, component: () => import('../features/menu/pages/MenuPage.vue') },
    { path: '/pots/:id', name: 'pot', meta: { bar: BAR.hero }, component: () => import('../features/garden/pages/PotDetailPage.vue') },
    { path: '/species/:id', name: 'species', meta: { bar: BAR.hero }, component: () => import('../features/collection/pages/SpeciesDetailPage.vue') },
    { path: '/missions', name: 'missions', meta: { bar: BAR.page }, component: () => import('../features/missions/pages/MissionsPage.vue') },
    { path: '/menu/language', name: 'menu-language', meta: { bar: BAR.page }, component: () => import('../features/menu/pages/LanguageSettingsPage.vue') },
    { path: '/language', name: 'language', meta: { bar: BAR.intro }, component: () => import('../features/onboarding/pages/LanguagePage.vue') },
    { path: '/welcome', name: 'welcome', meta: { bar: BAR.intro }, component: () => import('../features/onboarding/pages/OnboardingPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
// First launch: language first, then the intro, each shown once.
router.beforeEach(to => {
  if (!begun) {
    if (!hasRuntimeData()) begun = true // first launch: no /begin, the first-run checks below take over
    else if (to.name !== 'begin') return { name: 'begin' }
  }
  if (to.name === 'begin') return begun ? { name: 'garden' } : true
  if (to.name === 'language') return true
  if (!hasChosenLanguage()) return { name: 'language' }
  if (to.name !== 'welcome' && !hasOnboarded()) return { name: 'welcome' }
  return true
})
