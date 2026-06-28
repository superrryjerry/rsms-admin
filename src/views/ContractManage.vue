<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>合同管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索VIN/车牌/总部合同编号" clearable style="width: 260px; margin-right: 12px" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="exportData">导出</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="vin" label="VIN" min-width="160" />
        <el-table-column prop="license_plate" label="车牌" width="100" />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column prop="contract_start_date" label="合同开始日期" width="120" />
        <el-table-column prop="contract_end_date" label="合同结束日期" width="120" />
        <el-table-column prop="contract_close_date" label="合同结束确定时间" width="140" />
        <el-table-column prop="contract_type" label="合同类型" width="110" />
        <el-table-column prop="headquarters_contract_no" label="总部合同编号" width="140" />
        <el-table-column prop="contract_set_mileage" label="设置里程" width="100" />
        <el-table-column prop="mileage_used" label="已用里程" width="100" />
        <el-table-column prop="contract_total_count" label="总次数" width="90" />
        <el-table-column prop="contract_done_count" label="已完成次数" width="110" />
        <el-table-column prop="status" label="合同状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 16px; justify-content: flex-end"
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="loadData"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { contractApi } from '../api'

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const loading = ref(false)

const statusMap = { active: '激活状态', closed: '关闭状态', confirmed: '关闭并且确认状态', restarted: '重启状态' }
const statusTypeMap = { active: 'success', closed: 'info', confirmed: 'warning', restarted: 'danger' }
const statusLabel = (s) => statusMap[s] || s
const statusType = (s) => statusTypeMap[s] || ''

const loadData = async () => {
  loading.value = true
  try {
    const res = await contractApi.list({ page: currentPage.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const exportData = () => {
  const token = localStorage.getItem('token')
  window.open(`/api/contracts/export?token=${token}`, '_blank')
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
