<template>
  <div id="mainblock">
    <Sidebar />
    
    <div id="content">
      <div class="page-header">
        <h1>Матчи</h1>
        <p>Просмотр статистики футбольных матчей</p>
        <p class="hint">💡 Selectbox'ы автоматически фильтруются для показа только совместимых значений</p>
      </div>

      <!-- Фильтры -->
      <div class="filters-container">
        <div class="filter-row">
          <div class="filter-group">
            <label for="homeTeam">Домашняя команда:</label>
            <select id="homeTeam" v-model="selectedHomeTeam" @change="updateFilteredOptions" class="form-select">
              <option value="">Выберите команду</option>
              <option v-for="team in filteredHomeTeams" :key="'home-' + team" :value="team">
                {{ team }}
              </option>
            </select>
            <div class="filter-info" v-if="selectedHomeTeam">
              Доступно гостевых команд: {{ filteredAwayTeams.length }}
            </div>
          </div>

          <div class="filter-group">
            <label for="awayTeam">Гостевая команда:</label>
            <select id="awayTeam" v-model="selectedAwayTeam" @change="updateFilteredOptions" class="form-select">
              <option value="">Выберите команду</option>
              <option v-for="team in filteredAwayTeams" :key="'away-' + team" :value="team">
                {{ team }}
              </option>
            </select>
            <div class="filter-info" v-if="selectedAwayTeam">
              Доступно домашних команд: {{ filteredHomeTeams.length }}
            </div>
          </div>

          <div class="filter-group">
            <label for="matchDate">Дата игры:</label>
            <select id="matchDate" v-model="selectedDate" @change="updateFilteredOptions" class="form-select">
              <option value="">Выберите дату</option>
              <option v-for="date in filteredDates" :key="date" :value="date">
                {{ formatDisplayDate(date) }}
              </option>
            </select>
            <div class="filter-info" v-if="selectedDate">
              Доступно матчей: {{ getMatchesCountForDate() }}
            </div>
          </div>

          <div class="search-actions">
            <button @click="searchMatch" class="search-btn" :disabled="loading || !canSearch">
              {{ loading ? 'Загрузка...' : 'Показать' }}
            </button>
            <button @click="clearFilters" class="clear-btn" :disabled="loading">
              Очистить
            </button>
          </div>
        </div>

        <div class="filter-status" v-if="hasActiveFilters">
          <div class="status-item" v-if="selectedHomeTeam">
            <strong>Домашняя:</strong> {{ selectedHomeTeam }}
            <span class="remove-filter" @click="removeFilter('home')">×</span>
          </div>
          <div class="status-item" v-if="selectedAwayTeam">
            <strong>Гостевая:</strong> {{ selectedAwayTeam }}
            <span class="remove-filter" @click="removeFilter('away')">×</span>
          </div>
          <div class="status-item" v-if="selectedDate">
            <strong>Дата:</strong> {{ formatDisplayDate(selectedDate) }}
            <span class="remove-filter" @click="removeFilter('date')">×</span>
          </div>
        </div>
      </div>

      <div class="options-info" v-if="hasActiveFilters">
        <p>
          <span v-if="filteredHomeTeams.length > 0 && filteredAwayTeams.length > 0">
            Найдено {{ getPossibleMatchesCount() }} возможных матчей
          </span>
          <span v-else class="warning">
            По текущим фильтрам матчи не найдены. Попробуйте изменить условия поиска.
          </span>
        </p>
      </div>

      <div v-if="matchData && !loading" class="match-container">
        <div class="match-header">
          <div class="teams-row">
            <div class="team home-team">
              <!--
              <div class="team-logo-placeholder">
                <span>{{ getTeamInitials(matchData.game.home_club_name) }}</span>
              </div>
              -->
              <div class="team-logo-container">
                <img 
                  :src="getTeamLogo(matchData.game.home_club_id)" 
                  :alt="matchData.game.home_club_name"
                  class="team-logo"
                  @error="handleHomeTeamImageError"
                >
              </div>
              <h3>{{ matchData.game.home_club_name }}</h3>
            </div>
            
            <div class="match-score">
              <div class="score">{{ matchData.game.home_club_goals }} - {{ matchData.game.away_club_goals }}</div>
              <div class="match-date">{{ formatDisplayDate(matchData.game.date) }}</div>
              <div v-if="matchData.game.aggregate" class="aggregate">
                Aggregate: {{ matchData.game.aggregate }}
              </div>
            </div>
            
            <div class="team away-team">
              <!--
              <div class="team-logo-placeholder">
                <span>{{ getTeamInitials(matchData.game.away_club_name) }}</span>
              </div>
              -->
              <div class="team-logo-container">
                <img 
                  :src="getTeamLogo(matchData.game.away_club_id)" 
                  :alt="matchData.game.away_club_name"
                  class="team-logo"
                  @error="handleAwayTeamImageError"
                >
              </div>
              <h3>{{ matchData.game.away_club_name }}</h3>
            </div>
          </div>
        </div>

        <div class="match-info">
          <div class="info-item">
            <strong>Стадион:</strong> {{ matchData.game.stadium || 'Не указан' }}
          </div>
          <div class="info-item">
            <strong>Посещаемость:</strong> {{ matchData.game.attendance || 'Не указана' }}
          </div>
          <div class="info-item">
            <strong>Судья:</strong> {{ matchData.game.referee || 'Не указан' }}
          </div>
        </div>

        <div class="formations-container">
          <div class="formation">
            <h4>Схема {{ matchData.game.home_club_name }}</h4>
            <div class="formation-display">{{ matchData.game.home_club_formation || 'Не указана' }}</div>
          </div>
          <div class="formation">
            <h4>Схема {{ matchData.game.away_club_name }}</h4>
            <div class="formation-display">{{ matchData.game.away_club_formation || 'Не указана' }}</div>
          </div>
        </div>

        <div class="events-container">
          <div class="events-column">
            <h4>События {{ matchData.game.home_club_name }}</h4>
            <div class="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Минута</th>
                    <th>Игрок</th>
                    <th>Событие</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in matchData.home_events" :key="event.minute + event.player_name">
                    <td>{{ event.minute }}'</td>
                    <td>{{ event.player_name }}</td>
                    <td>{{ event.type }}</td>
                    <td>{{ event.description || '-' }}</td>
                  </tr>
                  <tr v-if="matchData.home_events.length === 0">
                    <td colspan="4" class="no-events">Событий нет</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="events-column">
            <h4>События {{ matchData.game.away_club_name }}</h4>
            <div class="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Минута</th>
                    <th>Игрок</th>
                    <th>Событие</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in matchData.away_events" :key="event.minute + event.player_name">
                    <td>{{ event.minute }}'</td>
                    <td>{{ event.player_name }}</td>
                    <td>{{ event.type }}</td>
                    <td>{{ event.description || '-' }}</td>
                  </tr>
                  <tr v-if="matchData.away_events.length === 0">
                    <td colspan="4" class="no-events">Событий нет</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="loading" class="loading">
        <p>Загрузка данных матча...</p>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import axios from 'axios'
