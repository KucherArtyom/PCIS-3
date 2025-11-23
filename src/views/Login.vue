<template>
    
    <div id="content">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Вход в систему</h1>
            <p>Введите ваши учетные данные</p>
          </div>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="username">Логин:</label>
              <input
                id="username"
                v-model="loginForm.username"
                type="text"
                class="form-input"
                :class="{ 'error': errors.username }"
                placeholder="Введите ваш логин"
                required
              />
              <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
            </div>

            <div class="form-group">
              <label for="password">Пароль:</label>
              <input
                id="password"
                v-model="loginForm.password"
                type="password"
                class="form-input"
                :class="{ 'error': errors.password }"
                placeholder="Введите ваш пароль"
                required
              />
              <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            </div>

            <button type="submit" class="auth-btn" :disabled="loading">
              {{ loading ? 'Вход...' : 'Войти' }}
            </button>

            <div class="auth-links">
              <p>Нет аккаунта? <router-link to="/registration">Зарегистрироваться</router-link></p>
            </div>
          </form>

          <div v-if="message" class="message" :class="messageType">
            {{ message }}
          </div>
          <div v-if="checkingAdmin" class="admin-check">
            <p>Проверка прав доступа...</p>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import Sidebar from '@/components/Sidebar.vue'
import axios from 'axios'

// axios.defaults.withCredentials = true
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export default {
  name: 'Login',
  components: {
    Sidebar
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const adminStore = useAdminStore()
    
    const loginForm = ref({
      username: '',
      password: ''
    })
    
    const errors = ref({})
    const loading = ref(false)
    const checkingAdmin = ref(false)
    const message = ref('')
    const messageType = ref('')

    const validateForm = () => {
      errors.value = {}
      
      if (!loginForm.value.username.trim()) {
        errors.value.username = 'Логин обязателен'
      }
      
      if (!loginForm.value.password) {
        errors.value.password = 'Пароль обязателен'
      }
      
      return Object.keys(errors.value).length === 0
    }

  const handleLogin = async () => {
  if (!validateForm()) return
  
  loading.value = true
  message.value = ''
  checkingAdmin.value = false

  try {


    const loginResult = await authStore.login(
      loginForm.value.username,
      loginForm.value.password
    )
    
    if (loginResult.success) {
      message.value = 'Вход выполнен успешно!'
      messageType.value = 'success'
      
      const userData = authStore.user
      console.log('User data after login:', userData)
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (userData && userData.is_staff) {
        message.value = 'Вход выполнен успешно! Перенаправление в админ-панель...'
        setTimeout(() => {
          router.push('/admin')
        }, 1000)
      } else {
        message.value = 'Вход выполнен успешно! Перенаправление на главную страницу...'
        setTimeout(() => {
          router.push('/')
        }, 1000)  
          }
        
        } else {
          if (loginResult.error && typeof loginResult.error === 'object') {
            if (loginResult.error.non_field_errors) {
              message.value = loginResult.error.non_field_errors[0]
            } else if (loginResult.error.detail) {
              message.value = loginResult.error.detail
            } else {
              message.value = 'Ошибка входа. Проверьте логин и пароль.'
            }
          } else {
            message.value = loginResult.error || 'Ошибка входа. Проверьте логин и пароль.'
          }
          messageType.value = 'error'
        }
      } catch (error) {
        console.error('Login error:', error)
        message.value = 'Произошла ошибка при входе. Попробуйте еще раз.'
        messageType.value = 'error'
      } finally {
        loading.value = false
        checkingAdmin.value = false
      }
    }
    return {
      loginForm,
      errors,
      loading,
      message,
      checkingAdmin,
      messageType,
      handleLogin
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.auth-card {
  background: #2C332C;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  border-style: solid;
  border-color: #47642A;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  color: white;
  margin-bottom: 10px;
  font-size: 2em;
}

.auth-header p {
  color: #666;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 600;
  color: white;
  margin-bottom: 5px;
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
  border-color: #007bff;
}

.form-input.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.9em;
  margin-top: 5px;
}

.auth-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.auth-btn:hover:not(:disabled) {
  background: #0056b3;
}

.auth-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.auth-links {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 3px solid #47642A;
}

.auth-links a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.auth-links a:hover {
  text-decoration: underline;
}

.message {
  padding: 12px 15px;
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
</style>