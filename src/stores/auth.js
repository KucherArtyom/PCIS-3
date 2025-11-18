import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/utils/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const saveTokens = (tokens) => {
    if (tokens.access) {
      accessToken.value = tokens.access
      localStorage.setItem('accessToken', tokens.access)
    }
    if (tokens.refresh) {
      refreshToken.value = tokens.refresh
      localStorage.setItem('refreshToken', tokens.refresh)
    }
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const loadUser = async () => {
    if (!accessToken.value) {
      user.value = null
      return
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/auth/user/')
      user.value = response.data
    } catch (error) {
      user.value = null
      console.log('User not authenticated')
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        'auth/login/',
        { username, password }
      )
      
      user.value = response.data.user
      saveTokens(response.data.tokens)
      
      return { success: true, data: response.data }
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
        userData
      )
      user.value = response.data.user
      saveTokens(response.data.tokens)
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
    const refresh = localStorage.getItem('refreshToken')
    if (refresh) {
      await axios.post('auth/logout/', {
        refresh_token: refresh
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    user.value = null
    clearTokens()
    window.location.href = '/'
  }
}

  const refreshAccessToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken')
      if (!refresh) {
        throw new Error('No refresh token')
      }
      
      const response = await axios.post('auth/refresh/', {
        refresh: refresh
      })
      
      if (response.data.access) {
        accessToken.value = response.data.access
        localStorage.setItem('accessToken', response.data.access)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearTokens()
      user.value = null
      return false
    }
  }

  const initialize = async () => {
    if (accessToken.value) {
      await loadUser()
    }
  }


  return {
    user,
    accessToken,
    isAuthenticated,
    loadUser,
    login,
    register,
    logout,
    initialize
  }
})