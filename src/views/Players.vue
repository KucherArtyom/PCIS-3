<template>
  <div id="mainblock">
    <Sidebar />
    
    <div id="content">
      <div class="page-header">
        <h1>Игроки</h1>
        <p class ="information">Просмотр информации о футбольных игроках</p>
      </div>

      <div class="filters-container">
        <div class="filter-row">
          <div class="filter-group">
            <label for="clubSelect">Команда:</label>
            <select 
              id="clubSelect" 
              v-model="selectedClubId" 
              @change="loadPlayersByClub"
              class="form-select"
              :disabled="loading"
            >
              <option value="">Выберите команду</option>
              <option v-for="club in clubs" :key="club.club_id" :value="club.club_id">
                {{ club.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="playerSelect">Игрок:</label>
            <select 
              id="playerSelect" 
              v-model="selectedPlayerId" 
              class="form-select"
              :disabled="loading || !selectedClubId || players.length === 0"
            >
              <option value="">Выберите игрока</option>
              <option v-for="player in players" :key="player.player_id" :value="player.player_id">
                {{ player.name }}
              </option>
            </select>
          </div>

          <button 
            @click="searchPlayer" 
            class="search-btn" 
            :disabled="loading || !selectedPlayerId"
          >
            {{ loading ? 'Загрузка...' : 'Показать' }}
          </button>
        </div>
      </div>

      <div v-if="playerData && !loading" class="player-container">
        <div class="player-header">
          <div class="player-avatar">
            <span>{{ getPlayerInitials(playerData.name) }}</span>
          </div>
          <div class="player-info-main">
            <h2>{{ playerData.name }}</h2>
            <div class="player-club">
              <span class="club-badge">{{ playerData.current_club_name || 'Свободный агент' }}</span>
            </div>
          </div>
          <div class="player-value">
            <div class="value-label">Рыночная стоимость</div>
            <div class="value-amount">{{ formatCurrency(playerData.market_value_in_eur) }}</div>
          </div>
        </div>

        <div class="player-details">
          <div class="details-section">
            <h3>Личная информация</h3>
            <div class="details-grid">
              <div class="detail-item">
                <label>Имя:</label>
                <span>{{ playerData.first_name || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Фамилия:</label>
                <span>{{ playerData.last_name || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Дата рождения:</label>
                <span>{{ formatDate(playerData.date_of_birth) }}</span>
              </div>
              <div class="detail-item">
                <label>Возраст:</label>
                <span>{{ calculateAge(playerData.date_of_birth) }}</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h3>Место рождения</h3>
            <div class="details-grid">
              <div class="detail-item">
                <label>Страна:</label>
                <span>{{ playerData.country_of_birth || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Город:</label>
                <span>{{ playerData.city_of_birth || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Гражданство:</label>
                <span>{{ playerData.country_of_citizenship || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h3>Футбольные характеристики</h3>
            <div class="details-grid">
              <div class="detail-item">
                <label>Позиция:</label>
                <span class="position-badge">{{ playerData.position || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Специализация:</label>
                <span class="subposition-badge">{{ playerData.sub_position || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Рабочая нога:</label>
                <span class="foot-badge">{{ getFootDisplay(playerData.foot) }}</span>
              </div>
              <div class="detail-item">
                <label>Рост:</label>
                <span>{{ playerData.height_in_cm ? playerData.height_in_cm + ' см' : '-' }}</span>
              </div>
            </div>
          </div>

          <div class="details-section" v-if="playerData.contract_expiration_date">
            <h3>Контракт</h3>
            <div class="details-grid">
              <div class="detail-item">
                <label>Окончание контракта:</label>
                <span :class="getContractStatusClass(playerData.contract_expiration_date)">
                  {{ formatDate(playerData.contract_expiration_date) }}
                  <span class="contract-status">{{ getContractStatus(playerData.contract_expiration_date) }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="loading && !playerData" class="loading">
        <p>Загрузка информации об игроке...</p>
      </div>
      <div v-if="selectedClubId && players.length === 0 && !loading" class="info-message">
        <p>В выбранной команде нет игроков в базе данных</p>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import axios from '@/utils/axios'

export default {
  name: 'Players',
  components: {
    Sidebar
  },
  data() {
    return {
      clubs: [],
      players: [],
      selectedClubId: '',
      selectedPlayerId: '',
      playerData: null,
      loading: false,
      error: null
    }
  },
  async mounted() {
    await this.loadClubs()
  },
  methods: {
    async loadClubs() {
      try {
        const response = await axios.get('players/clubs/')
        this.clubs = response.data
      } catch (error) {
        console.error('Ошибка при загрузке клубов:', error)
        this.error = 'Ошибка при загрузке списка клубов'
      }
    },

    async loadPlayersByClub() {
      if (!this.selectedClubId) {
        this.players = []
        this.selectedPlayerId = ''
        return
      }

      this.loading = true
      this.players = []
      this.selectedPlayerId = ''
      this.playerData = null

      try {
        const url = `players/players_by_club/?club_id=${this.selectedClubId}`
        const response = await axios.get(url)
        this.players = response.data
      } catch (error) {
        console.error('Ошибка при загрузке игроков:', error)
        this.error = 'Ошибка при загрузке списка игроков'
      } finally {
        this.loading = false
      }
    },

    async searchPlayer() {
      if (!this.selectedPlayerId) {
        this.error = 'Пожалуйста, выберите игрока'
        return
      }

      this.loading = true
      this.error = null
      this.playerData = null

      try {
        const url = `players/search/?player_id=${this.selectedPlayerId}`
        const response = await axios.get(url)
        this.playerData = response.data
      } catch (error) {
        console.error('Ошибка при поиске игрока:', error)
        if (error.response && error.response.status === 404) {
          this.error = 'Игрок не найден'
        } else {
          this.error = 'Ошибка при загрузке информации об игроке'
        }
      } finally {
        this.loading = false
      }
    },

    getPlayerInitials(playerName) {
      if (!playerName) return 'P'
      return playerName.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    formatCurrency(value) {
      if (!value || value === 0) return '-'
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value).replace('€', '€ ')
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU')
      } catch {
        return dateString
      }
    },

    calculateAge(dateString) {
      if (!dateString) return '-'
      try {
        const birthDate = new Date(dateString)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        
        return age + ' лет'
      } catch {
        return '-'
      }
    },

    getFootDisplay(foot) {
      if (!foot) return '-'
      const footMap = {
        'right': 'Правая',
        'left': 'Левая',
        'both': 'Обе'
      }
      return footMap[foot.toLowerCase()] || foot
    },

    getContractStatus(expirationDate) {
      if (!expirationDate) return ''
      
      const expDate = new Date(expirationDate)
      const today = new Date()
      const diffTime = expDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Истёк'
      if (diffDays < 30) return 'Скоро истекает'
      if (diffDays < 180) return 'Заканчивается'
      return 'Действует'
    },

    getContractStatusClass(expirationDate) {
      if (!expirationDate) return ''
      
      const expDate = new Date(expirationDate)
      const today = new Date()
      const diffTime = expDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'expired'
      if (diffDays < 30) return 'expiring-soon'
      if (diffDays < 180) return 'expiring'
      return 'active'
    }
  }
}
</script>

<style scoped>
#content {
  margin-top: 50px;
}

.search-btn{
  margin-left: 10px;
  background-color:#47642A;
  color:white;
  border-style: solid;
  border-color: #47642A;
  border-radius: 4px;
  height: 40px;
  width: 100px;
  margin-top: 10px;
}

.information{
  margin-left: 10px;
}

h1{
  margin-left: 50px;
}
.filter-group {
  margin-left: 10px;
}

.form-select {
  background-color:#1F1C1C;
  color:white;
  height: 40px;
  border-style: solid;
  border-color: #47642A;
  border-radius: 4px;
}

.player-container {
  background: #2C332C;
  padding: 30px;
  border-radius: 18px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 2px solid #47642A;
}

.player-avatar {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  font-weight: bold;
  flex-shrink: 0;
}

.player-info-main {
  flex: 1;
}

.player-info-main h2 {
  margin: 0 0 10px 0;
  color: white;
  font-size: 2.2em;
  font-weight: 600;
}

.club-badge {
  background: #47642A;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9em;
  font-weight: 500;
}

.player-value {
  text-align: right;
  flex-shrink: 0;
}

.value-label {
  color: #47642A;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.value-amount {
  font-size: 1.8em;
  font-weight: bold;
  color: #28a745;
}

.player-details {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.details-section h3 {
  color: #47642A;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #47642A;
  font-size: 1.3em;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  font-weight: 600;
  color: #47642A;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: white;
  font-size: 1.1em;
}

.position-badge,
.subposition-badge {
  background: #2C332C;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 500;
  display: inline-block;
}

.subposition-badge {
  background: #2C332C;
}

.foot-badge {
  background: #2C332C;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: 500;
  display: inline-block;
}

.contract-status {
  font-size: 0.8em;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.expired .contract-status {
  background: #dc3545;
  color: white;
}

.expiring-soon .contract-status {
  background: #fd7e14;
  color: white;
}

.expiring .contract-status {
  background: #ffc107;
  color: #212529;
}

.active .contract-status {
  background: #28a745;
  color: white;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  border-left: 4px solid #dc3545;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-message {
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
  border: 2px dashed #dee2e6;
}

@media (max-width: 768px) {
  .player-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .player-value {
    text-align: center;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .player-container {
    padding: 20px;
  }
  
  .player-avatar {
    width: 80px;
    height: 80px;
    font-size: 1.5em;
  }
  
  .player-info-main h2 {
    font-size: 1.8em;
  }
}
</style>