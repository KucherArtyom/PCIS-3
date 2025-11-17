<template>
  <div id="mainblock">
    <Sidebar />
    
    <div id="content">
      <div class="page-header">
        <h1>Клубы</h1>
        <p class ="information">Просмотр информации о футбольных клубах</p>
      </div>

      <div class="filters-container">
        <div class="filter-row">
          <div class="filter-group">
            <label for="clubSelect">Выбор клуба:</label>
            <select id="clubSelect" v-model="selectedClubId" class="form-select">
              <option value="">Выберите клуб</option>
              <option v-for="club in clubs" :key="club.club_id" :value="club.club_id">
                {{ club.name }}
              </option>
            </select>
          </div>

          <button @click="searchClub" class="search-btn" :disabled="loading || !selectedClubId">
            {{ loading ? 'Загрузка...' : 'Показать' }}
          </button>
        </div>
      </div>

      <div v-if="clubData && !loading" class="club-container">
        <div class="club-header">
        <div class="club-logo-container">
            <img 
              :src="getClubLogo(clubData.club.club_id)" 
              :alt="clubData.club.name"
              class="club-logo"
              @error="handleImageError"
            >
          </div>
          <div class="club-info-main">
            <h2>{{ clubData.club.name }}</h2>
            <div class="coach-info">
              <strong>Тренер:</strong> {{ clubData.club.coach_name || 'Не указан' }}
            </div>
          </div>
        </div>

        <div class="club-details">
          <div class="details-grid">
            <div class="detail-card">
              <div class="detail-icon"></div>
              <div class="detail-content">
                <h4>Стадион</h4>
                <p class="detail-value">{{ clubData.club.stadium_name || 'Не указан' }}</p>
                <p class="detail-subvalue" v-if="clubData.club.stadium_seats">
                  Вместимость: {{ formatNumber(clubData.club.stadium_seats) }} мест
                </p>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-icon"></div>
              <div class="detail-content">
                <h4>Состав</h4>
                <p class="detail-value">{{ clubData.club.squad_size || '0' }} игроков</p>
                <p class="detail-subvalue">
                  Средний возраст: {{ clubData.club.average_age ? clubData.club.average_age.toFixed(1) : '0' }} лет
                </p>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-icon"></div>
              <div class="detail-content">
                <h4>Стоимость</h4>
                <p class="detail-value">{{ formatCurrency(clubData.club.total_market_value) }}</p>
                <p class="detail-subvalue" v-if="clubData.club.foreigners_percentage">
                  Иностранцы: {{ clubData.club.foreigners_percentage.toFixed(1) }}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="players-section">
          <h3>Состав команды</h3>
          <div class="players-table-container">
            <table class="players-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Игрок</th>
                  <th>Позиция</th>
                  <th>Действие</th>
                  <th>Стоимость</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="player in clubData.players" :key="player.player_id">
                  <td class="player-id">{{ player.player_id }}</td>
                  <td class="player-name">{{ player.name }}</td>
                  <td class="player-position">
                    <span class="sub-position">{{ player.sub_position || '-' }}</span>
                  </td>
                  <td class="player-role">
                    <span class="role-badge">{{ player.position || '-' }}</span>
                  </td>
                  <td class="player-value">{{ formatCurrency(player.market_value_in_eur) }}</td>
                </tr>
                <tr v-if="clubData.players.length === 0">
                  <td colspan="5" class="no-players">Игроки не найдены</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="players-summary">
            Всего игроков: <strong>{{ clubData.players.length }}</strong>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="loading" class="loading">
        <p>Загрузка информации о клубе...</p>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import axios from 'axios'

