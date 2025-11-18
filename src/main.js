import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from './stores/auth'
import { useAdminStore } from './stores/admin' 


const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')


router.isReady().then(async () => {
  const { useAuthStore } = await import('@/stores/auth')
  const { useAdminStore } = await import('@/stores/admin')
  
  const authStore = useAuthStore()
  const adminStore = useAdminStore()
  
  await authStore.loadUser()
  
  if (authStore.isAuthenticated) {
    const isAdmin = await adminStore.checkAdminAccess()
    
    if (router.currentRoute.value.meta.requiresAdmin && !isAdmin) {
      router.push('/')
    }
  }
})

