<template>
  <div id="admin-sidebar">
    <div id="admin-logo">
      <p id="admin-logo_name">FOOT_SCOUT</p>
      <p id="admin-logo_subtitle">ADMIN</p>
    </div>
    
    <!-- Навигация администратора -->
    <div class="admin-sidebar_buttons" @click="router.push('/admin')">
      <p class="admin-sidebar_buttons_name">Главная админа</p>
    </div>
    <div class="admin-sidebar_buttons" @click="router.push('/admin/games')">
      <p class="admin-sidebar_buttons_name">Матчи - Админ</p>
    </div>
    <div class="admin-sidebar_buttons" @click="router.push('/admin/players')">
      <p class="admin-sidebar_buttons_name">Игроки - Админ</p>
    </div>
    <div class="admin-sidebar_buttons" @click="router.push('/admin/clubs')">
      <p class="admin-sidebar_buttons_name">Клубы - Админ</p>
    </div>
    <div class="admin-sidebar_buttons" @click="router.push('/admin/transfers')">
      <p class="admin-sidebar_buttons_name">Трансферы - Админ</p>
    </div>
    
    <div id="admin-sidebar_right">
      <div class="admin-user-info">
        <div class="admin-user-welcome">
          <p class="admin-user-name">Админ: {{ adminStore.adminUser?.username }}</p>
        </div>
        <div class="admin-actions">
          <div class="admin-to-main" @click="goToMainSite">
            <p class="admin-sidebar_buttons_right_name">Основной сайт</p>
          </div>
          <div class="admin-logout" @click="handleLogout">
            <p class="admin-sidebar_buttons_right_name">Выйти</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminSidebar',
  setup() {
    const adminStore = useAdminStore()
    const authStore = useAuthStore()
    const router = useRouter()
    
    const handleLogout = async () => {
      await authStore.logout()
      adminStore.isAdmin = false
      adminStore.adminUser = null
      router.push('/')
    }

    const goToMainSite = () => {
      router.push('/')
    }

    return {
      adminStore,
      authStore,
      router,
      handleLogout,
      goToMainSite
    }
  }
}
</script>

<style scoped>
#admin-sidebar {
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: white;
  padding: 20px;
  min-height: 100vh;
  width: 280px;
}

#admin-logo {
  margin-bottom: 30px;
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
}

#admin-logo_name {
  font-size: 1.5em;
  font-weight: bold;
  color: #3498db;
  margin: 0;
}

#admin-logo_subtitle {
  font-size: 0.8em;
  color: #95a5a6;
  margin: 5px 0 0 0;
  font-weight: 500;
  letter-spacing: 2px;
}

.admin-sidebar_buttons {
  padding: 15px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.admin-sidebar_buttons:hover {
  background: #2c3e50;
  border-left-color: #3498db;
}

.admin-sidebar_buttons_name {
  margin: 0;
  font-size: 0.95em;
  font-weight: 500;
}

#admin-sidebar_right {
  margin-top: auto;
  padding-top: 20px;
  border-top: 2px solid #333;
}

.admin-user-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.admin-user-welcome {
  padding: 12px;
  background: #2c3e50;
  border-radius: 6px;
  text-align: center;
}

.admin-user-name {
  margin: 0;
  font-size: 0.9em;
  font-weight: 500;
  color: #ecf0f1;
}

.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-to-main, .admin-logout {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s ease;
}

.admin-to-main {
  background: #27ae60;
}

.admin-to-main:hover {
  background: #219653;
}

.admin-logout {
  background: #e74c3c;
}

.admin-logout:hover {
  background: #c0392b;
}

.admin-sidebar_buttons_right_name {
  margin: 0;
  font-size: 0.85em;
  font-weight: 500;
}
</style>