import { createRouter, createWebHistory } from 'vue-router'
import { BAR } from '../shared/utils/statusBar'
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'garden', meta: { bar: BAR.page }, component: () => import('../features/garden/pages/GardenPage.vue') },
    { path: '/collection', name: 'collection', meta: { bar: BAR.page }, component: () => import('../features/collection/pages/CollectionPage.vue') },
    { path: '/scan', name: 'scan', meta: { bar: BAR.scanAsk }, component: () => import('../features/scan/pages/ScanPage.vue') },
    { path: '/seeds', name: 'seeds', meta: { bar: BAR.page }, component: () => import('../features/scan/pages/SeedsPage.vue') },
    { path: '/menu', name: 'menu', meta: { bar: BAR.page }, component: () => import('../features/menu/pages/MenuPage.vue') },
    { path: '/pots/:id', name: 'pot', meta: { bar: BAR.hero }, component: () => import('../features/garden/pages/PotDetailPage.vue') },
    { path: '/species/:id', name: 'species', meta: { bar: BAR.hero }, component: () => import('../features/collection/pages/SpeciesDetailPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
