<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>合同管理</span>
          <div class="header-actions">
            <el-input v-model="keyword" placeholder="搜索合同号/客户名" clearable style="width: 220px" @clear="loadData" @keyup.enter="loadData">
              <template #append><el-button @click="loadData"><el-icon><Search /></el-icon></el-button></template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="vin" label="VIN" width="180" show-overflow-tooltip />
        <el-table-column prop="customer_name" label="客户名称" width="150" />
        <el-table-column prop="service_dealer" label="服务经销商" width="150" />
        <el-table-column prop="contract_end_date" label="结束日期" width="120" />
        <el-table-column prop="contract_set_mileage" label="设置里程" width="110" align="right" />
        <el-table-column prop="mileage_used" label="已用里程" width="110" align="right" />
        <el-table-column prop="contract_total_count" label="总次数" width="90" align="right" />
        <el-table-column prop="contract_done_count" label="已完成" width="90" align="right" />
        <el-table-column prop="updated_at" label="更新时间" width="170" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        class="pagination"
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="page"
        @current-change="loadData"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="合同详情" width="600px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="VIN">{{ currentRow.vin }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ currentRow.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="服务经销商">{{ currentRow.service_dealer }}</el-descriptions-item>
        <el-descriptions-item label="结束日期">{{ currentRow.contract_end_date }}</el-descriptions-item>
        <el-descriptions-item label="设置里程">{{ currentRow.contract_set_mileage }}</el-descriptions-item>
        <el-descriptions-item label="已用里程">{{ currentRow.mileage_used }}</el-descriptions-item>
        <el-descriptions-item label="总次数">{{ currentRow.contract_total_count }}</el-descriptions-item>
        <el-descriptions-item label="已完成">{{ currentRow.contract_done_count }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentRow.updated_at }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { contractApi } from '../api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')

const detailVisible = ref(false)
const currentRow = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await contractApi.list({ page: page.value, size: pageSize.value, keyword: keyword.value || undefined })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const showDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