export default {
  name: 'Clubs',
  components: {
    Sidebar
  },
  data() {
    return {
      clubs: [],
      selectedClubId: '',
      clubData: null,
      loading: false,
      error: null,
      logosBaseUrl: 'http://127.0.0.1:8000'
    }
  },
  async mounted() {
    await this.loadClubs()
  },
  methods: {
    async loadClubs() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/clubs/')
        this.clubs = response.data
      } catch (error) {
        console.error('Ошибка при загрузке клубов:', error)
        this.error = 'Ошибка при загрузке списка клубов'
      }
    },

    async searchClub() {
      if (!this.selectedClubId) {
        this.error = 'Пожалуйста, выберите клуб'
        return
      }

      this.loading = true
      this.error = null
      this.clubData = null

      try {
        const url = `http://127.0.0.1:8000/api/clubs/search/?club_id=${this.selectedClubId}`
        const response = await axios.get(url)
        
        this.clubData = response.data
      } catch (error) {
        console.error('Ошибка при поиске клуба:', error)
        if (error.response && error.response.status === 404) {
          this.error = 'Клуб не найден'
        } else {
          this.error = 'Ошибка при загрузке информации о клубе'
        }
      } finally {
        this.loading = false
      }
    },
    getClubLogo(clubId) {
      return `${this.logosBaseUrl}/api/clubs/${clubId}/logo/`
    },

    handleImageError(event) {
      const clubName = this.clubData?.club?.name || 'FC'
      const placeholder = document.createElement('div')
      placeholder.className = 'club-logo-placeholder'
      placeholder.innerHTML = `<span>${this.getClubInitials(clubName)}</span>`
      
      event.target.parentNode.replaceChild(placeholder, event.target)
    },

    getClubInitials(clubName) {
      if (!clubName) return 'FC'
      return clubName.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3)
    },

    formatCurrency(value) {
      if (!value || value === 0) return '-'
      if (value < 1000000) {
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value).replace('€', '€ ')
      } else {
        const millions = (value / 1000000).toFixed(1)
        return `€ ${millions}M`
      }
    },

    formatNumber(value) {
      if (!value) return '0'
      return new Intl.NumberFormat('de-DE').format(value)
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
.filter-group {
  margin-left: 10px;
}

h1{
  margin-left: 50px;
}

.information{
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

.club-container {
  background: #2C332C;
  padding: 30px;
  border-radius: 18px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.club-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #47642A;
}

.club-logo-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: bold;
  flex-shrink: 0;
}

.club-info-main {
  flex: 1;
}

.club-info-main h2 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 2em;
}

.coach-info {
  color: white;
  font-size: 1.1em;
}

.club-details {
  margin-bottom: 40px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.detail-card {
  background: #47642A; 
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-icon {
  font-size: 1.5em;
  flex-shrink: 0;
}

.detail-content h4 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 1.1em;
}

.detail-value {
  font-size: 1.3em;
  font-weight: bold;
  color: white;
  margin: 0 0 4px 0;
}

.detail-subvalue {
  color: white;
  font-size: 0.9em;
  margin: 0;
}

.players-section {
  margin-top: 30px;
}

.players-section h3 {
  color: white;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #47642A;
}

.players-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #47642A;
}

.players-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.players-table th {
  background: #1F1C1C;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #47642A;
  border-bottom: 2px solid #47642A;
  border-left: 3px solid #47642A;
  border-right: 3px solid #47642A;
}

.players-table td {
  padding: 12px;
  border-bottom: 1px solid #47642A;
}

.players-table tr:hover {
  background-color: #f8f9fa;
}

.player-id {
  font-family: 'Courier New', monospace;
  color: #47642A;
  font-size: 0.9em;
  width: 80px;
}

.player-name {
  font-weight: 500;
  color: #47642A;
}

.sub-position {
  color: #47642A;
  font-weight: 500;
}

.role-badge {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.player-value {
  font-weight: 600;
  color: #28a745;
  text-align: right;
}

.no-players {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px !important;
}

.players-summary {
  text-align: right;
  color: #666;
  font-size: 0.9em;
  padding: 10px 0;
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

@media (max-width: 768px) {
  .club-header {
    flex-direction: column;
    text-align: center;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .club-container {
    padding: 20px;
  }
  
  .players-table {
    font-size: 0.9em;
  }
  
  .players-table th,
  .players-table td {
    padding: 8px 6px;
  }
}
</style>