import { debounce } from 'lodash'

export default {
  name: 'Games',
  components: {
    Sidebar
  },
  data() {
    return {
      allTeams: [],
      allDates: [],
      
      filteredHomeTeams: [],
      filteredAwayTeams: [],
      filteredDates: [],
      
      selectedHomeTeam: '',
      selectedAwayTeam: '',
      selectedDate: '',
      
      matchData: null,
      loading: false,
      error: null,

      logosBaseUrl: 'http://127.0.0.1:8000',
      
      matchesCountCache: {},

      homeLogoError: false,
      awayLogoError: false
    }
  },
  computed: {
    hasActiveFilters() {
      return this.selectedHomeTeam || this.selectedAwayTeam || this.selectedDate
    },
    canSearch() {
      return this.selectedHomeTeam || this.selectedAwayTeam || this.selectedDate
    }
  },
  async mounted() {
    await this.loadAllOptions()
    this.updateFilteredOptions()
  },
  methods: {
    async loadAllOptions() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/games/search_options/')
        this.allTeams = response.data.teams
        this.allDates = response.data.dates
        
        this.filteredHomeTeams = [...this.allTeams]
        this.filteredAwayTeams = [...this.allTeams]
        this.filteredDates = [...this.allDates]
      } catch (error) {
        console.error('Ошибка при загрузке опций поиска:', error)
        this.error = 'Ошибка при загрузке данных для поиска'
      }
    },

    async updateFilteredOptions() {
      this.debouncedUpdateFilteredOptions()
    },

    debouncedUpdateFilteredOptions: debounce(async function() {
      try {
        const params = new URLSearchParams()
        if (this.selectedHomeTeam) params.append('home_team', this.selectedHomeTeam)
        if (this.selectedAwayTeam) params.append('away_team', this.selectedAwayTeam)
        if (this.selectedDate) params.append('date', this.selectedDate)

        const url = `http://127.0.0.1:8000/api/games/filtered_options/?${params.toString()}`
        const response = await axios.get(url)
        
        const data = response.data
        
        this.filteredHomeTeams = data.home_teams.length > 0 ? data.home_teams : []
        this.filteredAwayTeams = data.away_teams.length > 0 ? data.away_teams : []
        this.filteredDates = data.dates.length > 0 ? data.dates : []
        
        if (this.selectedHomeTeam && !this.filteredHomeTeams.includes(this.selectedHomeTeam)) {
          this.selectedHomeTeam = ''
        }
        if (this.selectedAwayTeam && !this.filteredAwayTeams.includes(this.selectedAwayTeam)) {
          this.selectedAwayTeam = ''
        }
        if (this.selectedDate && !this.filteredDates.includes(this.selectedDate)) {
          this.selectedDate = ''
        }
        
        this.error = null
      } catch (error) {
        console.error('Ошибка при обновлении фильтров:', error)
      }
    }, 300),

    async searchMatch() {
      console.log('🔍 START searchMatch:', {
      home: this.selectedHomeTeam,
      away: this.selectedAwayTeam,
      date: this.selectedDate
      })

         
      if (!this.canSearch) {
        this.error = 'Пожалуйста, выберите хотя бы один фильтр'
        return
      }

      this.loading = true
      this.error = null
      this.matchData = null
      this.homeLogoError = false
      this.awayLogoError = false

      console.log('📡 Making API request...')

      try {
        const params = new URLSearchParams()
        if (this.selectedHomeTeam) params.append('home_team', this.selectedHomeTeam)
        if (this.selectedAwayTeam) params.append('away_team', this.selectedAwayTeam)
        if (this.selectedDate) params.append('date', this.selectedDate)

        const url = `http://127.0.0.1:8000/api/games/search/?${params.toString()}`
        console.log('🌐 Request URL:', url)
        const response = await axios.get(url)
        console.log('Response received:', response.data)


        this.matchData = response.data
      } catch (error) {
        console.error('Ошибка при поиске матча:', error)
        if (error.response && error.response.status === 404) {
          this.error = 'Конкретный матч по указанным фильтрам не найден. Попробуйте другие комбинации.'
        } else {
          this.error = 'Ошибка при поиске матча'
        }
      } finally {
        console.log('🏁 FINISH searchMatch, loading:', false)
        this.loading = false
      }
    },

    clearFilters() {
      this.selectedHomeTeam = ''
      this.selectedAwayTeam = ''
      this.selectedDate = ''
      this.matchData = null
      this.error = null
      this.homeLogoError = false
      this.awayLogoError = false
      this.updateFilteredOptions()
    },

    removeFilter(filterType) {
      switch (filterType) {
        case 'home':
          this.selectedHomeTeam = ''
          break
        case 'away':
          this.selectedAwayTeam = ''
          break
        case 'date':
          this.selectedDate = ''
          break
      }
      this.updateFilteredOptions()
    },

    getPossibleMatchesCount() {
      let count = 1
      if (this.selectedHomeTeam) count *= this.filteredAwayTeams.length
      if (this.selectedAwayTeam) count *= this.filteredHomeTeams.length
      if (this.selectedDate) count *= this.filteredDates.length
      return count
    },

    getMatchesCountForDate() {
      if (!this.selectedDate) return 0
      return this.filteredHomeTeams.length
    },

    formatDisplayDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    },
    getTeamLogo(clubId) {
      return `${this.logosBaseUrl}/api/clubs/${clubId}/logo/`
    },
    handleHomeTeamImageError(event) {
      this.homeLogoError = true
      this.replaceWithPlaceholder(event.target, this.matchData?.game?.home_club_name)
    },

    handleAwayTeamImageError(event) {
      this.awayLogoError = true
      this.replaceWithPlaceholder(event.target, this.matchData?.game?.away_club_name)
    },

    replaceWithPlaceholder(imgElement, teamName) {
      const placeholder = document.createElement('div')
      placeholder.className = 'team-logo-placeholder'
      placeholder.innerHTML = `<span>${this.getTeamInitials(teamName)}</span>`
      
      imgElement.parentNode.replaceChild(placeholder, imgElement)
    },

    getTeamInitials(teamName) {
      if (!teamName) return 'T'
      return teamName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3)
    }
  }
}
</script>


