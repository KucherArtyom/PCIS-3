<template>
  <div id="mainblock">
    <AdminSidebar />
    
    <div id="content">
      <div class="admin-container">
        <div class="admin-header">
          <h1>Управление трансферами</h1>
          <p>Добавление, редактирование и удаление информации о трансферах</p>
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
              Добавить трансфер
            </label>
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="edit" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Редактировать трансфер
            </label>
            <label class="mode-option">
              <input 
                type="radio" 
                v-model="selectedMode" 
                value="delete" 
                @change="resetForm"
              >
              <span class="radio-custom"></span>
              Удалить трансфер
            </label>
          </div>
        </div>

        <div v-if="selectedMode !== 'add'" class="search-section">
          <div class="search-filters">
            <div class="filter-group">
              <label>Уход из клуба:</label>
              <select v-model="searchFilters.from_club" class="form-select">
                <option value="">Выберите клуб</option>
                <option v-for="club in options.from_clubs" :key="'from-' + club" :value="club">
                  {{ club }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label>Переход в клуб:</label>
              <select v-model="searchFilters.to_club" class="form-select">
                <option value="">Выберите клуб</option>
                <option v-for="club in options.to_clubs" :key="'to-' + club" :value="club">
                  {{ club }}
                </option>
              </select>
            </div>
            <button 
              @click="searchTransfers" 
              class="search-btn"
              :disabled="!canSearch"
            >
              Найти трансферы
            </button>
          </div>

          <div v-if="multipleTransfers.length > 0" class="transfers-list">
            <h3>Найдено несколько трансферов:</h3>
            <div class="transfers-grid">
              <div 
                v-for="transfer in multipleTransfers" 
                :key="transfer.id"
                class="transfer-item"
                :class="{ 'selected': selectedTransfer?.id === transfer.id }"
                @click="selectTransfer(transfer)"
              >
                <div class="transfer-player">{{ transfer.player_name }}</div>
                <div class="transfer-clubs">
                  {{ transfer.from_club_name }} → {{ transfer.to_club_name }}
                </div>
                <div class="transfer-date">{{ formatDisplayDate(transfer.transfer_date) }}</div>
                <div class="transfer-value">{{ formatCurrency(transfer.market_value_in_eur) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="transfer-form-section">
          <form @submit.prevent="handleSubmit" class="transfer-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Игрок:</label>
                <input
                  v-model="transferForm.player_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.player_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Имя и фамилия игрока"
                  required
                  list="players-list"
                >
                <datalist id="players-list">
                  <option v-for="player in options.players" :key="player" :value="player"></option>
                </datalist>
                <span v-if="errors.player_name" class="error-text">{{ errors.player_name }}</span>
              </div>

              <div class="form-group">
                <label>Покинул клуб:</label>
                <input
                  v-model="transferForm.from_club_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.from_club_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Название клуба ухода"
                  required
                  list="from-clubs-list"
                >
                <datalist id="from-clubs-list">
                  <option v-for="club in options.from_clubs" :key="'from-' + club" :value="club"></option>
                </datalist>
                <span v-if="errors.from_club_name" class="error-text">{{ errors.from_club_name }}</span>
              </div>

              <div class="form-group">
                <label>Перешёл в клуб:</label>
                <input
                  v-model="transferForm.to_club_name"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.to_club_name, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Название клуба прихода"
                  required
                  list="to-clubs-list"
                >
                <datalist id="to-clubs-list">
                  <option v-for="club in options.to_clubs" :key="'to-' + club" :value="club"></option>
                </datalist>
                <span v-if="errors.to_club_name" class="error-text">{{ errors.to_club_name }}</span>
              </div>

              <div class="form-group">
                <label>Дата перехода:</label>
                <input
                  v-model="transferForm.transfer_date"
                  type="date"
                  class="form-input"
                  :class="{ 'error': errors.transfer_date, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  required
                >
                <span v-if="errors.transfer_date" class="error-text">{{ errors.transfer_date }}</span>
              </div>

              <div class="form-group">
                <label>Сезон перехода:</label>
                <input
                  v-model="transferForm.transfer_season"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.transfer_season, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Например: 2023/2024"
                  required
                >
                <span v-if="errors.transfer_season" class="error-text">{{ errors.transfer_season }}</span>
              </div>

              <div class="form-group">
                <label>Сумма трансфера (€):</label>
                <input
                  v-model="transferForm.market_value_in_eur"
                  type="number"
                  class="form-input"
                  :class="{ 'error': errors.market_value_in_eur, 'readonly': selectedMode === 'delete' }"
                  :readonly="selectedMode === 'delete'"
                  placeholder="Стоимость трансфера в евро"
                  min="0"
                  step="1000"
                >
                <span v-if="errors.market_value_in_eur" class="error-text">{{ errors.market_value_in_eur }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button 
                v-if="selectedMode === 'add'" 
                type="submit" 
                class="action-btn add-btn"
                :disabled="loading"
              >
                {{ loading ? 'Добавление...' : 'Добавить трансфер' }}
              </button>
              
              <button 
                v-if="selectedMode === 'edit' && currentTransfer" 
                type="submit" 
                class="action-btn edit-btn"
                :disabled="loading"
              >
                {{ loading ? 'Обновление...' : 'Обновить трансфер' }}
              </button>
              
              <button 
                v-if="selectedMode === 'delete' && currentTransfer" 
                type="button" 
                class="action-btn delete-btn"
                @click="deleteTransfer"
                :disabled="loading"
              >
                {{ loading ? 'Удаление...' : 'Удалить трансфер' }}
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
  name: 'TransfersAdmin',
  components: {
    AdminSidebar
  },
  setup() {
    const adminStore = useAdminStore()
    
    const selectedMode = ref('add')
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('')
    const currentTransfer = ref(null)
    const selectedTransfer = ref(null)
    const multipleTransfers = ref([])
    
    const options = reactive({
      from_clubs: [],
      to_clubs: [],
      players: []
    })
    
    const searchFilters = reactive({
      from_club: '',
      to_club: ''
    })
    
    const transferForm = reactive({
      player_name: '',
      from_club_name: '',
      to_club_name: '',
      transfer_date: '',
      transfer_season: '',
      market_value_in_eur: ''
    })
    
    const errors = reactive({})

    const canSearch = computed(() => {
      return searchFilters.from_club || searchFilters.to_club
    })

    const loadOptions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/admin/transfers/options/', {
          withCredentials: true
        })
        Object.assign(options, response.data)
      } catch (error) {
        showMessage('Ошибка загрузки данных', 'error')
      }
    }

    const searchTransfers = async () => {
      loading.value = true
      message.value = ''
      multipleTransfers.value = []
      selectedTransfer.value = null
      currentTransfer.value = null
      
      try {
        const params = new URLSearchParams()
        if (searchFilters.from_club) params.append('from_club', searchFilters.from_club)
        if (searchFilters.to_club) params.append('to_club', searchFilters.to_club)

        const response = await axios.get(`http://127.0.0.1:8000/api/admin/transfers/search_by_clubs/?${params}`, {
          withCredentials: true
        })
        
        if (response.data.multiple_results) {
          multipleTransfers.value = response.data.transfers
          showMessage(`Найдено ${multipleTransfers.value.length} трансферов`, 'success')
        } else if (response.data.transfer) {
          currentTransfer.value = response.data.transfer
          fillTransferForm(response.data.transfer)
          showMessage('Трансфер найден', 'success')
        }
      } catch (error) {
        if (error.response?.status === 404) {
          showMessage('Трансферы не найдены', 'error')
        } else {
          showMessage('Ошибка поиска трансферов', 'error')
        }
        currentTransfer.value = null
        resetForm()
      } finally {
        loading.value = false
      }
    }

    const selectTransfer = async (transfer) => {
      selectedTransfer.value = transfer
      
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/transfers/transfer_details/?id=${transfer.id}`, {
          withCredentials: true
        })
        
        currentTransfer.value = response.data
        fillTransferForm(response.data)
        showMessage('Трансфер выбран', 'success')
      } catch (error) {
        showMessage('Ошибка загрузки деталей трансфера', 'error')
      }
    }

    const fillTransferForm = (transferData) => {
      Object.keys(transferForm).forEach(key => {
        if (transferData[key] !== undefined && transferData[key] !== null) {
          transferForm[key] = transferData[key]
        } else {
          transferForm[key] = ''
        }
      })
    }

    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!transferForm.player_name.trim()) {
        errors.player_name = 'Имя игрока обязательно'
      }
      
      if (!transferForm.from_club_name.trim()) {
        errors.from_club_name = 'Клуб ухода обязателен'
      }
      
      if (!transferForm.to_club_name.trim()) {
        errors.to_club_name = 'Клуб прихода обязателен'
      }
      
      if (!transferForm.transfer_date) {
        errors.transfer_date = 'Дата перехода обязательна'
      }
      
      if (!transferForm.transfer_season.trim()) {
        errors.transfer_season = 'Сезон перехода обязателен'
      }
      
      if (transferForm.market_value_in_eur && transferForm.market_value_in_eur < 0) {
        errors.market_value_in_eur = 'Стоимость не может быть отрицательной'
      }
      
      return Object.keys(errors).length === 0
    }

    const addTransfer = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/admin/transfers/create_transfer/',
          transferForm,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
        resetForm()
        loadOptions()
      } catch (error) {
        handleApiError(error, 'добавления')
      }
    }

    const updateTransfer = async () => {
      try {
        const updateData = {
          id: currentTransfer.value.id,
          ...transferForm
        }
        
        const response = await axios.put(
          'http://127.0.0.1:8000/api/admin/transfers/update_transfer/',
          updateData,
          { withCredentials: true }
        )
        showMessage(response.data.message, 'success')
      } catch (error) {
        handleApiError(error, 'обновления')
      }
    }

    const deleteTransfer = async () => {
      if (!confirm('Вы уверены, что хотите удалить этот трансфер?')) {
        return
      }
      
      loading.value = true
      
      try {
        const params = new URLSearchParams({
          id: currentTransfer.value.id
        })
        
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/admin/transfers/delete_transfer/?${params}`,
          { withCredentials: true }
        )
        
        showMessage(response.data.message, 'success')
        resetForm()
        currentTransfer.value = null
        selectedTransfer.value = null
        multipleTransfers.value = []
        searchFilters.from_club = ''
        searchFilters.to_club = ''
        loadOptions()
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
        addTransfer()
      } else if (selectedMode.value === 'edit') {
        updateTransfer()
      }
      
      loading.value = false
    }

    const resetForm = () => {
      Object.keys(transferForm).forEach(key => {
        transferForm[key] = ''
      })
      Object.keys(errors).forEach(key => {
        delete errors[key]
      })
      currentTransfer.value = null
      selectedTransfer.value = null
      multipleTransfers.value = []
      searchFilters.from_club = ''
      searchFilters.to_club = ''
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
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('ru-RU')
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
      currentTransfer,
      selectedTransfer,
      multipleTransfers,
      options,
      searchFilters,
      transferForm,
      errors,
      canSearch,
      searchTransfers,
      selectTransfer,
      handleSubmit,
      deleteTransfer,
      resetForm,
      formatDisplayDate,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.admin-container {
  padding: 30px;
  max-width: 1400px;
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
  margin-bottom: 20px;
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

.transfers-list {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
}

.transfers-list h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.transfers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.transfer-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.transfer-item:hover {
  background: #e9ecef;
  border-color: #3498db;
}

.transfer-item.selected {
  background: #e3f2fd;
  border-color: #3498db;
}

.transfer-player {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 1.1em;
}

.transfer-clubs {
  color: #666;
  margin-bottom: 5px;
  font-size: 0.9em;
}

.transfer-date {
  color: #888;
  font-size: 0.85em;
  margin-bottom: 5px;
}

.transfer-value {
  color: #27ae60;
  font-weight: 600;
  font-size: 0.9em;
}

.transfer-form-section {
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
  
  .transfers-grid {
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