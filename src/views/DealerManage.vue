<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>经销商管理</span>
          <el-button type="primary" @click="showDialog = true">新增经销商</el-button>
        </div>
      </template>
      <el-table :data="dealers" stripe v-loading="loading">
        <el-table-column prop="dealer_code" label="经销商代码" width="150" />
        <el-table-column prop="dealer_name" label="经销商名称" />
        <el-table-column prop="dealer_type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.dealer_type === 'sales' ? '' : row.dealer_type === 'service' ? 'success' : 'warning'" size="small">
              {{ { sales: '销售', service: '服务', both: '销售+服务' }[row.dealer_type] || row.dealer_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
      </el-table>
    </el-card>

    <el-dialog v-model="showDialog" title="新增经销商" width="460px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="经销商代码" required>
          <el-input v-model="form.dealer_code" placeholder="如 D003" />
        </el-form-item>
        <el-form-item label="经销商名称" required>
          <el-input v-model="form.dealer_name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.dealer_type" style="width: 100%">
            <el-option label="销售+服务" value="both" />
            <el-option label="仅销售" value="sales" />
            <el-option label="仅服务" value="service" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '../api'
import { ElMessage } from 'element-plus'

const dealers = ref([])
const loading = ref(false)
const showDialog = ref(false)
const creating = ref(false)
const form = reactive({ dealer_code: '', dealer_name: '', dealer_type: 'both' })

const loadData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getDealers()
    dealers.value = res.data
  } finally { loading.value = false }
}

const handleCreate = async () => {
  if (!form.dealer_code || !form.dealer_name) return ElMessage.warning('请填写完整信息')
  creating.value = true
  try {
    await adminApi.createDealer(form)
    ElMessage.success('创建成功')
    showDialog.value = false
    Object.assign(form, { dealer_code: '', dealer_name: '', dealer_type: 'both' })
    loadData()
  } finally { creating.value = false }
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
