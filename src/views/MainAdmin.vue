<template>
  <div id="mainblock">
    <AdminSidebar />
    
    <div id="content">
      <div class="admin-dashboard">
        <div class="admin-header">
          <div class="admin-welcome">
            <h1>Панель администратора</h1>
            <p>Добро пожаловать, {{ adminStore.adminUser?.username }}!</p>
          </div>
          <div class="admin-stats">
            
          </div>
        </div>

        <div class="quick-actions">
          
        </div>

        
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import AdminSidebar from '@/components/AdminSidebar.vue'

export default {
  name: 'MainAdmin',
  components: {
    AdminSidebar
  },
  setup() {
    const router = useRouter()
    const adminStore = useAdminStore()
    const authStore = useAuthStore()
    
    const stats = ref({})
    const recentActivities = ref([])


    const getActivityIcon = (type) => {
      const icons = {
        match: '',
        player: '',
        club: '',
        transfer: ''
      }
      return icons[type] || ''
    }

    onMounted(async () => {
      const hasAccess = await adminStore.checkAdminAccess()
      
      if (!hasAccess) {
        router.push('/')
        return
      }

      await loadStats()
      await loadRecentActivities()
    })

    return {
      adminStore,
      authStore,
      stats,
      recentActivities,
      getActivityIcon
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-header {
  margin-bottom: 40px;
}

.admin-welcome {
  text-align: center;
  margin-bottom: 30px;
}

.admin-welcome h1 {
  color: #2c3e50;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.admin-welcome p {
  color: #666;
  font-size: 1.2em;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5em;
  width: 60px;
  text-align: center;
}

.stat-info h3 {
  color: #2c3e50;
  font-size: 2em;
  margin: 0;
  font-weight: bold;
}

.stat-info p {
  color: #666;
  margin: 5px 0 0 0;
}

.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.8em;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.action-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-5px);
  border-color: #3498db;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.action-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3em;
}

.action-card p {
  color: #666;
  line-height: 1.5;
}

.recent-activities h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.8em;
}

.activities-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.activity-item:hover {
  background: #f8f9fa;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  flex-shrink: 0;
}

.activity-icon.match {
  background: #e3f2fd;
  color: #1976d2;
}

.activity-icon.player {
  background: #f3e5f5;
  color: #7b1fa2;
}

.activity-icon.club {
  background: #e8f5e8;
  color: #388e3c;
}

.activity-icon.transfer {
  background: #fff3e0;
  color: #f57c00;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-weight: 500;
}

.activity-time {
  color: #666;
  font-size: 0.9em;
}

.no-activities {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

/* Адаптивность */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 20px;
  }
  
  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
}
</style>