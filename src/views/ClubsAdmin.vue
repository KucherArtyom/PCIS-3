<template>
  <div id="mainblock">
    <AdminSidebar />
    
    <div id="content">
      <div class="admin-container">
        <div class="admin-header">
          <h1>🏟️ Управление клубами</h1>
          <p>Добавление, редактирование и удаление информации о клубах</p>
        </div>

        <div class="mode-selector">
          <div class="mode-options">
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="add" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Добавить клуб
            </label>
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="edit" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Редактировать клуб
            </label>
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="delete" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Удалить клуб
            </label>
          </div>
        </div>

        <div v-if="selectedMode !== 'add'" class="search-section">
          <div class="search-filters">
            <div class="filter-group">
              <label>Команда:</label>
              <select v-model="searchFilters.club_name" class="form-select">
                <option value="">Выберите клуб</option>
                <option v-for="club in options.clubs" :key="club" :value="club">
                  {{ club }}
                </option>
              </select>
            </div>
            <button 
              @click="searchClub" 
              class="search-btn"
              :disabled="!searchFilters.club_name"
            >
              Найти клуб
            </button>
          </div>
        </div>

        <div v-if="currentClub && selectedMode === 'delete'" class="club-info-warning">
          <div class="warning-header">
            <span class="warning-icon"></span>
            <h3>Внимание! Удаление клуба</h3>
          </div>
          <div class="warning-content">
            <p>В клубе <strong>{{ currentClub.name }}</strong> находится <strong>{{ playersCount }}</strong> игроков.</p>
            <p v-if="playersCount > 0" class="warning-danger">
              Невозможно удалить клуб, пока в нем есть игроки. Сначала переместите или удалите всех игроков.
            </p>
            <p v-else class="warning-safe">
              Клуб можно безопасно удалить.
            </p>
          </div>
        </div>

        <!-- Форма клуба -->
        <div class="club-form-section">
          <form @submit.prevent="handleSubmit" class="club-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Название клуба:</label>
                <input
                  v-model="clubForm.name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Название футбольного клуба"
                  required
                >
                <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
              </div>

              <div class="form-group">
                <label>Средний возраст:</label>
                <input
                  v-model="clubForm.average_age"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.average_age, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Средний возраст игроков"
                  min="16"
                  max="40"
                  step="0.1"
                >
                <span v-if="errors.average_age" class="error-text">{{ errors.average_age }}</span>
              </div>

              <div class="form-group">
                <label>Количество игроков:</label>
                <input
                  v-model="clubForm.squad_size"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.squad_size, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Размер состава"
                  min="1"
                  max="50"
                >
                <span v-if="errors.squad_size" class="error-text">{{ errors.squad_size }}</span>
              </div>

              <div class="form-group">
                <label>Стадион:</label>
                <input
                  v-model="clubForm.stadium_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.stadium_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Название домашнего стадиона"
                >
                <span v-if="errors.stadium_name" class="error-text">{{ errors.stadium_name }}</span>
              </div>

              <div class="form-group">
                <label>Вместимость:</label>
                <input
                  v-model="clubForm.stadium_seats"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.stadium_seats, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Вместимость стадиона"
                  min="0"
                  max="200000"
                >
                <span v-if="errors.stadium_seats" class="error-text">{{ errors.stadium_seats }}</span>
              </div>

              <div class="form-group">
                <label>Тренер:</label>
                <input
                  v-model="clubForm.coach_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.coach_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Имя главного тренера"
                >
                <span v-if="errors.coach_name" class="error-text">{{ errors.coach_name }}</span>
              </div>
            </div>

            <div v-if="currentClub && selectedMode !== 'add'" class="additional-info">
              <h3>Дополнительная информация</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Общая стоимость состава:</label>
                  <span class="info-value">{{ formatCurrency(currentClub.total_market_value) }}</span>
                </div>
                <div class="info-item">
                  <label>Процент иностранцев:</label>
                  <span class="info-value">{{ currentClub.foreigners_percentage ? currentClub.foreigners_percentage.toFixed(1) + '%' : 'Не указано' }}</span>
                </div>
                <div class="info-item">
                  <label>Количество игроков в базе:</label>
                  <span class="info-value">{{ playersCount }}</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                v-if="selectedMode === 'add'" 
                type="submit" 
                class="action-btn add-btn"
                :disabled="loading"
              >
                {{ loading ? 'Добавление...' : 'Добавить клуб' }}
              </button>
              
              <button 
                v-if="selectedMode === 'edit' && currentClub" 
                type="submit" 
                class="action-btn edit-btn"
                :disabled="loading"
              >
                {{ loading ? 'Обновление...' : 'Обновить клуб' }}
              </button>
              
              <button 
                v-if="selectedMode === 'delete' && currentClub" 
                type="button" 
                class="action-btn delete-btn"
                @click="deleteClub"
                :disabled="loading || playersCount > 0"
              >
                {{ loading ? 'Проверка...' : (playersCount > 0 ? 'Невозможно удалить' : 'Удалить клуб') }}
              </button>
            </div>
          </form>
        </div>

        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import AdminSidebar from '@/components/AdminSidebar.vue'
