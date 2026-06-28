<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="item in stats" :key="item.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
            <el-icon :size="48" :color="item.color"><component :is="item.icon" /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近审批申请</span>
          </template>
          <el-table :data="recentRequests" stripe size="small">
            <el-table-column prop="vin" label="VIN" width="140" />
            <el-table-column prop="request_type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.request_type === 'claim' ? 'primary' : 'warning'" size="small">
                  {{ row.request_type === 'claim' ? '认领' : '转移' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="时间" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统名称">个人Rsms信息记录平台</el-descriptions-item>
            <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="后端技术">Node.js + Express + SQLite</el-descriptions-item>
            <el-descriptions-item label="前端技术">Vue 3 + Element Plus</el-descriptions-item>
            <el-descriptions-item label="当前用户">{{ userStore.userInfo?.name }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag>{{ userStore.userInfo?.role === 'admin' ? '管理员' : '经销商' }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { adminApi, poolApi, vehicleApi, customerApi } from '../api'

const userStore = useUserStore()

const stats = ref([
  { label: '公海池车辆', value: 0, icon: 'Coin', color: '#409EFF' },
  { label: '已认领车辆', value: 0, icon: 'Van', color: '#67C23A' },
  { label: '客户总数', value: 0, icon: 'UserFilled', color: '#E6A23C' },
  { label: '待处理审批', value: 0, icon: 'Checked', color: '#F56C6C' }
])

const recentRequests = ref([])

const statusType = (s) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s] || 'info')
const statusText = (s) => ({ pending: '待审批', approved: '已通过', rejected: '已拒绝' }[s] || s)

onMounted(async () => {
  try {
    const [poolRes, vehicleRes, customerRes, reqRes] = await Promise.all([
      poolApi.list({ page: 1, size: 1 }).catch(() => ({ data: { total: 0 } })),
      vehicleApi.list({ page: 1, size: 1 }).catch(() => ({ data: { total: 0 } })),
      customerApi.list({ page: 1, size: 1 }).catch(() => ({ data: { total: 0 } })),
      adminApi.getRequests({ page: 1, size: 5, status: 'pending' }).catch(() => ({ data: { total: 0, list: [] } }))
    ])
    stats.value[0].value = poolRes.data.total
    stats.value[1].value = vehicleRes.data.total
    stats.value[2].value = customerRes.data.total
    stats.value[3].value = reqRes.data.total
    recentRequests.value = reqRes.data.list || []
  } catch (e) {
    // ignore
  }
})
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}
.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
</style>
