<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>车辆管理</span>
          <div>
            <el-input v-model="keyword" placeholder="搜索VIN/车牌/客户/车型/经销商" clearable style="width: 280px; margin-right: 12px" @keyup.enter="loadData" />
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
        <el-table-column label="车辆年限" width="100">
          <template #default="{ row }">{{ calcAge(row.production_date) }}</template>
        </el-table-column>
        <el-table-column prop="sales_dealer" label="销售经销商" width="120" />
        <el-table-column prop="service_dealer" label="服务经销商" width="120" />
        <el-table-column prop="model" label="车型" min-width="120" />
        <el-table-column prop="delivery_date" label="交付日期" width="110" />
        <el-table-column prop="production_date" label="生产日期" width="110" />
        <el-table-column prop="central_contract" label="中央合同" width="110" />
        <el-table-column prop="annual_income" label="年总收入" width="110" />
        <el-table-column label="操作" width="120" fixed="right">
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
    <el-dialog v-model="detailDialog" title="车辆详情" width="700px">
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="VIN">{{ detailData.vin }}</el-descriptions-item>
        <el-descriptions-item label="VIN全称">{{ detailData.vin_full }}</el-descriptions-item>
        <el-descriptions-item label="车牌">{{ detailData.license_plate }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">
          {{ detailData.customer_name }}
          <el-tag v-if="detailData.customer_history" type="info" size="small" style="margin-left: 8px;">
            曾用名: {{ detailData.customer_history.old_customer_name }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="车辆类型">{{ detailData.vehicle_type }}</el-descriptions-item>
        <el-descriptions-item label="车辆年限">{{ calcAge(detailData.production_date) }}</el-descriptions-item>
        <el-descriptions-item label="销售经销商">{{ detailData.sales_dealer }}</el-descriptions-item>
        <el-descriptions-item label="服务经销商">{{ detailData.service_dealer }}</el-descriptions-item>
        <el-descriptions-item label="车型">{{ detailData.model }}</el-descriptions-item>
        <el-descriptions-item label="交付日期">{{ detailData.delivery_date }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ detailData.production_date }}</el-descriptions-item>
        <el-descriptions-item label="中央合同">{{ detailData.central_contract }}</el-descriptions-item>
        <el-descriptions-item label="年总收入">{{ detailData.annual_income }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>合同记录</el-divider>
      <el-table :data="detailData?.contracts || []" border size="small">
        <el-table-column prop="contract_start_date" label="开始日期" width="110" />
        <el-table-column prop="contract_end_date" label="结束日期" width="110" />
        <el-table-column prop="contract_type" label="合同类型" width="100" />
        <el-table-column prop="headquarters_contract_no" label="总部合同编号" width="130" />
        <el-table-column prop="status" label="状态" width="80" />
      </el-table>

      <el-divider>工单记录</el-divider>
      <el-table :data="detailData?.work_orders || []" border size="small">
        <el-table-column prop="order_no" label="工单号" width="130" />
        <el-table-column prop="order_date" label="日期" width="110" />
        <el-table-column prop="order_type" label="类型" width="100" />
        <el-table-column prop="order_content" label="内容" min-width="160" />
        <el-table-column prop="amount" label="金额" width="100" />
      </el-table>

      <template #footer>
        <el-button @click="detailDialog = false">关闭</el-button>
        <el-button type="warning" @click="openChangeCustomer" v-if="detailData?.permission === 'editable'">更改所属客户</el-button>
      </template>
    </el-dialog>

    <!-- 更改客户弹窗 -->
    <el-dialog v-model="changeCustomerDialog" title="更改车辆所属客户" width="450px">
      <el-form label-width="100px">
        <el-form-item label="VIN">
          <span>{{ changeCustomerForm.vin }}</span>
        </el-form-item>
        <el-form-item label="当前客户">
          <span>{{ changeCustomerForm.oldName }}</span>
        </el-form-item>
        <el-form-item label="新客户名称">
          <el-input v-model="changeCustomerForm.newName" placeholder="请输入新的客户名称" />
        </el-form-item>
        <el-form-item label="申请原因">
          <el-input v-model="changeCustomerForm.reason" type="textarea" :rows="2" placeholder="请输入更改原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeCustomerDialog = false">取消</el-button>
        <el-button type="primary" :loading="changeCustomerLoading" @click="submitChangeCustomer">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { vehicleApi } from '../api'

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const loading = ref(false)

const detailDialog = ref(false)
const detailData = ref(null)

const changeCustomerDialog = ref(false)
const changeCustomerLoading = ref(false)
const changeCustomerForm = ref({ vin: '', oldName: '', newName: '', reason: '' })

const calcAge = (productionDate) => {
  if (!productionDate) return '-'
  const birth = new Date(productionDate)
  const now = new Date()
  const years = ((now - birth) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)
  return years + '年'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await vehicleApi.list({ page: currentPage.value, size: pageSize.value, keyword: keyword.value })
    list.value = res.data.list
    total.value = res.data.total
  } finally { loading.value = false }
}

const viewDetail = async (row) => {
  const res = await vehicleApi.detail(row.vin)
  detailData.value = res.data
  detailDialog.value = true
}

const openChangeCustomer = () => {
  changeCustomerForm.value = {
    vin: detailData.value.vin,
    oldName: detailData.value.customer_name,
    newName: '',
    reason: ''
  }
  changeCustomerDialog.value = true
}

const submitChangeCustomer = async () => {
  if (!changeCustomerForm.value.newName.trim()) {
    ElMessage.warning('请输入新客户名称')
    return
  }
  changeCustomerLoading.value = true
  try {
    await vehicleApi.changeCustomer({
      vin: changeCustomerForm.value.vin,
      new_customer_name: changeCustomerForm.value.newName.trim(),
      reason: changeCustomerForm.value.reason
    })
    ElMessage.success('申请已提交，等待管理员审批')
    changeCustomerDialog.value = false
    // 刷新详情
    const res = await vehicleApi.detail(changeCustomerForm.value.vin)
    detailData.value = res.data
  } finally {
    changeCustomerLoading.value = false
  }
}

const exportData = () => {
  const token = localStorage.getItem('token')
  window.open(`/api/vehicles/export?token=${token}`, '_blank')
}

onMounted(() => { loadData() })
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
