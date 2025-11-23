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
              <select 
                v-model="searchFilters.home_club_id" 
                @change="updateFilteredOptions"
                class="form-select"
              >
                <option value="">Выберите команду</option>
                <option 
                  v-for="club in filteredHomeClubs" 
                  :key="'search-home-' + club.club_id" 
                  :value="club.club_id"
                >
                  {{ club.name }}
                </option>
              </select>
              <div class="filter-info" v-if="searchFilters.home_club_id">
                Доступно гостевых команд: {{ filteredAwayClubs.length }}
              </div>
            </div>

            <div class="filter-group">
              <label>Гостевая команда:</label>
              <select 
                v-model="searchFilters.away_club_id" 
                @change="updateFilteredOptions"
                class="form-select"
              >
                <option value="">Выберите команду</option>
                <option 
                  v-for="club in filteredAwayClubs" 
                  :key="'search-away-' + club.club_id" 
                  :value="club.club_id"
                >
                  {{ club.name }}
                </option>
              </select>
              <div class="filter-info" v-if="searchFilters.away_club_id">
                Доступно домашних команд: {{ filteredHomeClubs.length }}
              </div>
            </div>

            <div class="filter-group">
              <label>Дата игры:</label>
              <select 
                v-model="searchFilters.date" 
                @change="updateFilteredOptions"
                class="form-select"
              >
                <option value="">Выберите дату</option>
                <option 
                  v-for="date in filteredDates" 
                  :key="date" 
                  :value="date"
                >
                  {{ formatDisplayDate(date) }}
                </option>
              </select>
              <div class="filter-info" v-if="searchFilters.date">
                Доступно матчей: {{ getMatchesCountForDate() }}
              </div>
            </div>

            <button 
              @click="searchGame" 
              class="search-btn"
              :disabled="!canSearch"
            >
              Найти матч
            </button>
          </div>

          <!-- Статус фильтров -->
          <div class="filter-status" v-if="hasActiveSearchFilters">
            <div class="status-item" v-if="searchFilters.home_club_id">
              <strong>Домашняя:</strong> {{ getClubName(searchFilters.home_club_id) }}
              <span class="remove-filter" @click="removeSearchFilter('home')">×</span>
            </div>
            <div class="status-item" v-if="searchFilters.away_club_id">
              <strong>Гостевая:</strong> {{ getClubName(searchFilters.away_club_id) }}
              <span class="remove-filter" @click="removeSearchFilter('away')">×</span>
            </div>
            <div class="status-item" v-if="searchFilters.date">
              <strong>Дата:</strong> {{ formatDisplayDate(searchFilters.date) }}
              <span class="remove-filter" @click="removeSearchFilter('date')">×</span>
            </div>
          </div>

          <!-- Информация о возможных матчах -->
          <div class="options-info" v-if="hasActiveSearchFilters">
            <p>
              <span v-if="filteredHomeClubs.length > 0 && filteredAwayClubs.length > 0">
                Найдено {{ getPossibleMatchesCount() }} возможных матчей
              </span>
              <span v-else class="warning">
                По текущим фильтрам матчи не найдены. Попробуйте изменить условия поиска.
              </span>
            </p>
          </div>
        </div>

        <div class="game-form-section">
          <form @submit.prevent="handleSubmit" class="game-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Домашняя команда:</label>
                <select
                  v-model="gameForm.home_club_id"
                  class="form-input"
                  :class="{ 'error': errors.home_club_id, 'readonly': selectedMode === 'delete' }"
                  :disabled="selectedMode === 'delete'"
                  required
                >
                  <option value="">Выберите команду</option>
                  <option 
                    v-for="club in options.clubs" 
                    :key="'form-home-' + club.club_id" 
                    :value="club.club_id"
                  >
                    {{ club.name }}
                  </option>
                </select>
                <span v-if="errors.home_club_id" class="error-text">{{ errors.home_club_id }}</span>
              </div>

              <div class="form-group">
                <label>Гостевая команда:</label>
                <select
                  v-model="gameForm.away_club_id"
                  class="form-input"
                  :class="{ 'error': errors.away_club_id, 'readonly': selectedMode === 'delete' }"
                  :disabled="selectedMode === 'delete'"
                  required
                >
                  <option value="">Выберите команду</option>
                  <option 
                    v-for="club in options.clubs" 
                    :key="'form-away-' + club.club_id" 
                    :value="club.club_id"
                  >
                    {{ club.name }}
                  </option>
                </select>
                <span v-if="errors.away_club_id" class="error-text">{{ errors.away_club_id }}</span>
              </div>

              <div class="form-group">
                <label>Голы домашней команды:</label>
                <input
                  v-model.number="gameForm.home_club_goals"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.home_club_goals, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="0"
                  min="0"
                >
                <span v-if="errors.home_club_goals" class="error-text">{{ errors.home_club_goals }}</span>
              </div>

              <div class="form-group">
                <label>Голы гостевой команды:</label>
                <input
                  v-model.number="gameForm.away_club_goals"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.away_club_goals, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="0"
                  min="0"
                >
                <span v-if="errors.away_club_goals" class="error-text">{{ errors.away_club_goals }}</span>
              </div>

              <div class="form-group">
                <label>Общий счёт:</label>
                <input
                  v-model="gameForm.aggregate"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.aggregate, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Например: 2:1"
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
                  v-model.number="gameForm.attendance"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.attendance, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Количество зрителей"
                  min="0"
                >
                <span v-if="errors.attendance" class="error-text">{{ errors.attendance }}</span>
              </div>

              <div class="form-group">
                <label>Судья:</label>
                <input
                  v-model="gameForm.referee"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.referee, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Имя судьи"
                >
                <span v-if="errors.referee" class="error-text">{{ errors.referee }}</span>
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

        <!-- Отображение информации о найденном матче -->
        <div v-if="currentGame && selectedMode !== 'add'" class="game-info">
          <h3>Информация о матче:</h3>
          <div class="game-details">
            <p><strong>ID матча:</strong> {{ currentGame.game_id }}</p>
            <p><strong>Домашняя команда:</strong> {{ currentGame.home_club_name }}</p>
            <p><strong>Гостевая команда:</strong> {{ currentGame.away_club_name }}</p>
            <p><strong>Счёт:</strong> {{ currentGame.home_club_goals }}:{{ currentGame.away_club_goals }}</p>
            <p><strong>Дата:</strong> {{ formatDisplayDate(currentGame.date) }}</p>
          </div>
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
import { debounce } from 'lodash'

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
      clubs: [],
      dates: []
    })
    
    const searchFilters = reactive({
      home_club_id: '',
      away_club_id: '',
      date: ''
    })
    
    const filteredOptions = reactive({
      home_clubs: [],
      away_clubs: [],
      dates: []
    })
    
    const gameForm = reactive({
      home_club_id: '',
      away_club_id: '',
      home_club_goals: null,
      away_club_goals: null,
      aggregate: '',
      date: '',
      stadium: '',
      attendance: null,
      referee: '',
      home_club_formation: '',
      away_club_formation: ''
    })
    
    const errors = reactive({})

    const canSearch = computed(() => {
      return searchFilters.home_club_id && searchFilters.away_club_id && searchFilters.date
    })

    const hasActiveSearchFilters = computed(() => {
      return searchFilters.home_club_id || searchFilters.away_club_id || searchFilters.date
    })

    const filteredHomeClubs = computed(() => {
      return filteredOptions.home_clubs.length > 0 ? filteredOptions.home_clubs : options.clubs
    })

    const filteredAwayClubs = computed(() => {
      return filteredOptions.away_clubs.length > 0 ? filteredOptions.away_clubs : options.clubs
    })

    const filteredDates = computed(() => {
      return filteredOptions.dates.length > 0 ? filteredOptions.dates : options.dates
    })

    const loadOptions = async () => {
      try {
        console.log('Загрузка опций...')
        const response = await axios.get('http://127.0.0.1:8000/api/admin/games/options/', {
          withCredentials: true
        })
        console.log('Получены опции:', response.data)
        options.clubs = response.data.clubs || []
        options.dates = response.data.dates || []
        
        // Инициализируем отфильтрованные опции
        filteredOptions.home_clubs = [...options.clubs]
        filteredOptions.away_clubs = [...options.clubs]
        filteredOptions.dates = [...options.dates]
        
        console.log('Клубы загружены:', options.clubs.length)
      } catch (error) {
        console.error('Ошибка загрузки опций:', error)
        showMessage('Ошибка загрузки данных', 'error')
      }
    }

    const updateFilteredOptions = async () => {
      debouncedUpdateFilteredOptions()
    }

    const debouncedUpdateFilteredOptions = debounce(async () => {
      try {
        const params = new URLSearchParams()
        if (searchFilters.home_club_id) params.append('home_club_id', searchFilters.home_club_id)
        if (searchFilters.away_club_id) params.append('away_club_id', searchFilters.away_club_id)
        if (searchFilters.date) params.append('date', searchFilters.date)

        const url = `http://127.0.0.1:8000/api/admin/games/filtered_options/?${params.toString()}`
        console.log('Запрос фильтрованных опций:', url)
        
        const response = await axios.get(url, {
          withCredentials: true
        })
        
        const data = response.data
        console.log('Получены фильтрованные опции:', data)
        
        filteredOptions.home_clubs = data.home_clubs || []
        filteredOptions.away_clubs = data.away_clubs || []
        filteredOptions.dates = data.dates || []
        
        // Сбрасываем значения, если они больше не доступны
        if (searchFilters.home_club_id && !filteredOptions.home_clubs.find(c => c.club_id == searchFilters.home_club_id)) {
          searchFilters.home_club_id = ''
        }
        if (searchFilters.away_club_id && !filteredOptions.away_clubs.find(c => c.club_id == searchFilters.away_club_id)) {
          searchFilters.away_club_id = ''
        }
        if (searchFilters.date && !filteredOptions.dates.includes(searchFilters.date)) {
          searchFilters.date = ''
        }
        
      } catch (error) {
        console.error('Ошибка при обновлении фильтров:', error)
      }
    }, 300)

    const searchGame = async () => {
      loading.value = true
      message.value = ''
      
      try {
        const params = new URLSearchParams({
          home_club_id: searchFilters.home_club_id,
          away_club_id: searchFilters.away_club_id,
          date: searchFilters.date
        })
        
        console.log('Поиск матча с параметрами:', params.toString())
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/games/search/?${params}`, {
          withCredentials: true
        })
        
        currentGame.value = response.data
        console.log('Найден матч:', currentGame.value)
        
        // Заполняем форму данными найденного матча
        Object.assign(gameForm, {
          home_club_id: response.data.home_club_id,
          away_club_id: response.data.away_club_id,
          home_club_goals: response.data.home_club_goals,
          away_club_goals: response.data.away_club_goals,
          aggregate: response.data.aggregate || '',
          date: response.data.date,
          stadium: response.data.stadium || '',
          attendance: response.data.attendance,
          referee: response.data.referee || '',
          home_club_formation: response.data.home_club_formation || '',
          away_club_formation: response.data.away_club_formation || ''
        })
        showMessage('Матч найден', 'success')
      } catch (error) {
        console.error('Ошибка поиска:', error)
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

    const getClubName = (clubId) => {
      const club = options.clubs.find(c => c.club_id == clubId)
      return club ? club.name : 'Неизвестная команда'
    }

    const removeSearchFilter = (filterType) => {
      switch (filterType) {
        case 'home':
          searchFilters.home_club_id = ''
          break
        case 'away':
          searchFilters.away_club_id = ''
          break
        case 'date':
          searchFilters.date = ''
          break
      }
      updateFilteredOptions()
    }

    const getPossibleMatchesCount = () => {
      let count = 1
      if (searchFilters.home_club_id) count *= filteredAwayClubs.value.length
      if (searchFilters.away_club_id) count *= filteredHomeClubs.value.length
      if (searchFilters.date) count *= filteredDates.value.length
      return count
    }

    const getMatchesCountForDate = () => {
      if (!searchFilters.date) return 0
      return filteredHomeClubs.value.length
    }

    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!gameForm.home_club_id) {
        errors.home_club_id = 'Домашняя команда обязательна'
      }
      
      if (!gameForm.away_club_id) {
        errors.away_club_id = 'Гостевая команда обязательна'
      }
      
      if (gameForm.home_club_id && gameForm.away_club_id && gameForm.home_club_id === gameForm.away_club_id) {
        errors.away_club_id = 'Команды не могут быть одинаковыми'
      }
      
      if (!gameForm.date) {
        errors.date = 'Дата обязательна'
      }
      
      return Object.keys(errors).length === 0
    }

    const addGame = async () => {
      try {
        // Подготавливаем данные для отправки
        const formData = {
          ...gameForm,
          home_club_goals: gameForm.home_club_goals || 0,
          away_club_goals: gameForm.away_club_goals || 0,
          attendance: gameForm.attendance || null
        }
        
        console.log('Отправка данных для создания:', formData)
        const response = await axios.post(
          'http://127.0.0.1:8000/api/admin/games/create_game/',
          formData,
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
          ...gameForm,
          home_club_goals: gameForm.home_club_goals || 0,
          away_club_goals: gameForm.away_club_goals || 0,
          attendance: gameForm.attendance || null
        }
        
        console.log('Отправка данных для обновления:', updateData)
        const response = await axios.put(
          'http://127.0.0.1:8000/api/admin/games/update_game/',
          updateData,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
        // Обновляем текущую игру
        currentGame.value = response.data.game
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
        if (key.includes('_goals') || key === 'attendance') {
          gameForm[key] = null
        } else {
          gameForm[key] = ''
        }
      })
      Object.keys(errors).forEach(key => {
        delete errors[key]
      })
      Object.keys(searchFilters).forEach(key => {
        searchFilters[key] = ''
      })
      // Сбрасываем отфильтрованные опции
      filteredOptions.home_clubs = [...options.clubs]
      filteredOptions.away_clubs = [...options.clubs]
      filteredOptions.dates = [...options.dates]
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
      filteredHomeClubs,
      filteredAwayClubs,
      filteredDates,
      gameForm,
      errors,
      canSearch,
      hasActiveSearchFilters,
      searchGame,
      handleSubmit,
      deleteGame,
      resetForm,
      formatDisplayDate,
      updateFilteredOptions,
      getClubName,
      removeSearchFilter,
      getPossibleMatchesCount,
      getMatchesCountForDate
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

.form-select{
  height: 30px;
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