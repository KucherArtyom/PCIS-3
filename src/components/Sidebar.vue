<template>
  <div id="sidebar">
    <div id="logo">
      <p id="logo_name">FOOT_SCOUT</p>
    </div>
    <div id="sidebar_buttons" @click="$router.push('/')">
      <p id="sidebar_buttons_name">Главная</p>
    </div>
    <div id="sidebar_buttons" @click="$router.push('/games')">
      <p id="sidebar_buttons_name">Матчи</p>
    </div>
    <div id="sidebar_buttons" @click="$router.push('/clubs')">
      <p id="sidebar_buttons_name">Клубы</p>
    </div>
    <div id="sidebar_buttons" @click="$router.push('/players')">
      <p id="sidebar_buttons_name">Игроки</p>
    </div>
    <div id="sidebar_buttons" @click="$router.push('/transfers')">
      <p id="sidebar_buttons_name">Трансферы</p>
    </div>
    <div id="sidebar_right">
      <div v-if="!authStore.isAuthenticated" class="auth-buttons">
        <div id="login" @click="$router.push('/login')">
          <p id="sidebar_buttons_right_name">Логин</p>
        </div>
        <div id="registration" @click="$router.push('/registration')">
          <p id="sidebar_buttons_right_name">Регистрация</p>
        </div>
      </div>
      
      <div v-else class="user-info">
        <div class="user-welcome">
          <p id="sidebar_buttons_right_name">Привет, {{ authStore.user.username }}!</p>
        </div>
        <div id="logout" @click="handleLogout">
          <p id="sidebar_buttons_right_name">Выйти</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
export default {
  name: 'Sidebar',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const handleLogout = async () => {
      await authStore.logout()
      $router.push('/')
    }

    return {
      authStore,
      handleLogout
    }
  }
}
</script>