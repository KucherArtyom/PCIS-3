<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  async mounted() {
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    
    await authStore.loadUser()
  }
}
</script>