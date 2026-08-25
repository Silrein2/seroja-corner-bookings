import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/booking', component: () => import('../views/BookingCalendarView.vue') },
  { path: '/manual-invoice', name: 'manual-new', component: () => import('../views/ManualInvoiceView.vue') },
  // Same view, but pre-filled from an existing booking (calendar click)
  { path: '/manual-invoice/:id', name: 'manual-edit', component: () => import('../views/ManualInvoiceView.vue') },
  { path: '/invoice/:id', name: 'invoice', component: () => import('../views/InvoiceView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

export default router
