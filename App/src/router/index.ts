import { createRouter, createWebHistory } from 'vue-router'
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'plants', component: () => import('../features/plants/pages/PlantsPage.vue') },
    { path: '/search', name: 'search', component: () => import('../features/plants/pages/SearchPage.vue') },
    { path: '/scan', name: 'scan', component: () => import('../features/scan/pages/ScanPage.vue') },
    { path: '/blog', name: 'blog', component: () => import('../features/blog/pages/BlogPage.vue') },
    { path: '/menu', name: 'menu', component: () => import('../features/menu/pages/MenuPage.vue') },
    { path: '/plants/new', name: 'editor', component: () => import('../features/plants/pages/PlantEditorPage.vue') },
    { path: '/plants/:id/edit', name: 'edit', component: () => import('../features/plants/pages/PlantEditorPage.vue') },
    { path: '/plants/:id', name: 'detail', component: () => import('../features/plants/pages/PlantDetailPage.vue') },
    { path: '/scan/history', name: 'history', component: () => import('../features/scan/pages/HistoryPage.vue') },
    { path: '/blog/:id', name: 'article', component: () => import('../features/blog/pages/ArticlePage.vue') },
    { path: '/tools/diagnosis', name: 'diagnosis', component: () => import('../features/tools/pages/DiagnosisPage.vue') },
    { path: '/tools/light', name: 'light', component: () => import('../features/tools/pages/LightPage.vue') },
    { path: '/tools/water', name: 'water', component: () => import('../features/tools/pages/WaterPage.vue') },
    { path: '/tools/botanist', name: 'botanist', component: () => import('../features/tools/pages/BotanistPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
