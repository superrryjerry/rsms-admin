import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/change-password',
    component: () => import('../views/ChangePassword.vue'),
    meta: { title: '修改密码' }
  },
  {
    path: '/',
    component: () => import('../layout/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '仪表盘' } },
      { path: 'dealers', component: () => import('../views/DealerManage.vue'), meta: { title: '经销商管理' } },
      { path: 'users', component: () => import('../views/UserManage.vue'), meta: { title: '用户管理' } },
      { path: 'pool', component: () => import('../views/PoolManage.vue'), meta: { title: '公海池管理' } },
      { path: 'vehicles', component: () => import('../views/VehicleManage.vue'), meta: { title: '车辆管理' } },
      { path: 'customers', component: () => import('../views/CustomerManage.vue'), meta: { title: '客户管理' } },
      { path: 'leads', component: () => import('../views/LeadManage.vue'), meta: { title: '线索管理' } },
      { path: 'approvals', component: () => import('../views/ApprovalManage.vue'), meta: { title: '审批管理' } },
      { path: 'contracts', component: () => import('../views/ContractManage.vue'), meta: { title: '合同管理' } },
      { path: 'workorders', component: () => import('../views/WorkOrderManage.vue'), meta: { title: '工单管理' } },
      { path: 'activities', component: () => import('../views/ActivityManage.vue'), meta: { title: '销售活动' } },
      { path: 'config', component: () => import('../views/SysConfig.vue'), meta: { title: '系统配置' } },
      { path: 'import', component: () => import('../views/DataImport.vue'), meta: { title: '数据导入' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title || '首页') + ' - 个人Rsms信息记录平台'
  const token = localStorage.getItem('rsms_token')
  const publicPaths = ['/login', '/change-password']
  if (!publicPaths.includes(to.path) && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
