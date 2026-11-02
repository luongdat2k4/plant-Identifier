import { createRouter, createWebHistory } from 'vue-router'
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'garden', component: () => import('../features/garden/pages/GardenPage.vue') },
    { path: '/collection', name: 'collection', component: () => import('../features/collection/pages/CollectionPage.vue') },
    { path: '/scan', name: 'scan', component: () => import('../features/scan/pages/ScanPage.vue') },
    { path: '/seeds', name: 'seeds', component: () => import('../features/scan/pages/SeedsPage.vue') },
    { path: '/menu', name: 'menu', component: () => import('../features/menu/pages/MenuPage.vue') },
    { path: '/pots/:id', name: 'pot', component: () => import('../features/garden/pages/PotDetailPage.vue') },
    { path: '/species/:id', name: 'species', component: () => import('../features/collection/pages/SpeciesDetailPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
