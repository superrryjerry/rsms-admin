import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const http = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// 401 去重标记
let isRedirecting401 = false

http.interceptors.request.use(config => {
  const token = localStorage.getItem('rsms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  res => {
    const data = res.data
    // 兼容 code 为数字 0 和字符串 "0"
    if (data.code != 0 && data.code !== undefined) {
      ElMessage.error(data.msg || '请求失败')
      if (data.code == 401 && !isRedirecting401) {
        isRedirecting401 = true
        localStorage.removeItem('rsms_token')
        localStorage.removeItem('rsms_user')
        router.push('/login')
        setTimeout(() => { isRedirecting401 = false }, 2000)
      }
      return Promise.reject(new Error(data.msg))
    }
    return data
  },
  err => {
    if (err.response?.status === 401 && !isRedirecting401) {
      isRedirecting401 = true
      localStorage.removeItem('rsms_token')
      localStorage.removeItem('rsms_user')
      router.push('/login')
      setTimeout(() => { isRedirecting401 = false }, 2000)
    } else if (err.response?.status !== 401) {
      ElMessage.error(err.response?.data?.msg || err.message || '网络错误')
    }
    return Promise.reject(err)
  }
)

export default http

// ===== Auth =====
export const authApi = {
  login: (data) => http.post('/auth/login', data),
  refresh: () => http.post('/auth/refresh'),
  getProfile: () => http.get('/user/profile'),
  changePassword: (data) => http.post('/auth/change-password', data)
}

// ===== Pool =====
export const poolApi = {
  list: (params) => http.get('/pool/list', { params }),
  claim: (data) => http.post('/pool/claim', data)
}

// ===== Vehicles =====
export const vehicleApi = {
  list: (params) => http.get('/vehicles/list', { params }),
  detail: (vin) => http.get(`/vehicles/detail/${encodeURIComponent(vin)}`),
  drop: (data) => http.post('/vehicles/drop', data),
  apply: (data) => http.post('/vehicles/apply', data),
  transfer: (data) => http.post('/vehicles/transfer', data),
  myRequests: () => http.get('/vehicles/my-requests'),
  changeCustomer: (data) => http.post('/vehicles/change-customer', data)
}

// ===== Customers =====
export const customerApi = {
  list: (params) => http.get('/customers/list', { params }),
  detail: (name) => http.get(`/customers/detail/${encodeURIComponent(name)}`),
  create: (data) => http.post('/customers/create', data)
}

// ===== Leads =====
export const leadApi = {
  list: (params) => http.get('/leads/list', { params }),
  unreadCount: () => http.get('/leads/unread-count'),
  markRead: (id) => http.post(`/leads/${id}/read`),
  markHandled: (id) => http.post(`/leads/${id}/handle`)
}

// ===== Activities =====
export const activityApi = {
  list: (params) => http.get('/activities/list', { params }),
  create: (data) => http.post('/activities/create', data),
  detail: (id) => http.get(`/activities/detail/${id}`)
}

// ===== Contracts =====
export const contractApi = {
  list: (params) => http.get('/contracts/list', { params })
}

// ===== Work Orders =====
export const workOrderApi = {
  list: (params) => http.get('/workorders/list', { params })
}

// ===== Admin =====
export const adminApi = {
  // Requests
  getRequests: (params) => http.get('/admin/requests', { params }),
  approveRequest: (id) => http.post(`/admin/requests/${id}/approve`),
  rejectRequest: (id, data) => http.post(`/admin/requests/${id}/reject`, data),
  // Users
  getUsers: () => http.get('/admin/users'),
  createUser: (data) => http.post('/admin/users', data),
  updateUser: (id, data) => http.put(`/admin/users/${id}`, data),
  deleteUser: (id) => http.delete(`/admin/users/${id}`),
  resetPassword: (id, data) => http.post(`/admin/users/${id}/reset`, data),
  toggleUser: (id) => http.post(`/admin/users/${id}/toggle`),
  // Config
  getConfig: () => http.get('/admin/config'),
  updateConfig: (data) => http.put('/admin/config', data),
  // Dealers
  getDealers: () => http.get('/admin/dealers'),
  createDealer: (data) => http.post('/admin/dealers', data),
  updateDealer: (code, data) => http.put(`/admin/dealers/${code}`, data),
  deleteDealer: (code) => http.delete(`/admin/dealers/${code}`),
  // Import
  importPool: (formData) => http.post('/admin/import/pool', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importVehicles: (formData) => http.post('/admin/import/vehicles', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importContracts: (formData) => http.post('/admin/import/contracts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importWorkOrders: (formData) => http.post('/admin/import/workorders', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importCustomers: (formData) => http.post('/admin/import/customers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  // Templates
  getTemplates: () => http.get('/admin/templates'),
  downloadTemplate: (type) => `/api/admin/templates/template/${type}`,
  // Activities (admin view all)
  getActivities: (params) => http.get('/admin/activities/list', { params })
}
