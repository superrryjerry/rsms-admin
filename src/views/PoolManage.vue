<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>公海池管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索VIN/车牌/客户/车型" clearable style="width: 260px; margin-right: 12px" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="exportData">导出</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe>
              <el-table-column prop="vin" label="VIN" min-width="160" />
              <el-table-column prop="vin_full" label="VIN全称" min-width="180" />
              <el-table-column prop="license_plate" label="车牌" width="100" />
              <el-table-column prop="customer_name" label="客户名称" width="120" />
              <el-table-column prop="vehicle_type" label="车辆类型" width="100" />
              <el-table-column prop="sales_dealer" label="销售经销商" width="120" />
              <el-table-column prop="model" label="车型" min-width="120" />
              <el-table-column prop="delivery_date" label="交付日期" width="110" />
              <el-table-column prop="production_date" label="生产日期" width="110" />
              <el-table-column label="车龄" width="100">
                <template #default="{ row }">
                  {{ calcVehicleAge(row.production_date) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleClaim(row)">认领</el-button>
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

    <!-- 认领弹窗 -->
    <el-dialog v-model="claimDialog" title="认领车辆" width="420px">
      <el-form label-width="100px">
        <el-form-item label="VIN">
          <span>{{ claimRow.vin }}</span>
        </el-form-item>
        <el-form-item label="服务经销商">
          <el-select v-model="claimDealer" filterable placeholder="选择经销商">
            <el-option v-for="d in dealers" :key="d.dealer_code" :label="`${d.dealer_code} - ${d.dealer_name}`" :value="d.dealer_code" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="claimDialog = false">取消</el-button>
        <el-button type="primary" :loading="claimLoading" @click="doClaim">确认认领</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { poolApi, adminApi } from '../api'

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const loading = ref(false)
const dealers = ref([])

const claimDialog = ref(false)
const claimRow = ref({})
const claimDealer = ref('')
const claimLoading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await poolApi.list({ page: currentPage.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const loadDealers = async () => {
  const res = await adminApi.getDealers()
  dealers.value = res.data || []
}

const handleClaim = (row) => {
  claimRow.value = row
  claimDealer.value = ''
  claimDialog.value = true
}

const doClaim = async () => {
  if (!claimDealer.value) return ElMessage.warning('请选择服务经销商')
  claimLoading.value = true
  try {
    await poolApi.claim({ vin: claimRow.value.vin, service_dealer: claimDealer.value })
    ElMessage.success('认领成功')
    claimDialog.value = false
    loadData()
  } finally { claimLoading.value = false }
}

const exportData = () => {
  const token = localStorage.getItem('token')
  window.open(`/api/pool/export?token=${token}`, '_blank')
}

// 计算车龄
const calcVehicleAge = (productionDate) => {
  if (!productionDate) return '-'
  const prodDate = new Date(productionDate)
  const now = new Date()
  const years = Math.floor((now - prodDate) / (365.25 * 24 * 60 * 60 * 1000))
  const months = Math.floor((now - prodDate) % (365.25 * 24 * 60 * 60 * 1000) / (30.44 * 24 * 60 * 60 * 1000))
  return years > 0 ? `${years}年${months}个月` : `${months}个月`
}

onMounted(() => { loadData(); loadDealers() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
