import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../utils/auth.js'

const router = createRouter({
  history: createWebHistory('/laporan-keuangan/'),
    routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/RegisterUser.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/jurnal-umum',
      name: 'jurnal-umum',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/kartu-stok',
      name: 'kartu-stok',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/nama-akun',
      name: 'nama-akun',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/nomor-voucher',
      name: 'nomor-voucher',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/template-voucher',
      name: 'template-voucher',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/vendor-customer',
      name: 'vendor-customer',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/kelompok-akun',
      name: 'kelompok-akun',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/jurnal-penyesuaian',
      name: 'jurnal-penyesuaian',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/posting-jurnal',
      name: 'posting-jurnal',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/posting-entry',
      name: 'posting-entry',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/neraca-saldo-tabs',
      name: 'neraca-saldo-tabs',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/laporan-laba-rugi',
      name: 'laporan-laba-rugi',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/laporan-stok',
      name: 'laporan-stok',
      component: () => import('../components/modules/KartuStok/LaporanStok.vue')
    },
    {
      path: '/laporan-ekuitas',
      name: 'laporan-ekuitas',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/laporan-posisi-keuangan',
      name: 'laporan-posisi-keuangan',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/role-management',
      name: 'role-management',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/approval-workflow',
      name: 'approval-workflow',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/modul-management',
      name: 'modul-management',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    },
    {
      path: '/registrasi-approval',
      name: 'registrasi-approval',
      component: () => import('../components/modules/Dashboard/Dashboard.vue')
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(to.path)

  if (!isAuthenticated() && !isPublicRoute) {
    // Redirect to login if not authenticated and trying to access protected route
    next('/login')
  } else if (isAuthenticated() && isPublicRoute) {
    // Redirect to home if already authenticated and trying to access public route
    next('/')
  } else if (isAuthenticated() && (to.path === '/' || to.name === 'home' || to.name === 'dashboard')) {
    // Redirect to default module (kelompok akun) when accessing root
    next('/kelompok-akun')
  } else {
    // Proceed to route
    next()
  }
})

export default router
