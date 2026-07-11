import { defineStore } from 'pinia'
import { authApi } from '../api'

function safeParseUser() {
  try {
    const raw = localStorage.getItem('rsms_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('rsms_user')
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('rsms_token') || '',
    userInfo: safeParseUser()
  }),
  getters: {
      isLoggedIn: (state) => !!state.token,
      isAdmin: (state) => state.userInfo?.role === 'admin' || state.userInfo?.role === 'admin_test',
      mustChangePwd: (state) => !!state.userInfo?.must_change_pwd
    },
  actions: {
    async login(form) {
      const res = await authApi.login(form)
      this.token = res.data.token
      this.userInfo = res.data.user
      localStorage.setItem('rsms_token', this.token)
      localStorage.setItem('rsms_user', JSON.stringify(this.userInfo))
      return res.data
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('rsms_token')
      localStorage.removeItem('rsms_user')
    }
  }
})
