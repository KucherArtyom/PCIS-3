import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  const loadUser = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/auth/user/', {
        withCredentials: true
      })
      user.value = response.data
    } catch (error) {
      user.value = null
      console.log('User not authenticated')
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/auth/login/',
        { username, password },
        { withCredentials: true }
      )
      user.value = response.data.user
      
      const adminStore = useAdminStore()
      const isAdmin = await adminStore.checkAdminAccess()

      return { success: true, data: response.data, isAdmin: isAdmin }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Ошибка входа' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/auth/register/',
        userData,
        { withCredentials: true }
      )
      user.value = response.data.user
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Ошибка регистрации' 
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/auth/logout/',
        {},
        { withCredentials: true }
      )
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
    }
  }

  return {
    user,
    isAuthenticated,
    loadUser,
    login,
    register,
    logout
  }
})