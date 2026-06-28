<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>工单管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索VIN/工单号/类型/客户" clearable style="width: 260px; margin-right: 12px" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="exportData">导出</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="vin" label="VIN" min-width="160" />
        <el-table-column prop="order_no" label="工单号" width="140" />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column prop="order_date" label="工单日期" width="110" />
        <el-table-column prop="order_type" label="工单类型" width="110" />
        <el-table-column prop="order_content" label="维修内容" min-width="180" show-overflow-tooltip />
        <el-table-column prop="service_dealer" label="服务经销商" width="120" />
        <el-table-column prop="dealer_code" label="经销商代码" width="110" />
        <el-table-column prop="amount" label="金额" width="100" />
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
import { workOrderApi } from '../api'

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await workOrderApi.list({ page: currentPage.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const exportData = () => {
  const token = localStorage.getItem('token')
  window.open(`/api/workorders/export?token=${token}`, '_blank')
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
