<template>
    
    <div id="content">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Регистрация</h1>
            <p>Создайте новый аккаунт</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="username">Логин:</label>
              <input
                id="username"
                v-model="registerForm.username"
                type="text"
                class="form-input"
                :class="{ 'error': errors.username }"
                placeholder="Придумайте логин"
                required
              />
              <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
            </div>

            <div class="form-group">
              <label for="phone">Телефон:</label>
              <input
                id="phone"
                v-model="registerForm.phone"
                type="tel"
                class="form-input"
                :class="{ 'error': errors.phone }"
                placeholder="+7 (XXX) XXX-XX-XX"
                required
              />
              <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
            </div>

            <div class="form-group">
              <label for="email">Почта:</label>
              <input
                id="email"
                v-model="registerForm.email"
                type="email"
                class="form-input"
                :class="{ 'error': errors.email }"
                placeholder="your@email.com"
                required
              />
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="password">Пароль:</label>
              <input
                id="password"
                v-model="registerForm.password"
                type="password"
                class="form-input"
                :class="{ 'error': errors.password }"
                placeholder="Не менее 8 символов"
                required
              />
              <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            </div>

            <div class="form-group">
              <label for="passwordConfirm">Подтверждение пароля:</label>
              <input
                id="passwordConfirm"
                v-model="registerForm.password_confirm"
                type="password"
                class="form-input"
                :class="{ 'error': errors.password_confirm }"
                placeholder="Повторите пароль"
                required
              />
              <span v-if="errors.password_confirm" class="error-text">{{ errors.password_confirm }}</span>
            </div>

            <button type="submit" class="auth-btn" :disabled="loading">
              {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
            </button>

            <div class="auth-links">
              <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
            </div>
          </form>

          <div v-if="message" class="message" :class="messageType">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'Registration',
  components: {
    Sidebar
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const registerForm = ref({
      username: '',
      phone: '',
      email: '',
      password: '',
      password_confirm: ''
    })
    
    const errors = ref({})
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('')

    const validateForm = () => {
      errors.value = {}
      
      if (!registerForm.value.username.trim()) {
        errors.value.username = 'Логин обязателен'
      } else if (registerForm.value.username.length < 3) {
        errors.value.username = 'Логин должен быть не менее 3 символов'
      }
      
      if (!registerForm.value.phone.trim()) {
        errors.value.phone = 'Телефон обязателен'
      }
      
      if (!registerForm.value.email.trim()) {
        errors.value.email = 'Email обязателен'
      } else if (!/\S+@\S+\.\S+/.test(registerForm.value.email)) {
        errors.value.email = 'Некорректный email'
      }
      
      if (!registerForm.value.password) {
        errors.value.password = 'Пароль обязателен'
      } else if (registerForm.value.password.length < 8) {
        errors.value.password = 'Пароль должен быть не менее 8 символов'
      }
      
      if (!registerForm.value.password_confirm) {
        errors.value.password_confirm = 'Подтверждение пароля обязательно'
      } else if (registerForm.value.password !== registerForm.value.password_confirm) {
        errors.value.password_confirm = 'Пароли не совпадают'
      }
      
      return Object.keys(errors.value).length === 0
    }

    const handleRegister = async () => {
      if (!validateForm()) return
      
      loading.value = true
      message.value = ''
      
      const result = await authStore.register(registerForm.value)
      
      if (result.success) {
        message.value = result.data.message
        messageType.value = 'success'
        
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        if (typeof result.error === 'object') {
          const errorMessages = []
          for (const field in result.error) {
            errorMessages.push(...result.error[field])
          }
          message.value = errorMessages.join(', ')
        } else {
          message.value = result.error || 'Ошибка регистрации'
        }
        messageType.value = 'error'
      }
      
      loading.value = false
    }

    return {
      registerForm,
      errors,
      loading,
      message,
      messageType,
      handleRegister
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