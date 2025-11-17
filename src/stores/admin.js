import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore()
  const isAdmin = ref(false)
  const adminUser = ref(null)
  const loading = ref(false)
  
  const checkAdminAccess = async () => {
    if (!authStore.isAuthenticated) {
      isAdmin.value = false
      return false
    }

    if (authStore.user && authStore.user.is_staff) {
      isAdmin.value = true
      adminUser.value = authStore.user
      return true
    } else {
      isAdmin.value = false
      adminUser.value = null
      return false
    }
  }

  return {
    isAdmin,
    adminUser,
    loading,
    checkAdminAccess
  }
})