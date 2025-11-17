<template>
  <div id="mainblock">
    <AdminSidebar />
    
    <div id="content">
      <div class="admin-container">
        <div class="admin-header">
          <h1>Управление матчами</h1>
          <p>Добавление, редактирование и удаление информации о матчах</p>
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
              Добавить матч
            </label>
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="edit" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Редактировать матч
            </label>
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="delete" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Удалить матч
            </label>
          </div>
        </div>

        <div v-if="selectedMode !== 'add'" class="search-section">
          <div class="search-filters">
            <div class="filter-group">
              <label>Домашняя команда:</label>
              <select v-model="searchFilters.home_team" class="form-select">
                <option value="">Выберите команду</option>
                <option v-for="team in options.home_teams" :key="'home-' + team" :value="team">
                  {{ team }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label>Гостевая команда:</label>
              <select v-model="searchFilters.away_team" class="form-select">
                <option value="">Выберите команду</option>
                <option v-for="team in options.away_teams" :key="'away-' + team" :value="team">
                  {{ team }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label>Дата игры:</label>
              <select v-model="searchFilters.date" class="form-select">
                <option value="">Выберите дату</option>
                <option v-for="date in options.dates" :key="date" :value="date">
                  {{ formatDisplayDate(date) }}
                </option>
              </select>
            </div>
            <button 
              @click="searchGame" 
              class="search-btn"
              :disabled="!canSearch"
            >
              Найти матч
            </button>
          </div>
        </div>

        <div class="game-form-section">
          <form @submit.prevent="handleSubmit" class="game-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Домашняя команда:</label>
                <input
                  v-model="gameForm.home_club_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.home_club_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Название домашней команды"
                  required
                >
                <span v-if="errors.home_club_name" class="error-text">{{ errors.home_club_name }}</span>
              </div>

              <div class="form-group">
                <label>Гостевая команда:</label>
                <input
                  v-model="gameForm.away_club_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.away_club_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Название гостевой команды"
                  required
                >
                <span v-if="errors.away_club_name" class="error-text">{{ errors.away_club_name }}</span>
              </div>

              <div class="form-group">
                <label>Счёт:</label>
                <input
                  v-model="gameForm.aggregate"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.aggregate, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Например: 2:1"
                  required
                >
                <span v-if="errors.aggregate" class="error-text">{{ errors.aggregate }}</span>
              </div>

              <div class="form-group">
                <label>Дата:</label>
                <input
                  v-model="gameForm.date"
                  type="date"
                  class="form-input"
                  :class="{ 'error': errors.date, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  required
                >
                <span v-if="errors.date" class="error-text">{{ errors.date }}</span>
              </div>

              <div class="form-group">
                <label>Стадион:</label>
                <input
                  v-model="gameForm.stadium"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.stadium, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Название стадиона"
                >
                <span v-if="errors.stadium" class="error-text">{{ errors.stadium }}</span>
              </div>

              <div class="form-group">
                <label>Посещаемость:</label>
                <input
                  v-model="gameForm.attendance"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.attendance, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Количество зрителей"
                >
                <span v-if="errors.attendance" class="error-text">{{ errors.attendance }}</span>
              </div>

              <div class="form-group">
                <label>Тактика домашней команды:</label>
                <input
                  v-model="gameForm.home_club_formation"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.home_club_formation, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Например: 4-3-3"
                >
                <span v-if="errors.home_club_formation" class="error-text">{{ errors.home_club_formation }}</span>
              </div>

              <div class="form-group">
                <label>Тактика гостевой команды:</label>
                <input
                  v-model="gameForm.away_club_formation"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.away_club_formation, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Например: 4-4-2"
                >
                <span v-if="errors.away_club_formation" class="error-text">{{ errors.away_club_formation }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button 
                v-if="selectedMode === 'add'" 
                type="submit" 
                class="action-btn add-btn"
                :disabled="loading"
              >
                {{ loading ? 'Добавление...' : 'Добавить матч' }}
              </button>
              
              <button 
                v-if="selectedMode === 'edit' && currentGame" 
                type="submit" 
                class="action-btn edit-btn"
                :disabled="loading"
              >
                {{ loading ? 'Обновление...' : 'Обновить матч' }}
              </button>
              
              <button 
                v-if="selectedMode === 'delete' && currentGame" 
                type="button" 
                class="action-btn delete-btn"
                @click="deleteGame"
                :disabled="loading"
              >
                {{ loading ? 'Удаление...' : 'Удалить матч' }}
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
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default {
  name: 'GamesAdmin',
  components: {
    AdminSidebar
  },
  setup() {
    const adminStore = useAdminStore()
    
    const selectedMode = ref('add')
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('')
    const currentGame = ref(null)
    
    const options = reactive({
      home_teams: [],
      away_teams: [],
      dates: []
    })
    
    const searchFilters = reactive({
      home_team: '',
      away_team: '',
      date: ''
    })
    
    const gameForm = reactive({
      home_club_name: '',
      away_club_name: '',
      aggregate: '',
      date: '',
      stadium: '',
      attendance: '',
      home_club_formation: '',
      away_club_formation: ''
    })
    
    const errors = reactive({})

    const canSearch = computed(() => {
      return searchFilters.home_team && searchFilters.away_team && searchFilters.date
    })

    const loadOptions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin/games/options/', {
          withCredentials: true
        })
        Object.assign(options, response.data)
      } catch (error) {
        showMessage('Ошибка загрузки данных', 'error')
      }
    }

    const searchGame = async () => {
      loading.value = true
      message.value = ''
      
      try {
        const params = new URLSearchParams(searchFilters)
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/games/search/?${params}`, {
          withCredentials: true
        })
        
        currentGame.value = response.data
        Object.assign(gameForm, response.data)
        showMessage('Матч найден', 'success')
      } catch (error) {
        if (error.response?.status === 404) {
          showMessage('Матч не найден', 'error')
        } else {
          showMessage('Ошибка поиска матча', 'error')
        }
        currentGame.value = null
        resetForm()
      } finally {
        loading.value = false
      }
    }

    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!gameForm.home_club_name.trim()) {
        errors.home_club_name = 'Домашняя команда обязательна'
      }
      
      if (!gameForm.away_club_name.trim()) {
        errors.away_club_name = 'Гостевая команда обязательна'
      }
      
      if (!gameForm.aggregate.trim()) {
        errors.aggregate = 'Счёт обязателен'
      }
      
      if (!gameForm.date) {
        errors.date = 'Дата обязательна'
      }
      
      return Object.keys(errors).length === 0
    }

    const addGame = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/admin/games/create_game/',
          gameForm,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
        resetForm()
      } catch (error) {
        handleApiError(error, 'добавления')
      }
    }

    const updateGame = async () => {
      try {
        const updateData = {
          game_id: currentGame.value.game_id,
          ...gameForm
        }
        
        const response = await axios.put(
          'http://127.0.0.1:8000/api/admin/games/update_game/',
          updateData,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
      } catch (error) {
        handleApiError(error, 'обновления')
      }
    }

    const deleteGame = async () => {
      if (!confirm('Вы уверены, что хотите удалить этот матч?')) {
        return
      }
      
      loading.value = true
      
      try {
        const params = new URLSearchParams({
          game_id: currentGame.value.game_id
        })
        
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/admin/games/delete_game/?${params}`,
          { withCredentials: true }
        )
        
        showMessage(response.data.message, 'success')
        resetForm()
        currentGame.value = null
      } catch (error) {
        handleApiError(error, 'удаления')
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = () => {
      if (!validateForm()) return
      
      loading.value = true
      message.value = ''
      
      if (selectedMode.value === 'add') {
        addGame()
      } else if (selectedMode.value === 'edit') {
        updateGame()
      }
      
      loading.value = false
    }

    const resetForm = () => {
      Object.keys(gameForm).forEach(key => {
        gameForm[key] = ''
      })
      Object.keys(errors).forEach(key => {
        delete errors[key]
      })
      currentGame.value = null
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

    const formatDisplayDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }

    onMounted(() => {
      loadOptions()
    })

    return {
      selectedMode,
      loading,
      message,
      messageType,
      currentGame,
      options,
      searchFilters,
      gameForm,
      errors,
      canSearch,
      searchGame,
      handleSubmit,
      deleteGame,
      resetForm,
      formatDisplayDate
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

.search-section{
  height: 40px;
  background-color:#1F1C1C;
  color:white;
  border-style: solid;
  border-color: #47642A;
  border-radius: 4px;
}

.admin-header h1 {
  color: white;
  font-size: 2.2em;
  margin-bottom: 10px;
}

.admin-header p {
  color: white;
  font-size: 1.1em;
}

.mode-selector {
  background: #47642A;
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
  color: white;
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
  background: #2C332C;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.search-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  color: white;
  font-size: 0.9em;
}

.search-btn {
  background: #47642A;
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
  background: #47642A;
}

.search-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.game-form-section {
  background: #2C332C;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: white;
  font-size: 0.9em;
}

.form-input {
  padding: 12px 15px;
  border: 2px solid #47642A;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease;
  background: #1F1C1C;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.form-input.error {
  border-color: #e74c3c;
}

.form-input.readonly {
  background: #1F1C1C;
  color: #6c757d;
  cursor: not-allowed;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85em;
  margin-top: 5px;
}

.form-actions {
  text-align: center;
  padding-top: 20px;
  border-top: 3px solid #47642A;
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
  
  .action-btn {
    width: 100%;
  }
}
</style>