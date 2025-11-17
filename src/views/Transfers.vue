<template>
  <div id="mainblock">
    <Sidebar />
    <div id="content">
      <div class="page-header">
        <h1>Трансферы</h1>
        <p>Поиск информации о футбольных трансферах</p>
      </div>

      <div class="filters-container">
        <div class="filter-row">
          <div class="filter-group">
            <label for="fromClub">Уход из клуба:</label>
            <select id="fromClub" v-model="selectedFromClub" class="form-select">
              <option value="">Выберите клуб</option>
              <option v-for="club in clubs" :key="club.club_id" :value="club.club_id">
                {{ club.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="toClub">Переход в клуб:</label>
            <select id="toClub" v-model="selectedToClub" class="form-select">
              <option value="">Выберите клуб</option>
              <option v-for="club in clubs" :key="club.club_id" :value="club.club_id">
                {{ club.name }}
              </option>
            </select>
          </div>

          <button @click="searchTransfers" class="search-btn" :disabled="loading">
            {{ loading ? 'Загрузка...' : 'Показать' }}
          </button>
        </div>
      </div>

      <div v-if="transfers.length > 0" class="results-container">
        <h2>Найдено трансферов: {{ transfers.length }}</h2>
        
        <div class="table-responsive">
          <table class="transfers-table">
            <thead>
              <tr>
                <th>Игрок</th>
                <th>Из клуба</th>
                <th>В клуб</th>
                <th>Дата перехода</th>
                <th>Сезон</th>
                <th>Стоимость (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transfer in transfers" :key="transfer.player_name + transfer.transfer_date">
                <td>{{ transfer.player_name }}</td>
                <td>{{ transfer.from_club_name }}</td>
                <td>{{ transfer.to_club_name }}</td>
                <td>{{ formatDate(transfer.transfer_date) }}</td>
                <td>{{ transfer.transfer_season }}</td>
                <td>{{ formatCurrency(transfer.market_value_in_eur) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="searched && !loading" class="no-results">
        <p>По выбранным фильтрам трансферов не найдено</p>
      </div>

      <div v-if="loading" class="loading">
        <p>Загрузка данных...</p>
      </div>
    </div>
  </div>
</template>
<script>
import Sidebar from '@/components/Sidebar.vue'
import axios from 'axios'

export default {
  name: 'Transfers',
  components: {
    Sidebar
  },
  data() {
    return {
      clubs: [],
      selectedFromClub: '',
      selectedToClub: '',
      transfers: [],
      loading: false,
      searched: false
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
        alert('Ошибка при загрузке списка клубов')
      }
    },

    async searchTransfers() {
      if (!this.selectedFromClub && !this.selectedToClub) {
        alert('Пожалуйста, выберите хотя бы один клуб для поиска')
        return
      }

      this.loading = true
      this.searched = true

      try {
        const params = new URLSearchParams()
        if (this.selectedFromClub) {
          params.append('from_club', this.selectedFromClub)
        }
        if (this.selectedToClub) {
          params.append('to_club', this.selectedToClub)
        }

        const url = `http://127.0.0.1:8000/api/transfers/search/?${params.toString()}`
        const response = await axios.get(url)
        
        this.transfers = response.data
      } catch (error) {
        console.error('Ошибка при поиске трансферов:', error)
        alert('Ошибка при поиске трансферов')
        this.transfers = []
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    },

    formatCurrency(value) {
      if (!value) return '-'
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value).replace('€', '€ ')
    }
  }
}
</script>

<style scoped>

#mainblock {
  display: flex;
  min-height: 100vh;
}

#content {
  flex: 1;
  padding: 20px;
  background-color: #2C332C;
  margin-top: 50px;
  border-radius: 18px;
}

h1{
  margin-left: 50px;
  color: white;
}


.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: white;
  margin-bottom: 5px;
}

.page-header p {
  color: #666;
  margin: 0;
}

.filters-container {
  background: #47642A;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: white;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color:#1F1C1C;
  color:white;
}

.search-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  height: 38px;
}

.search-btn:hover:not(:disabled) {
  background: #0056b3;
}

.search-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.results-container {
  background: #2C332C;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.results-container h2 {
  margin-bottom: 15px;
  color: #47642A;
}

.table-responsive {
  overflow-x: auto;
}

.transfers-table {
  width: 100%;
  border-collapse: collapse;
}

.transfers-table th,
.transfers-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 3px solid #47642A;
}

.transfers-table th {
  background-color: #1F1C1C;
  font-weight: bold;
  color: white;
  border-style: solid;
  border-color: #47642A;
}

.transfers-table tr:hover {
  background-color: #f8f9fa;
}

.no-results, .loading {
  text-align: center;
  padding: 40px;
  background: #47642A;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: white;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .search-btn {
    width: 100%;
  }
}
</style>