import axios from 'axios'

export default {
  name: 'ClubsAdmin',
  components: {
    AdminSidebar
  },
  setup() {
    const adminStore = useAdminStore()
    
    const selectedMode = ref('add')
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('')
    const currentClub = ref(null)
    const playersCount = ref(0)
    
    const options = reactive({
      clubs: []
    })
    
    const searchFilters = reactive({
      club_name: ''
    })
    
    const clubForm = reactive({
      name: '',
      average_age: '',
      squad_size: '',
      stadium_name: '',
      stadium_seats: '',
      coach_name: ''
    })
    
    const errors = reactive({})

    const loadOptions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin/clubs/options/', {
          withCredentials: true
        })
        options.clubs = response.data.clubs
      } catch (error) {
        showMessage('Ошибка загрузки данных', 'error')
      }
    }

    const searchClub = async () => {
      loading.value = true
      message.value = ''
      
      try {
        const params = new URLSearchParams({ club_name: searchFilters.club_name })
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/clubs/search/?${params}`, {
          withCredentials: true
        })
        
        currentClub.value = response.data
        fillClubForm(response.data)
        
        await loadPlayersCount(response.data.club_id)
        
        showMessage('Клуб найден', 'success')
      } catch (error) {
        if (error.response?.status === 404) {
          showMessage('Клуб не найден', 'error')
        } else {
          showMessage('Ошибка поиска клуба', 'error')
        }
        currentClub.value = null
        playersCount.value = 0
        resetForm()
      } finally {
        loading.value = false
      }
    }

    const loadPlayersCount = async (clubId) => {
      try {
        const params = new URLSearchParams({ club_id: clubId })
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/clubs/club_players_count/?${params}`, {
          withCredentials: true
        })
        playersCount.value = response.data.players_count
      } catch (error) {
        console.error('Error loading players count:', error)
        playersCount.value = 0
      }
    }

    const fillClubForm = (clubData) => {
      Object.keys(clubForm).forEach(key => {
        if (clubData[key] !== undefined && clubData[key] !== null) {
          clubForm[key] = clubData[key]
        } else {
          clubForm[key] = ''
        }
      })
    }

    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!clubForm.name.trim()) {
        errors.name = 'Название клуба обязательно'
      }
      
      if (clubForm.average_age && (clubForm.average_age < 16 || clubForm.average_age > 40)) {
        errors.average_age = 'Средний возраст должен быть между 16 и 40 годами'
      }
      
      if (clubForm.squad_size && (clubForm.squad_size < 1 || clubForm.squad_size > 50)) {
        errors.squad_size = 'Размер состава должен быть между 1 и 50 игроками'
      }
      
      if (clubForm.stadium_seats && clubForm.stadium_seats < 0) {
        errors.stadium_seats = 'Вместимость не может быть отрицательной'
      }
      
      if (clubForm.stadium_seats && clubForm.stadium_seats > 200000) {
        errors.stadium_seats = 'Вместимость не может превышать 200,000 мест'
      }
      
      return Object.keys(errors).length === 0
    }

    const addClub = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/admin/clubs/create_club/',
          clubForm,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
        resetForm()
        loadOptions()
      } catch (error) {
        handleApiError(error, 'добавления')
      }
    }

    const updateClub = async () => {
      try {
        const updateData = {
          club_id: currentClub.value.club_id,
          ...clubForm
        }
        
        const response = await axios.put(
          'http://127.0.0.1:8000/api/admin/clubs/update_club/',
          updateData,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
      } catch (error) {
        handleApiError(error, 'обновления')
      }
    }

    const deleteClub = async () => {
      if (playersCount.value > 0) {
        showMessage('Невозможно удалить клуб с игроками', 'error')
        return
      }
      
      if (!confirm('Вы уверены, что хотите удалить этот клуб?')) {
        return
      }
      
      loading.value = true
      
      try {
        const params = new URLSearchParams({
          club_id: currentClub.value.club_id
        })
        
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/admin/clubs/delete_club/?${params}`,
          { withCredentials: true }
        )
        
        showMessage(response.data.message, 'success')
        resetForm()
        currentClub.value = null
        playersCount.value = 0
        searchFilters.club_name = ''
        loadOptions()
      } catch (error) {
        if (error.response?.status === 400) {
          showMessage(error.response.data.detail, 'error')
        } else {
          handleApiError(error, 'удаления')
        }
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = () => {
      if (!validateForm()) return
      
      loading.value = true
      message.value = ''
      
      if (selectedMode.value === 'add') {
        addClub()
      } else if (selectedMode.value === 'edit') {
        updateClub()
      }
      
      loading.value = false
    }

    const resetForm = () => {
      Object.keys(clubForm).forEach(key => {
        clubForm[key] = ''
      })
      Object.keys(errors).forEach(key => {
        delete errors[key]
      })
      currentClub.value = null
      playersCount.value = 0
      searchFilters.club_name = ''
      message.value = ''
    }

    const showMessage = (text, type) => {
      message.value = text
      messageType.value = type
    }

    const handleApiError = (error, action) => {
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          const errorMessages = []
          for (const field in error.response.data) {
            if (Array.isArray(error.response.data[field])) {
              errorMessages.push(...error.response.data[field])
            } else {
              errorMessages.push(error.response.data[field])
            }
          }
          showMessage(`Ошибка ${action}: ${errorMessages.join(', ')}`, 'error')
        } else {
          showMessage(`Ошибка ${action}: ${error.response.data}`, 'error')
        }
      } else {
        showMessage(`Ошибка ${action}`, 'error')
      }
      loading.value = false
    }

    const formatCurrency = (value) => {
      if (!value || value === 0) return '-'
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value).replace('€', '€ ')
    }

    onMounted(() => {
      loadOptions()
    })

    return {
      selectedMode,
      loading,
      message,
      messageType,
      currentClub,
      playersCount,
      options,
      searchFilters,
      clubForm,
      errors,
      searchClub,
      handleSubmit,
      deleteClub,
      resetForm,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.admin-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header h1 {
  color: #2c3e50;
  font-size: 2.2em;
  margin-bottom: 10px;
}

.admin-header p {
  color: #666;
  font-size: 1.1em;
}

.mode-selector {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.mode-options {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.mode-option:hover {
  color: #3498db;
}

.mode-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #bdc3c7;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.mode-option input[type="radio"]:checked + .radio-custom {
  border-color: #3498db;
  background: #3498db;
}

.mode-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.search-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.search-filters {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9em;
}

.search-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
  height: fit-content;
}

.search-btn:hover:not(:disabled) {
  background: #2980b9;
}

.search-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.club-info-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.warning-icon {
  font-size: 2em;
}

.warning-header h3 {
  color: #856404;
  margin: 0;
  font-size: 1.3em;
}

.warning-content p {
  margin: 8px 0;
  color: #856404;
}

.warning-danger {
  color: #dc3545 !important;
  font-weight: 600;
}

.warning-safe {
  color: #28a745 !important;
  font-weight: 600;
}

.club-form-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9em;
}

.form-input {
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.form-input.error {
  border-color: #e74c3c;
}

.form-input.readonly {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85em;
  margin-top: 5px;
}

.additional-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border-left: 4px solid #3498db;
}

.additional-info h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.9em;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.1em;
}

.form-actions {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.action-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-btn {
  background: #27ae60;
  color: white;
}

.add-btn:hover:not(:disabled) {
  background: #219653;
}

.edit-btn {
  background: #3498db;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background: #2980b9;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #c0392b;
}

.message {
  padding: 15px 20px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .admin-container {
    padding: 20px;
  }
  
  .mode-options {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-filters {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>