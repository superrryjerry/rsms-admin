<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>审批管理</span>
          <div class="header-actions">
            <el-radio-group v-model="statusFilter" @change="loadData" size="small">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button value="pending">待审批</el-radio-button>
              <el-radio-button value="approved">已通过</el-radio-button>
              <el-radio-button value="rejected">已驳回</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="request_type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ typeMap[row.request_type] || row.request_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="request_user_name" label="申请人" width="120" />
        <el-table-column prop="current_dealer_name" label="当前经销商" width="150" />
        <el-table-column prop="vin" label="VIN" width="180" show-overflow-tooltip />
        <el-table-column label="改名详情" width="220">
          <template #default="{ row }">
            <span v-if="row.request_type === 'change_customer'">
              {{ row.old_customer_name }} → {{ row.new_customer_name }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusMap[row.status] || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button type="success" size="small" @click="handleApprove(row)">通过</el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">驳回</el-button>
            </template>
            <span v-else class="text-muted">已处理</span>
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

    <!-- 驳回对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="驳回申请" width="450px">
      <el-form label-width="80px">
        <el-form-item label="驳回原因">
          <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="rejectLoading" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const statusFilter = ref('')

const typeMap = { vehicle_apply: '车辆申请', vehicle_transfer: '车辆转移', vehicle_drop: '车辆退回', claim: '车辆认领', transfer: '经销商转移', change_customer: '客户改名' }
const statusMap = { pending: '待审批', approved: '已通过', rejected: '已驳回' }
const statusTagType = (s) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s] || 'info')

const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const rejectLoading = ref(false)
const currentRow = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getRequests({ page: page.value, size: pageSize.value, status: statusFilter.value || undefined })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm('确认通过该申请？', '审批确认')
  } catch {
    return // 用户取消
  }
  await adminApi.approveRequest(row.id)
  ElMessage.success('已通过')
  loadData()
}

const handleReject = (row) => {
  currentRow.value = row
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  rejectLoading.value = true
  try {
    await adminApi.rejectRequest(currentRow.value.id, { reason: rejectReason.value })
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadData()
  } finally {
    rejectLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.pagination { margin-top: 16px; justify-content: flex-end; }
.text-muted { color: #999; font-size: 13px; }
</style>
