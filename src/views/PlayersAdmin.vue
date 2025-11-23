<template>
  <div id="mainblock">
    <AdminSidebar />
    
    <div id="content">
      <div class="admin-container">
        <div class="admin-header">
          <h1>Управление игроками</h1>
          <p>Добавление, редактирование и удаление информации об игроках</p>
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
              Добавить игрока
            </label>
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="edit" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Редактировать игрока
            </label>
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="delete" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Удалить игрока
            </label>
          </div>
        </div>

        <div v-if="selectedMode !== 'add'" class="search-section">
          <div class="search-filters">
            <div class="filter-group">
              <label>Команда:</label>
              <select v-model="searchFilters.club_id" @change="loadPlayersByClub" class="form-select">
                <option value="">Выберите команду</option>
                <option v-for="club in options.clubs" :key="club.club_id" :value="club.club_id">
                  {{ club.name }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label>Игрок:</label>
              <select v-model="searchFilters.player_id" class="form-select" :disabled="!searchFilters.club_id">
                <option value="">Выберите игрока</option>
                <option v-for="player in clubPlayers" :key="player.player_id" :value="player.player_id">
                  {{ player.name }} ({{ player.current_club_name }})
                </option>
              </select>
            </div>
            <button 
              @click="searchPlayer" 
              class="search-btn"
              :disabled="!canSearch"
            >
              Найти игрока
            </button>
          </div>
        </div>

        <div class="player-form-section">
          <form @submit.prevent="handleSubmit" class="player-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Имя:</label>
                <input
                  v-model="playerForm.first_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.first_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Имя игрока"
                  required
                >
                <span v-if="errors.first_name" class="error-text">{{ errors.first_name }}</span>
              </div>

              <div class="form-group">
                <label>Фамилия:</label>
                <input
                  v-model="playerForm.last_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.last_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Фамилия игрока"
                  required
                >
                <span v-if="errors.last_name" class="error-text">{{ errors.last_name }}</span>
              </div>

              <div class="form-group">
                <label>Текущий клуб:</label>
                <select
                  v-model="playerForm.current_club_id"
                  class="form-input"
                  :class="{ 'error': errors.current_club_id, 'readonly': selectedMode === 'delete' }"
                  :disabled="selectedMode === 'delete'"
                  required
                >
                  <option value="">Выберите клуб</option>
                  <option v-for="club in options.clubs" :key="club.club_id" :value="club.club_id">
                    {{ club.name }}
                  </option>
                </select>
                <span v-if="errors.current_club_id" class="error-text">{{ errors.current_club_id }}</span>
              </div>

              <div class="form-group">
                <label>Страна рождения:</label>
                <input
                  v-model="playerForm.country_of_birth"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.country_of_birth, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Страна рождения"
                >
                <span v-if="errors.country_of_birth" class="error-text">{{ errors.country_of_birth }}</span>
              </div>

              <div class="form-group">
                <label>Дата рождения:</label>
                <input
                  v-model="playerForm.date_of_birth"
                  type="date"
                  class="form-input"
                  :class="{ 'error': errors.date_of_birth, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                >
                <span v-if="errors.date_of_birth" class="error-text">{{ errors.date_of_birth }}</span>
              </div>

              <div class="form-group">
                <label>Позиция:</label>
                <select
                  v-model="playerForm.sub_position"
                  class="form-input"
                  :class="{ 'error': errors.sub_position, 'readonly': selectedMode === 'delete' }"
                  :disabled="selectedMode === 'delete'"
                >
                  <option value="">Выберите позицию</option>
                  <option value="Goalkeeper">Вратарь</option>
                  <option value="Centre-Back">Центральный защитник</option>
                  <option value="Left-Back">Левый защитник</option>
                  <option value="Right-Back">Правый защитник</option>
                  <option value="Defensive Midfield">Опорный полузащитник</option>
                  <option value="Central Midfield">Центральный полузащитник</option>
                  <option value="Attacking Midfield">Атакующий полузащитник</option>
                  <option value="Left Winger">Левый вингер</option>
                  <option value="Right Winger">Правый вингер</option>
                  <option value="Centre-Forward">Центральный нападающий</option>
                  <option value="Second Striker">Второй нападающий</option>
                </select>
                <span v-if="errors.sub_position" class="error-text">{{ errors.sub_position }}</span>
              </div>

              <div class="form-group">
                <label>Рост (см):</label>
                <input
                  v-model="playerForm.height_in_cm"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.height_in_cm, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Рост в сантиметрах"
                  min="150"
                  max="220"
                >
                <span v-if="errors.height_in_cm" class="error-text">{{ errors.height_in_cm }}</span>
              </div>

              <div class="form-group">
                <label>Рабочая нога:</label>
                <select
                  v-model="playerForm.foot"
                  class="form-input"
                  :class="{ 'error': errors.foot, 'readonly': selectedMode === 'delete' }"
                  :disabled="selectedMode === 'delete'"
                >
                  <option value="">Выберите ногу</option>
                  <option value="right">Правая</option>
                  <option value="left">Левая</option>
                  <option value="both">Обе</option>
                </select>
                <span v-if="errors.foot" class="error-text">{{ errors.foot }}</span>
              </div>

              <div class="form-group">
                <label>Стоимость (€):</label>
                <input
                  v-model="playerForm.market_value_in_eur"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.market_value_in_eur, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Рыночная стоимость в евро"
                  min="0"
                  step="1000"
                >
                <span v-if="errors.market_value_in_eur" class="error-text">{{ errors.market_value_in_eur }}</span>
              </div>
            </div>

            <div v-if="selectedMode === 'add'" class="name-preview">
              <strong>Полное имя:</strong> {{ fullNamePreview }}
            </div>

            <div class="form-actions">
              <button 
                v-if="selectedMode === 'add'" 
                type="submit" 
                class="action-btn add-btn"
                :disabled="loading"
              >
                {{ loading ? 'Добавление...' : 'Добавить игрока' }}
              </button>
              
              <button 
                v-if="selectedMode === 'edit' && currentPlayer" 
                type="submit" 
                class="action-btn edit-btn"
                :disabled="loading"
              >
                {{ loading ? 'Обновление...' : 'Обновить игрока' }}
              </button>
              
              <button 
                v-if="selectedMode === 'delete' && currentPlayer" 
                type="button" 
                class="action-btn delete-btn"
                @click="deletePlayer"
                :disabled="loading"
              >
                {{ loading ? 'Удаление...' : 'Удалить игрока' }}
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import AdminSidebar from '@/components/AdminSidebar.vue'
import axios from 'axios'
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export default {
  name: 'PlayersAdmin',
  components: {
    AdminSidebar
  },
  setup() {
    const adminStore = useAdminStore()
    
    const selectedMode = ref('add')
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('')
    const currentPlayer = ref(null)
    const clubPlayers = ref([])
    
    const options = reactive({
      clubs: [],
      players: []
    })
    
    const searchFilters = reactive({
      club_id: '',
      player_id: ''
    })
    
    const playerForm = reactive({
      first_name: '',
      last_name: '',
      current_club_id: '',
      country_of_birth: '',
      date_of_birth: '',
      sub_position: '',
      height_in_cm: '',
      foot: '',
      market_value_in_eur: ''
    })
    
    const errors = reactive({})

    const canSearch = computed(() => {
      return searchFilters.club_id && searchFilters.player_id
    })

    const fullNamePreview = computed(() => {
      const firstName = playerForm.first_name.trim()
      const lastName = playerForm.last_name.trim()
      return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Не указано'
    })

    const loadOptions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin/players/options/', {
          withCredentials: true
        })
        options.clubs = response.data.clubs || []
        options.players = response.data.players || []
      } catch (error) {
        console.error('Ошибка загрузки опций:', error)
        showMessage('Ошибка загрузки данных', 'error')
      }
    }

    const loadPlayersByClub = async () => {
      if (!searchFilters.club_id) {
        clubPlayers.value = []
        searchFilters.player_id = ''
        return
      }

      try {
        const params = new URLSearchParams({ club_id: searchFilters.club_id })
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/players/players_by_club/?${params}`, {
          withCredentials: true
        })
        clubPlayers.value = response.data
        searchFilters.player_id = ''
      } catch (error) {
        console.error('Ошибка загрузки игроков:', error)
        showMessage('Ошибка загрузки игроков', 'error')
        clubPlayers.value = []
      }
    }

    const searchPlayer = async () => {
      loading.value = true
      message.value = ''
      
      try {
        const params = new URLSearchParams({ player_id: searchFilters.player_id })
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/players/search/?${params}`, {
          withCredentials: true
        })
        
        currentPlayer.value = response.data
        fillPlayerForm(response.data)
        showMessage('Игрок найден', 'success')
      } catch (error) {
        console.error('Ошибка поиска игрока:', error)
        if (error.response?.status === 404) {
          showMessage('Игрок не найден', 'error')
        } else {
          showMessage('Ошибка поиска игрока', 'error')
        }
        currentPlayer.value = null
        resetForm()
      } finally {
        loading.value = false
      }
    }

    const fillPlayerForm = (playerData) => {
      Object.keys(playerForm).forEach(key => {
        if (playerData[key] !== undefined && playerData[key] !== null) {
          playerForm[key] = playerData[key]
        } else {
          playerForm[key] = ''
        }
      })
    }

    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!playerForm.first_name.trim()) {
        errors.first_name = 'Имя обязательно'
      }
      
      if (!playerForm.last_name.trim()) {
        errors.last_name = 'Фамилия обязательна'
      }
      
      if (!playerForm.current_club_id) {
        errors.current_club_id = 'Текущий клуб обязателен'
      }
      
      if (playerForm.height_in_cm && (playerForm.height_in_cm < 150 || playerForm.height_in_cm > 220)) {
        errors.height_in_cm = 'Рост должен быть между 150 и 220 см'
      }
      
      if (playerForm.market_value_in_eur && playerForm.market_value_in_eur < 0) {
        errors.market_value_in_eur = 'Стоимость не может быть отрицательной'
      }
      
      return Object.keys(errors).length === 0
    }

    const addPlayer = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/admin/players/create_player/',
          playerForm,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
        resetForm()
      } catch (error) {
        handleApiError(error, 'добавления')
      }
    }

    const updatePlayer = async () => {
      try {
        const updateData = {
          player_id: currentPlayer.value.player_id,
          ...playerForm
        }
        
        const response = await axios.put(
          'http://127.0.0.1:8000/api/admin/players/update_player/',
          updateData,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
      } catch (error) {
        handleApiError(error, 'обновления')
      }
    }

    const deletePlayer = async () => {
      if (!confirm('Вы уверены, что хотите удалить этого игрока?')) {
        return
      }
      
      loading.value = true
      
      try {
        const params = new URLSearchParams({
          player_id: currentPlayer.value.player_id
        })
        
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/admin/players/delete_player/?${params}`,
          { withCredentials: true }
        )
        
        showMessage(response.data.message, 'success')
        resetForm()
        currentPlayer.value = null
        searchFilters.player_id = ''
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
        addPlayer()
      } else if (selectedMode.value === 'edit') {
        updatePlayer()
      }
      
      loading.value = false
    }

    const resetForm = () => {
      Object.keys(playerForm).forEach(key => {
        playerForm[key] = ''
      })
      Object.keys(errors).forEach(key => {
        delete errors[key]
      })
      currentPlayer.value = null
      searchFilters.club_id = ''
      searchFilters.player_id = ''
      clubPlayers.value = []
      message.value = ''
    }

    const showMessage = (text, type) => {
      message.value = text
      messageType.value = type
    }

    const handleApiError = (error, action) => {
      console.error(`Ошибка ${action}:`, error)
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

    onMounted(() => {
      loadOptions()
    })

    return {
      selectedMode,
      loading,
      message,
      messageType,
      currentPlayer,
      clubPlayers,
      options,
      searchFilters,
      playerForm,
      errors,
      canSearch,
      fullNamePreview,
      searchPlayer,
      loadPlayersByClub,
      handleSubmit,
      deletePlayer,
      resetForm
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

.form-select{
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  background: #2980b9;
}

.search-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.player-form-section {
  background: #2C332C;
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
  color: #6c757d;
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

.name-preview {
  background: #47642A;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  text-align: center;
  border-left: 4px solid #3498db;
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