<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>线索管理</span>
          <div>
            <el-select v-model="filter.status" placeholder="状态" clearable style="width: 120px; margin-right: 10px" @change="loadData">
              <el-option label="待处理" value="pending" />
              <el-option label="已读" value="read" />
              <el-option label="已处理" value="handled" />
            </el-select>
            <el-select v-model="filter.lead_type" placeholder="类型" clearable style="width: 160px" @change="loadData">
              <el-option label="合同时间预警" value="contract_time" />
              <el-option label="合同里程预警" value="contract_mileage" />
              <el-option label="合同次数预警" value="contract_count" />
              <el-option label="质保预警" value="warranty" />
            </el-select>
          </div>
        </div>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="vin" label="VIN" width="160" />
        <el-table-column prop="lead_type" label="线索类型" width="130">
          <template #default="{ row }">
            <el-tag size="small" :type="leadTypeColor(row.lead_type)">{{ leadTypeText(row.lead_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="trigger_value" label="触发值" />
        <el-table-column prop="threshold_value" label="阈值" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" @click="handleRead(row)">标为已读</el-button>
            <el-button v-if="row.status !== 'handled'" size="small" type="primary" @click="handleHandled(row)">标为已处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page" v-model:page-size="pageSize" :total="total"
        :page-sizes="[20, 50, 100]" layout="total, sizes, prev, pager, next"
        @size-change="loadData" @current-change="loadData"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { leadApi } from '../api'
import { ElMessage } from 'element-plus'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filter = reactive({ status: '', lead_type: '' })

const leadTypeText = (t) => ({ contract_time: '合同时间', contract_mileage: '合同里程', contract_count: '合同次数', warranty: '质保' }[t] || t)
const leadTypeColor = (t) => ({ contract_time: '', contract_mileage: 'warning', contract_count: 'info', warranty: 'danger' }[t] || '')
const statusType = (s) => ({ pending: 'warning', read: '', handled: 'success' }[s] || 'info')
const statusText = (s) => ({ pending: '待处理', read: '已读', handled: '已处理' }[s] || s)

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, size: pageSize.value }
    if (filter.status) params.status = filter.status
    if (filter.lead_type) params.lead_type = filter.lead_type
    const res = await leadApi.list(params)
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const handleRead = async (row) => {
  await leadApi.markRead(row.id)
  ElMessage.success('已标为已读')
  loadData()
}

const handleHandled = async (row) => {
  await leadApi.markHandled(row.id)
  ElMessage.success('已标为已处理')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
