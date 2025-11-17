import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Games from '@/views/Games.vue'
import Clubs from '@/views/Clubs.vue'
import Players from '@/views/Players.vue'
import Transfers from '@/views/Transfers.vue'
import Login from '@/views/Login.vue'
import { useAdminStore } from '@/stores/admin'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/games',
    name: 'Games',
    component: Games
  },
  {
    path: '/clubs',
    name: 'Clubs',
    component: Clubs
  },
  {
    path: '/players',
    name: 'Players',
    component: Players
  },
  {
    path: '/transfers',
    name: 'Transfers',
    component: Transfers
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('@/views/Registration.vue')
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
  const adminStore = useAdminStore()
  
  if (to.meta.requiresAdmin) {
    const hasAccess = await adminStore.checkAdminAccess()
    if (hasAccess) {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router