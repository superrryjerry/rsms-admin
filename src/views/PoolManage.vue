<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公海池管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索VIN/客户/车牌/车型" clearable style="width: 280px; margin-right: 10px" @clear="loadData" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
          </div>
        </div>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="vin" label="VIN" width="160" />
        <el-table-column prop="license_plate" label="车牌" width="110" />
        <el-table-column prop="customer_name" label="客户名称" width="150" />
        <el-table-column prop="model" label="车型" />
        <el-table-column prop="vehicle_type" label="车辆类型" width="100" />
        <el-table-column prop="sales_dealer" label="销售经销商" width="120" />
        <el-table-column prop="delivery_date" label="交付日期" width="120" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleClaim(row)">认领</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { poolApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const loadData = async () => {
  loading.value = true
  try {
    const res = await poolApi.list({ page: page.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const handleClaim = async (row) => {
  const { value } = await ElMessageBox.prompt('请输入您的服务经销商代码', '认领车辆', {
    confirmButtonText: '确认认领',
    cancelButtonText: '取消'
  }).catch(() => ({ value: null }))
  if (!value) return
  await poolApi.claim({ vin: row.vin, service_dealer: value })
  ElMessage.success('认领成功')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
