import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

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
  
  console.log('App initialized, user authenticated:', authStore.isAuthenticated)
})

