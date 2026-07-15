<template>
  <div class="login-log-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>登录日志</span>
          <div class="header-actions">
            <el-input
              v-model="searchPhone"
              placeholder="搜索账号"
              clearable
              style="width: 200px; margin-right: 10px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="margin-right: 10px"
              @change="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
          </div>
        </div>
      </template>

      <!-- 用户登录汇总 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="登录记录" name="detail">
          <el-table :data="logList" v-loading="loading" stripe border>
            <el-table-column prop="phone" label="登录账号" width="150" />
            <el-table-column prop="user_name" label="用户姓名" width="150" />
            <el-table-column prop="dealer_code" label="经销商代码" width="120" />
            <el-table-column prop="login_time" label="登录时间" width="180" />
            <el-table-column prop="ip_address" label="IP地址" width="150" />
            <el-table-column prop="user_agent" label="设备信息" min-width="200" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="用户登录汇总" name="summary">
          <el-table :data="summaryList" v-loading="loading" stripe border>
            <el-table-column prop="phone" label="登录账号" width="150" />
            <el-table-column prop="user_name" label="用户姓名" width="150" />
            <el-table-column prop="dealer_code" label="经销商代码" width="120" />
            <el-table-column prop="last_login_time" label="最近登录时间" width="180" />
            <el-table-column prop="login_count" label="登录次数" width="120" />
            <el-table-column label="距今天数" width="120">
              <template #default="{ row }">
                <el-tag :type="getDaysDiff(row.last_login_time) > 7 ? 'danger' : 'success'">
                  {{ getDaysDiff(row.last_login_time) }} 天
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 分页 -->
      <div class="pagination" v-if="activeTab === 'detail'">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchLogs"
          @current-change="fetchLogs"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import request from '../api/index'

const activeTab = ref('detail')
const searchPhone = ref('')
const dateRange = ref([])
const logList = ref([])
const summaryList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    if (searchPhone.value) params.phone = searchPhone.value
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    
    const res = await request.get('/admin/login-logs', { params })
    if (res.code === 0) {
      logList.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    console.error('获取登录日志失败:', e)
    ElMessage.error('获取登录日志失败')
  } finally {
    loading.value = false
  }
}

const fetchSummary = async () => {
  loading.value = true
  try {
    const params = {}
    if (searchPhone.value) params.phone = searchPhone.value
    
    const res = await request.get('/admin/login-logs/summary', { params })
    if (res.code === 0) {
      summaryList.value = res.data
    }
  } catch (e) {
    console.error('获取登录汇总失败:', e)
    ElMessage.error('获取登录汇总失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  if (activeTab.value === 'detail') {
    fetchLogs()
  } else {
    fetchSummary()
  }
}

const handleTabChange = (tab) => {
  if (tab === 'detail') {
    fetchLogs()
  } else {
    fetchSummary()
  }
}

const getDaysDiff = (dateStr) => {
  if (!dateStr) return 999
  const loginDate = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - loginDate) / (1000 * 60 * 60 * 24))
  return diff
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.login-log-manage {
  padding: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
