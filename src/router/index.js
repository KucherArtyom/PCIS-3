import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Games from '@/views/Games.vue'
import Clubs from '@/views/Clubs.vue'
import Players from '@/views/Players.vue'
import Transfers from '@/views/Transfers.vue'
import Login from '@/views/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/games',
    name: 'Games',
    component: Games,
    meta: { requiresAuth: true }
  },
  {
    path: '/clubs',
    name: 'Clubs',
    component: Clubs,
    meta: { requiresAuth: true }
  },
  {
    path: '/players',
    name: 'Players',
    component: Players,
    meta: { requiresAuth: true }
  },
  {
    path: '/transfers',
    name: 'Transfers',
    component: Transfers,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('@/views/Registration.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'MainAdmin',
    component: () => import('@/views/MainAdmin.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/games',
    name: 'GamesAdmin',
    component: () => import('@/views/GamesAdmin.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/players',
    name: 'PlayersAdmin',
    component: () => import('@/views/PlayersAdmin.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/clubs',
    name: 'ClubsAdmin',
    component: () => import('@/views/ClubsAdmin.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/transfers',
    name: 'TransfersAdmin',
    component: () => import('@/views/TransfersAdmin.vue'),
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('@/stores/auth')
  const { useAdminStore } = await import('@/stores/admin')
  
  const authStore = useAuthStore()
  const adminStore = useAdminStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } 
  else if (to.meta.requiresAdmin) {
    const hasAccess = await adminStore.checkAdminAccess()
    if (hasAccess) {
      next()
    } else {
      next('/')
    }
  } 
  else {
    next()
  }
})

export default router