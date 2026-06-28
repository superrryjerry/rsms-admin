<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>经销商管理</span>
          <el-button type="primary" @click="openCreateDialog">新增经销商</el-button>
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
        <el-table-column prop="parent_dealer_code" label="父经销商" width="120" />
        <el-table-column prop="level" label="层级" width="80" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑经销商' : '新增经销商'" width="460px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="经销商代码" required>
          <el-input v-model="form.dealer_code" placeholder="如 D003" :disabled="isEdit" />
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
        <el-form-item label="父经销商">
          <el-select v-model="form.parent_dealer_code" placeholder="无（一级经销商）" clearable style="width: 100%">
            <el-option v-for="d in parentDealers" :key="d.dealer_code" :label="`${d.dealer_code} - ${d.dealer_name}`" :value="d.dealer_code" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">{{ isEdit ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const dealers = ref([])
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const editCode = ref('')
const form = reactive({ dealer_code: '', dealer_name: '', dealer_type: 'both', parent_dealer_code: '' })

// 可选的父经销商（排除自己）
const parentDealers = computed(() => {
  if (isEdit.value) {
    return dealers.value.filter(d => d.dealer_code !== editCode.value)
  }
  return dealers.value
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getDealers()
    dealers.value = res.data
  } finally { loading.value = false }
}

const openCreateDialog = () => {
  isEdit.value = false
  editCode.value = ''
  Object.assign(form, { dealer_code: '', dealer_name: '', dealer_type: 'both', parent_dealer_code: '' })
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  editCode.value = row.dealer_code
  Object.assign(form, {
    dealer_code: row.dealer_code,
    dealer_name: row.dealer_name,
    dealer_type: row.dealer_type,
    parent_dealer_code: row.parent_dealer_code || ''
  })
  showDialog.value = true
}

const handleSubmit = async () => {
  if (!form.dealer_code || !form.dealer_name) return ElMessage.warning('请填写完整信息')
  submitting.value = true
  try {
    if (isEdit.value) {
      await adminApi.updateDealer(editCode.value, {
        dealer_name: form.dealer_name,
        dealer_type: form.dealer_type,
        parent_dealer_code: form.parent_dealer_code || null
      })
      ElMessage.success('更新成功')
    } else {
      await adminApi.createDealer({
        dealer_code: form.dealer_code,
        dealer_name: form.dealer_name,
        dealer_type: form.dealer_type,
        parent_dealer_code: form.parent_dealer_code || null
      })
      ElMessage.success('创建成功')
    }
    showDialog.value = false
    loadData()
  } finally { submitting.value = false }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除经销商 "${row.dealer_name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await adminApi.deleteDealer(row.dealer_code)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      // 错误已在api拦截器中处理
    }
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
