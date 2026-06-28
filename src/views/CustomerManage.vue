<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索客户名称" clearable style="width: 220px; margin-right: 12px" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="exportData">导出</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" border stripe>
        <el-table-column prop="customer_name" label="客户名称" min-width="140" />
        <el-table-column prop="tag" label="标签" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.tag" :type="tagType(row.tag)" size="small">{{ tagLabel(row.tag) }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="所在市" width="100" />
        <el-table-column prop="registration_info" label="注册信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sales_dealers_summary" label="销售经销商汇总" min-width="180" show-overflow-tooltip />
        <el-table-column prop="service_dealers_summary" label="服务经销商汇总" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialog" title="客户详情" width="700px">
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="客户名称">{{ detailData.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-tag v-if="detailData.tag" :type="tagType(detailData.tag)" size="small">{{ tagLabel(detailData.tag) }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="所在市">{{ detailData.city || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册信息">{{ detailData.registration_info || '-' }}</el-descriptions-item>
        <el-descriptions-item label="销售经销商汇总" :span="2">{{ detailData.sales_dealers_summary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务经销商汇总" :span="2">{{ detailData.service_dealers_summary || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>关联车辆</el-divider>
      <el-table :data="detailData?.vehicles || []" border size="small">
        <el-table-column prop="vin" label="VIN" width="160" />
        <el-table-column prop="license_plate" label="车牌" width="100" />
        <el-table-column prop="vehicle_type" label="车辆类型" width="100" />
        <el-table-column prop="sales_dealer" label="销售经销商" width="120" />
        <el-table-column prop="service_dealer" label="服务经销商" width="120" />
        <el-table-column prop="model" label="车型" min-width="120" />
      </el-table>

      <template #footer>
        <el-button @click="detailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { customerApi } from '../api'

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const loading = ref(false)

const detailDialog = ref(false)
const detailData = ref(null)

const tagMap = { core: '核心', focus: '重点', oasis: '绿洲', desert: '沙漠' }
const tagTypeMap = { core: 'danger', focus: 'warning', oasis: 'success', desert: 'info' }
const tagLabel = (t) => tagMap[t] || t
const tagType = (t) => tagTypeMap[t] || ''

const loadData = async () => {
  loading.value = true
  try {
    const res = await customerApi.list({ page: currentPage.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const viewDetail = async (row) => {
  const res = await customerApi.detail(row.customer_name)
  detailData.value = res.data
  detailDialog.value = true
}

const exportData = () => {
  const token = localStorage.getItem('token')
  window.open(`/api/customers/export?token=${token}`, '_blank')
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
