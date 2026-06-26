<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>工单管理</span>
          <div class="header-actions">
            <el-input v-model="keyword" placeholder="搜索工单号/客户名" clearable style="width: 220px" @clear="loadData" @keyup.enter="loadData">
              <template #append><el-button @click="loadData"><el-icon><Search /></el-icon></el-button></template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="vin" label="VIN" width="180" show-overflow-tooltip />
        <el-table-column prop="service_dealer" label="服务经销商" width="150" />
        <el-table-column prop="order_type" label="工单类型" width="120" />
        <el-table-column prop="order_date" label="工单日期" width="120" />
        <el-table-column prop="order_content" label="维修内容" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            {{ row.amount ? `¥${Number(row.amount).toLocaleString()}` : '-' }}
          </template>
        </el-table-column>
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
    <el-dialog v-model="detailVisible" title="工单详情" width="600px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="VIN">{{ currentRow.vin }}</el-descriptions-item>
        <el-descriptions-item label="服务经销商">{{ currentRow.service_dealer }}</el-descriptions-item>
        <el-descriptions-item label="工单类型">{{ currentRow.order_type }}</el-descriptions-item>
        <el-descriptions-item label="工单日期">{{ currentRow.order_date }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ currentRow.amount ? `¥${Number(currentRow.amount).toLocaleString()}` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="维修内容" :span="2">{{ currentRow.order_content || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { workOrderApi } from '../api'

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
    const res = await workOrderApi.list({ page: page.value, size: pageSize.value, keyword: keyword.value || undefined })
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
