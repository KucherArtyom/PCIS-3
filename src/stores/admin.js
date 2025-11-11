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

    loading.value = true
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admin/auth/check_admin/', {
        withCredentials: true
      })
      
      if (response.data.is_admin) {
        isAdmin.value = true
        adminUser.value = response.data.user
        return true
      } else {
        isAdmin.value = false
        adminUser.value = null
        return false
      }
    } catch (error) {
      console.error('Admin access check failed:', error)
      isAdmin.value = false
      adminUser.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    isAdmin,
    adminUser,
    loading,
    checkAdminAccess
  }
})
