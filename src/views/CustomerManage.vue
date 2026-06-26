<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索客户名称" clearable style="width: 240px; margin-right: 10px" @clear="loadData" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
          </div>
        </div>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="customer_name" label="客户名称" />
        <el-table-column prop="sales_dealers_summary" label="销售经销商" />
        <el-table-column prop="service_dealers_summary" label="服务经销商" />
        <el-table-column label="归属" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_mine ? 'success' : 'info'" size="small">{{ row.is_mine ? '我的' : '其他' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="showDetail(row)">详情</el-button>
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

    <el-dialog v-model="detailVisible" :title="detail?.customer_name || '客户详情'" width="800px">
      <div v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户名称">{{ detail.customer_name }}</el-descriptions-item>
          <el-descriptions-item label="销售经销商">{{ detail.sales_dealers_summary }}</el-descriptions-item>
          <el-descriptions-item label="服务经销商">{{ detail.service_dealers_summary }}</el-descriptions-item>
          <el-descriptions-item label="车辆数">{{ detail.vehicles?.length || 0 }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="detail.vehicles?.length" style="margin-top: 16px">
          <h4>关联车辆</h4>
          <el-table :data="detail.vehicles" stripe size="small">
            <el-table-column prop="vin" label="VIN" width="160" />
            <el-table-column prop="license_plate" label="车牌" width="110" />
            <el-table-column prop="model" label="车型" />
            <el-table-column prop="service_dealer" label="服务经销商" width="120" />
          </el-table>
        </div>

        <div v-if="detail.work_orders?.length" style="margin-top: 16px">
          <h4>工单记录</h4>
          <el-table :data="detail.work_orders" stripe size="small">
            <el-table-column prop="order_date" label="日期" width="120" />
            <el-table-column prop="order_type" label="类型" width="100" />
            <el-table-column prop="order_content" label="内容" />
            <el-table-column prop="amount" label="金额" width="100" />
          </el-table>
        </div>

        <div v-if="detail.activities?.length" style="margin-top: 16px">
          <h4>销售活动</h4>
          <el-table :data="detail.activities" stripe size="small">
            <el-table-column prop="visit_method" label="拜访方式" width="100" />
            <el-table-column prop="visit_purpose" label="目的" />
            <el-table-column prop="content" label="内容" />
            <el-table-column prop="status" label="状态" width="80" />
            <el-table-column prop="created_at" label="时间" width="170" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { customerApi } from '../api'

const list = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const detailVisible = ref(false)
const detail = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await customerApi.list({ page: page.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const showDetail = async (row) => {
  const res = await customerApi.detail(row.customer_name)
  detail.value = res.data
  detailVisible.value = true
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
