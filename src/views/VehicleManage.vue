<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>车辆管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索VIN/客户/车牌/车型/经销商" clearable style="width: 300px; margin-right: 10px" @clear="loadData" @keyup.enter="loadData" />
            <el-button type="primary" @click="loadData">搜索</el-button>
          </div>
        </div>
      </template>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="vin" label="VIN" width="160" />
        <el-table-column prop="license_plate" label="车牌" width="110" />
        <el-table-column prop="customer_name" label="客户名称" width="140" />
        <el-table-column prop="model" label="车型" />
        <el-table-column prop="service_dealer" label="服务经销商" width="120" />
        <el-table-column prop="sales_dealer" label="销售经销商" width="120" />
        <el-table-column label="归属" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_mine ? 'success' : 'info'" size="small">{{ row.is_mine ? '我的' : '其他' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
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

    <el-dialog v-model="detailVisible" title="车辆详情" width="700px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="VIN">{{ detail.vin }}</el-descriptions-item>
        <el-descriptions-item label="完整VIN">{{ detail.vin_full }}</el-descriptions-item>
        <el-descriptions-item label="车牌">{{ detail.license_plate }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ detail.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="车型">{{ detail.model }}</el-descriptions-item>
        <el-descriptions-item label="车辆类型">{{ detail.vehicle_type }}</el-descriptions-item>
        <el-descriptions-item label="销售经销商">{{ detail.sales_dealer }}</el-descriptions-item>
        <el-descriptions-item label="服务经销商">{{ detail.service_dealer }}</el-descriptions-item>
        <el-descriptions-item label="交付日期">{{ detail.delivery_date }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ detail.production_date }}</el-descriptions-item>
        <el-descriptions-item label="权限" :span="2">
          <el-tag :type="detail.permission === 'editable' ? 'success' : 'warning'">
            {{ detail.permission === 'editable' ? '可编辑' : '只读' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="detail?.contracts?.length" style="margin-top: 16px">
        <h4>关联合同</h4>
        <el-table :data="detail.contracts" stripe size="small">
          <el-table-column prop="contract_end_date" label="结束日期" />
          <el-table-column prop="contract_set_mileage" label="设置里程" />
          <el-table-column prop="mileage_used" label="已用里程" />
          <el-table-column prop="contract_total_count" label="总次数" />
          <el-table-column prop="contract_done_count" label="已完成" />
          <el-table-column prop="status" label="状态" />
        </el-table>
      </div>

      <div v-if="detail?.work_orders?.length" style="margin-top: 16px">
        <h4>工单记录</h4>
        <el-table :data="detail.work_orders" stripe size="small">
          <el-table-column prop="order_date" label="日期" width="120" />
          <el-table-column prop="order_type" label="类型" width="100" />
          <el-table-column prop="order_content" label="内容" />
          <el-table-column prop="service_dealer" label="服务经销商" width="120" />
          <el-table-column prop="amount" label="金额" width="100" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { vehicleApi } from '../api'

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
    const res = await vehicleApi.list({ page: page.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const showDetail = async (row) => {
  const res = await vehicleApi.detail(row.vin)
  detail.value = res.data
  detailVisible.value = true
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