<style scoped>
#content {
  margin-top: 50px;
}
.filter-group {
  margin-left: 10px;
}

h1{
  margin-left: 50px;
}

.form-select {
  background-color:#1F1C1C;
  color:white;
  height: 40px;
  border-style: solid;
  border-color: #47642A;
  border-radius: 4px;
}

.events-thead {
  background-color: #2C332C;
}

.hint {
  color: #666;
  font-size: 0.9em;
  margin-top: 5px;
}

.filter-info {
  font-size: 0.8em;
  color: #666;
  margin-top: 5px;
}

.search-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-end;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover:not(:disabled) {
  background: #545b62;
}

.filter-status {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.status-item {
  background: #e9ecef;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-filter {
  color: #dc3545;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2em;
}

.remove-filter:hover {
  color: #bd2130;
}

.options-info {
  background: #e7f3ff;
  padding: 10px 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.warning {
  color: #856404;
}

/* Адаптивность */
@media (max-width: 768px) {
  .search-actions {
    flex-direction: row;
  }
  
  .filter-status {
    flex-direction: column;
  }
}
.match-container {
  background: #2C332C;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.match-header {
  margin-bottom: 20px;
}

.teams-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.team {
  flex: 1;
}

.team-logo-placeholder {
  width: 60px;
  height: 60px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-weight: bold;
}

.match-score {
  flex: 1;
  text-align: center;
}

.score {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 5px;
}

.match-date {
  color: #666;
  margin-bottom: 5px;
}

.aggregate {
  color: #888;
  font-size: 0.9em;
}

.match-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #47642A;
  border-radius: 4px;
}

.info-item {
  flex: 1;
}

.formations-container {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.formation {
  flex: 1;
  text-align: center;
  padding: 15px;
  background: #2C332C;
  border-radius: 4px;
}

.formation-display {
  font-family: monospace;
  font-size: 1.2em;
  margin-top: 10px;
}

.events-container {
  display: flex;
  gap: 20px;
}

.events-column {
  flex: 1;
}

.events-table table {
  width: 100%;
  border-collapse: collapse;
}

.events-table th,
.events-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.events-table th {
  background: #1F1C1C;
  font-weight: bold;
}

.no-events {
  text-align: center;
  color: #666;
  font-style: italic;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.team-logo-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.team-logo-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-weight: bold;
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .team-logo-container,
  .team-logo-placeholder {
    width: 60px;
    height: 60px;
  }
  
  .score {
    font-size: 2em;
  }
}

@media (max-width: 768px) {
  .teams-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .match-info {
    flex-direction: column;
  }
  
  .formations-container {
    flex-direction: column;
  }
  
  .events-container {
    flex-direction: column;
  }
}

</style>